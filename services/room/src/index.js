const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const prisma = require('./config/database')
const { createKafkaClient, createProducer, createConsumer } = require('./utils/kafka')
const RoomSocketHandler = require('./handlers/roomSocketHandler')
const roomRoutes = require('./routes/roomRoutes')

const PORT = process.env.PORT || 8082

async function startServer() {
    // ===== KAFKA =====
    const kafka = createKafkaClient()
    const producer = await createProducer(kafka)

    // ===== EXPRESS =====
    const app = express()

    // Middleware
    app.use(express.json())

    // Attach prisma and kafka producer to request
    app.use((req, res, next) => {
        req.prisma = prisma
        req.kafkaProducer = producer
        next()
    })

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', service: 'room-service' })
    })

    // Mount room routes
    app.use('/rooms', roomRoutes)

    // ===== HTTP SERVER =====
    const server = http.createServer(app)

    // ===== SOCKET.IO =====
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        transports: ['websocket', 'polling']
    })
    const consumer = await createConsumer(kafka, 'room-service-group')

    // Consumer cho evt.broadcast để lắng nghe role assignments
    const broadcastConsumer = kafka.consumer({ groupId: 'room-service-broadcast' })
    await broadcastConsumer.connect()
    await broadcastConsumer.subscribe({ topic: 'evt.broadcast', fromBeginning: false })

    const socketHandler = new RoomSocketHandler(prisma, producer, io)

    // Lắng nghe role assignments từ gameplay service
    await broadcastConsumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return

            try {
                const event = JSON.parse(message.value.toString())
                const { roomId, event: eventData } = event

                // Lắng nghe GAME_ROLE_ASSIGNMENT_LIST để lưu role assignments
                if (eventData?.type === 'GAME_ROLE_ASSIGNMENT_LIST' && eventData?.payload?.assignment) {
                    console.log(`[BROADCAST] Received GAME_ROLE_ASSIGNMENT_LIST for room ${roomId}`)
                    await socketHandler.handleRoleAssignmentList(roomId, eventData.payload.assignment)
                }

                // Lắng nghe GAME_ROLE_ASSIGNED để re-emit qua room socket (fallback)
                if (eventData?.type === 'GAME_ROLE_ASSIGNED' && eventData?.payload && roomId) {
                    const targetUserId = event.targetUserId || eventData.payload?.userId
                    const targetUsername = eventData.payload?.username || eventData.payload?.displayname
                    console.log(`[BROADCAST] Received GAME_ROLE_ASSIGNED for room ${roomId}, userId: ${targetUserId}, username: ${targetUsername}, role: ${eventData.payload?.role}`)

                    // Lấy tất cả sockets trong room
                    const allSocketsInRoom = Array.from(io.sockets.sockets.values())
                        .filter(s => s.data.currentRoomId === roomId)

                    console.log(`[BROADCAST] Found ${allSocketsInRoom.length} sockets in room ${roomId}`)
                    allSocketsInRoom.forEach(s => {
                        console.log(`  - Socket ${s.id}: userId=${s.data.userId}, playerId=${s.data.playerId}, displayname=${s.data.displayname}`)
                    })

                    // Tìm socket match: ưu tiên userId, sau đó match bằng username/displayname cho anonymous users
                    let playerSockets = []

                    if (targetUserId) {
                        // Authenticated user: match bằng userId
                        playerSockets = allSocketsInRoom.filter(s => {
                            if (s.data.userId === targetUserId) return true
                            if (eventData.payload?.userId && s.data.userId === eventData.payload.userId) return true
                            if (String(s.data.userId) === String(targetUserId)) return true
                            if (String(s.data.userId).toLowerCase() === String(targetUserId).toLowerCase()) return true
                            return false
                        })
                    } else if (targetUsername) {
                        // Anonymous user: match bằng displayname/username
                        playerSockets = allSocketsInRoom.filter(s => {
                            if (!s.data.userId && s.data.displayname === targetUsername) return true
                            if (!s.data.userId && String(s.data.displayname) === String(targetUsername)) return true
                            return false
                        })
                    }

                    if (playerSockets.length > 0) {
                        for (const playerSocket of playerSockets) {
                            playerSocket.emit('GAME_ROLE_ASSIGNED', {
                                payload: eventData.payload
                            })
                            console.log(`[BROADCAST] ✅ Re-emitted GAME_ROLE_ASSIGNED to socket ${playerSocket.id} (userId: ${playerSocket.data.userId}, displayname: ${playerSocket.data.displayname}), role: ${eventData.payload.role}`)
                        }
                    } else {
                        // Fallback: nếu không tìm thấy, không emit (để tránh tất cả nhận cùng role)
                        console.warn(`[BROADCAST] ⚠️ No socket found for userId=${targetUserId}, username=${targetUsername} in room ${roomId}`)
                    }
                }
            } catch (err) {
                console.error('[BROADCAST] Error processing broadcast event:', err)
            }
        }
    })

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return

            let command
            try {
                command = JSON.parse(message.value.toString())
            } catch {
                console.warn('Invalid Kafka message')
                return
            }

            switch (command.action?.type) {
                case 'ROOM_JOIN':
                    await socketHandler.handleRoomJoin(command)
                    break
                case 'ROOM_LEAVE':
                    await socketHandler.handleRoomLeave(command)
                    break
                default:
                    console.warn('Unknown command', command.action?.type)
            }
        }
    })

    // ===== SOCKET EVENTS =====
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('CREATE_ROOM', (data) => socketHandler.handleCreateRoom(socket, data))
        socket.on('JOIN_ROOM', (data) => socketHandler.handleJoinRoom(socket, data))
        socket.on('LEAVE_ROOM', (data) => socketHandler.handleLeaveRoom(socket, data))
        socket.on('START_GAME', (data) => {
            console.log(`[SERVER_DEBUG] START_GAME event received from socket ${socket.id}`);
            socketHandler.handleStartGame(socket, data);
        })
        socket.on('UPDATE_ROOM', (data) => socketHandler.handleUpdateRoom(socket, data))
        socket.on('KICK_PLAYER', (data) => socketHandler.handleKickPlayer(socket, data))
        socket.on('GET_ROOM_INFO', (data) => socketHandler.handleGetRoomInfo(socket, data))
        socket.on('UPDATE_PLAYER_NAME', (data) => socketHandler.handleUpdatePlayerName(socket, data))

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id)
            socketHandler.handleDisconnect(socket)
        })
    })

    server.listen(PORT, () => {
        console.log(`Room service listening on port ${PORT}`)
        console.log(`Socket.IO endpoint: ws://localhost:${PORT}`)
        console.log(`Health check: http://localhost:${PORT}/health`)
    })

    return { app, prisma, producer };
}

async function stopServer(resources) {
    const { prisma, producer } = resources;

    if (producer) {
        await producer.disconnect();
    }

    if (prisma) {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    startServer().catch(console.error);
}

module.exports = { startServer, stopServer }
