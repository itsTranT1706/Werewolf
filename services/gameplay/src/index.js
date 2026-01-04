import { Kafka } from 'kafkajs'
import { assignRoles, validateRoleAssignment } from './utils/roleAssignment.js'
import { getFactionFromRole } from './constants/roles.js'

const kafka = new Kafka({
    clientId: 'gameplay-service',
    brokers: [process.env.KAFKA_BROKERS || 'kafka:9092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'gameplay-service' })

async function startGameplayService() {
    await producer.connect()
    await consumer.connect()

    await consumer.subscribe({ topic: 'cmd.ingest', fromBeginning: false })

    console.log('🎮 Gameplay Service started')
    console.log('📡 Listening to cmd.ingest topic')

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const command = JSON.parse(message.value.toString())
                await handleCommand(command)
            } catch (err) {
                console.error('Error processing command:', err)
            }
        }
    })
}

async function handleCommand(command) {
    const { action, roomId, userId } = command

    console.log('📥 Received command:', action?.type, { roomId, userId })
    console.log('📦 Full command:', JSON.stringify(command, null, 2))

    if (!action || !action.type) {
        console.error('❌ Invalid command structure:', command)
        return
    }

    switch (action.type) {
        case 'GAME_START':
            // ✅ Truyền action.payload (không phải command.payload)
            await handleGameStart(roomId, action.payload, command)
            break

        case 'ROOM_JOIN':
            // Có thể track players trong room
            console.log('Player joined room:', { roomId, userId })
            break

        default:
            console.log('Unknown action type:', action.type)
    }
}

/**
 * Xử lý khi game bắt đầu - Phân vai trò
 */
async function handleGameStart(roomId, payload, command = {}) {
    // Validate payload exists
    if (!payload) {
        console.error('❌ No payload in GAME_START command')
        await publishEvent('evt.broadcast', {
            traceId: command.traceId || generateTraceId(),
            roomId,
            event: {
                type: 'GAME_START_ERROR',
                payload: {
                    message: 'Thiếu thông tin players trong command'
                }
            },
            ts: Date.now()
        })
        return
    }

    const { players } = payload // Array of { userId, username }

    // Validate số lượng người chơi
    if (!players || players.length < 8) {
        console.error(`❌ Not enough players: ${players?.length || 0}/8 minimum`)

        // Publish error event
        await publishEvent('evt.broadcast', {
            traceId: command.traceId || generateTraceId(),
            roomId,
            event: {
                type: 'GAME_START_ERROR',
                payload: {
                    message: 'Cần ít nhất 8 người chơi để bắt đầu game',
                    currentCount: players?.length || 0,
                    requiredCount: 8
                }
            },
            ts: Date.now()
        })
        return
    }

    if (players.length > 16) {
        console.warn(`⚠️ Too many players: ${players.length} (max 16 recommended)`)
    }

    console.log(`🎲 Starting game for room ${roomId} with ${players.length} players`)

    try {
        // 1. Phân vai trò
        const roleIds = assignRoles(players.length)

        // 2. Validate
        const validation = validateRoleAssignment(roleIds, players.length)
        if (!validation.valid) {
            console.error('❌ Invalid role assignment:', validation.error)

            await publishEvent('evt.broadcast', {
                traceId: command.traceId || generateTraceId(),
                roomId,
                event: {
                    type: 'GAME_START_ERROR',
                    payload: {
                        message: validation.error
                    }
                },
                ts: Date.now()
            })
            return
        }

        // 3. Gán vai trò cho từng player
        const playersWithRoles = players.map((player, index) => ({
            ...player,
            assignedRole: roleIds[index],
            roleName: getRoleName(roleIds[index]),
            faction: getFactionFromRole(roleIds[index])
        }))

        console.log('✅ Roles assigned:')
        playersWithRoles.forEach(p => {
            console.log(`   ${p.username}: ${p.assignedRole} (${p.roleName})`)
        })

        // 4. Publish GAME_ROLE_ASSIGNED event cho từng player
        const traceId = command.traceId || generateTraceId()

        for (const player of playersWithRoles) {
            await publishEvent('evt.broadcast', {
                traceId,
                roomId,
                targetUserId: player.userId, // Gửi riêng cho từng player
                event: {
                    type: 'GAME_ROLE_ASSIGNED',
                    payload: {
                        userId: player.userId,
                        role: player.assignedRole,
                        roleName: player.roleName,
                        faction: player.faction
                    }
                },
                ts: Date.now()
            })

            console.log(`📤 Sent role assignment to ${player.username}: ${player.assignedRole}`)
        }

        // 5. Publish GAME_STARTED event cho tất cả
        await publishEvent('evt.broadcast', {
            traceId,
            roomId,
            event: {
                type: 'GAME_STARTED',
                payload: {
                    roomId,
                    playerCount: players.length,
                    message: 'Game đã bắt đầu!'
                }
            },
            ts: Date.now()
        })

        console.log(`🎉 Game started for room ${roomId}`)

    } catch (err) {
        console.error('Error starting game:', err)

        await publishEvent('evt.broadcast', {
            traceId: command.traceId || generateTraceId(),
            roomId,
            event: {
                type: 'GAME_START_ERROR',
                payload: {
                    message: 'Lỗi khi khởi tạo game: ' + err.message
                }
            },
            ts: Date.now()
        })
    }
}

/**
 * Publish event to Kafka
 */
async function publishEvent(topic, event) {
    try {
        await producer.send({
            topic,
            messages: [{
                value: JSON.stringify(event)
            }]
        })
    } catch (err) {
        console.error('Failed to publish event:', err)
        throw err
    }
}

/**
 * Get role name by ID
 */
function getRoleName(roleId) {
    const roleMap = {
        'BODYGUARD': 'Bảo Vệ',
        'WATCHMAN': 'Người Canh Gác',
        'SEER': 'Thầy Bói',
        'DETECTIVE': 'Thám Tử',
        'MEDIUM': 'Thầy Đồng',
        'SOUL_BINDER': 'Kẻ Gắn Hồn',
        'MAYOR': 'Thị Trưởng',
        'WITCH': 'Phù Thủy',
        'MONSTER_HUNTER': 'Thợ Săn Quái Thú',
        'TRAITOR': 'Bán Sói',
        'YOUNG_WOLF': 'Sói Trẻ',
        'DARK_WOLF': 'Sói Hắc Ám',
        'ALPHA_WOLF': 'Sói Đầu Đàn',
        'PROPHET_WOLF': 'Sói Tiên Tri',
        'FOOL': 'Thằng Ngố',
        'SERIAL_KILLER': 'Sát Nhân Hàng Loạt',
        'VILLAGER': 'Dân Làng'
    }
    return roleMap[roleId] || roleId
}

function generateTraceId() {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Start service
startGameplayService().catch((err) => {
    console.error('Failed to start gameplay service:', err)
    process.exit(1)
})