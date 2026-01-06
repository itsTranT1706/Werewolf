/**
 * Room Service (Phiên bản đơn giản dùng Redis)
 *
 * Service này khớp với frontend hiện tại:
 * - API qua API Gateway:        /api/v1/rooms/...
 * - Đường dẫn thực trong service: /rooms, /rooms/:roomId, /rooms/:roomId/join, /rooms/:roomId/leave
 * - roomId ở đây chính là mã phòng 4 chữ số
 *
 * Lưu trữ:
 * - Redis key: room:{roomId}  -> JSON room
 * - Cấu trúc room:
 *   {
 *     id: string       // roomId (4 chữ số)
 *     maxPlayers: number
 *     availableRoles: string[]
 *     hostId: string
 *     players: [
 *       { id, userId, username, isHost, isGuest }
 *     ],
 *     createdAt: number
 *   }
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const PORT = process.env.PORT || 8082;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// -------------------------------
// Redis client
// -------------------------------
const redis = createClient({ url: REDIS_URL });

redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
        console.log('✅ Connected to Redis at', REDIS_URL);
    }
}

// -------------------------------
// Helpers
// -------------------------------
function generateRoomId() {
    // 4 chữ số, từ 1000–9999
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function getRoomKey(roomId) {
    return `room:${roomId}`;
}

async function loadRoom(roomId) {
    const json = await redis.get(getRoomKey(roomId));
    return json ? JSON.parse(json) : null;
}

async function saveRoom(room) {
    await redis.set(getRoomKey(room.id), JSON.stringify(room));
}

// -------------------------------
// Express app & routes
// -------------------------------
async function startServer() {
    await connectRedis();

    const app = express();

    app.use(cors());
    app.use(express.json());

    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', service: 'room-service' });
    });

    /**
     * POST /rooms
     * Body: { maxPlayers, availableRoles, isPrivate, username, userId }
     *
     * - Tạo mã phòng 4 chữ số
     * - Người tạo phòng luôn là host và tự được add vào danh sách players
     */
    app.post('/rooms', async (req, res) => {
        try {
            const {
                maxPlayers = 12,
                availableRoles = [],
                isPrivate = false, // hiện tại chỉ lưu lại cho tương lai
                username,
                userId,
            } = req.body || {};

            if (!Array.isArray(availableRoles) || availableRoles.length === 0) {
                return res.status(400).json({ error: 'availableRoles is required' });
            }

            // Lấy userId từ header nếu body không có
            const effectiveUserId =
                userId || req.headers['x-user-id'] || `guest-${Date.now()}`;

            const displayName =
                username ||
                req.headers['x-username'] ||
                `Khách_${Math.floor(Math.random() * 10000)}`;

            // Sinh roomId duy nhất
            let roomId;
            let attempts = 0;
            do {
                roomId = generateRoomId();
                attempts += 1;
                if (attempts > 50) {
                    return res
                        .status(500)
                        .json({ error: 'Không thể tạo được mã phòng, vui lòng thử lại' });
                }
            } while (await loadRoom(roomId));

            const now = Date.now();

            const hostPlayer = {
                id: effectiveUserId,
                userId: effectiveUserId,
                username: displayName,
                isHost: true,
                isGuest: !req.headers.authorization, // nếu không có Bearer token thì coi như guest
                joinedAt: now,
            };

            const room = {
                id: roomId,
                maxPlayers,
                availableRoles,
                isPrivate,
                hostId: effectiveUserId,
                players: [hostPlayer],
                createdAt: now,
            };

            await saveRoom(room);

            console.log('🏗️ Room created:', {
                roomId,
                hostId: room.hostId,
                maxPlayers,
                availableRolesCount: availableRoles.length,
            });

            res.status(201).json({ room });
        } catch (err) {
            console.error('Error creating room:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * GET /rooms/:roomId
     * Lấy thông tin phòng + danh sách người chơi
     */
    app.get('/rooms/:roomId', async (req, res) => {
        try {
            const { roomId } = req.params;
            const room = await loadRoom(roomId);

            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }

            res.json({ room });
        } catch (err) {
            console.error('Error getting room:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * POST /rooms/:roomId/join
     * Body: { password?, username?, userId? }
     *
     * - Nếu user đã trong phòng thì chỉ trả về room (không add trùng)
     * - Người đầu tiên join (nếu vì lý do gì đó phòng chưa có host) sẽ là host
     */
    app.post('/rooms/:roomId/join', async (req, res) => {
        try {
            const { roomId } = req.params;
            const { username, userId } = req.body || {};

            const room = await loadRoom(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }

            const effectiveUserId =
                userId || req.headers['x-user-id'] || `guest-${Date.now()}`;

            const displayName =
                username ||
                req.headers['x-username'] ||
                `Khách_${Math.floor(Math.random() * 10000)}`;

            // Nếu đã tồn tại player có cùng userId thì trả về luôn (tránh trùng)
            const existing = room.players.find(
                (p) => String(p.userId) === String(effectiveUserId)
            );
            if (existing) {
                console.log(
                    `👥 User ${effectiveUserId} đã ở trong phòng ${roomId}, không thêm trùng`
                );
                return res.json({ room });
            }

            if (room.players.length >= room.maxPlayers) {
                return res.status(400).json({ error: 'Room is full' });
            }

            const now = Date.now();
            const newPlayer = {
                id: effectiveUserId,
                userId: effectiveUserId,
                username: displayName,
                isHost: room.players.length === 0,
                isGuest: !req.headers.authorization,
                joinedAt: now,
            };

            room.players.push(newPlayer);

            // Nếu phòng chưa có hostId thì gán người này
            if (!room.hostId) {
                room.hostId = effectiveUserId;
            }

            await saveRoom(room);

            console.log('👤 Player joined room:', {
                roomId,
                userId: effectiveUserId,
                username: displayName,
            });

            res.json({ room });
        } catch (err) {
            console.error('Error joining room:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * POST /rooms/:roomId/leave
     *
     * - Lấy userId từ header hoặc body
     * - Nếu host rời đi, tự động gán host mới (player đầu tiên còn lại) nếu có
     */
    app.post('/rooms/:roomId/leave', async (req, res) => {
        try {
            const { roomId } = req.params;
            const { userId } = req.body || {};

            const room = await loadRoom(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }

            const effectiveUserId =
                userId || req.headers['x-user-id'] || req.headers['x-player-id'];

            if (!effectiveUserId) {
                return res.status(400).json({ error: 'userId is required to leave' });
            }

            const beforeCount = room.players.length;
            room.players = room.players.filter(
                (p) => String(p.userId) !== String(effectiveUserId)
            );

            // Nếu không có ai rời thì coi như thành công nhưng không sửa dữ liệu
            if (room.players.length === beforeCount) {
                return res.json({ room });
            }

            // Nếu host rời đi -> gán host mới
            if (room.hostId && String(room.hostId) === String(effectiveUserId)) {
                const newHost = room.players[0];
                if (newHost) {
                    newHost.isHost = true;
                    room.hostId = newHost.userId;
                } else {
                    // Nếu không còn ai trong phòng, có thể xoá phòng luôn
                    await redis.del(getRoomKey(roomId));
                    console.log('🗑️ Room deleted vì không còn người chơi:', roomId);
                    return res.json({ room: null });
                }
            }

            await saveRoom(room);

            console.log('🚪 Player left room:', {
                roomId,
                userId: effectiveUserId,
            });

            res.json({ room });
        } catch (err) {
            console.error('Error leaving room:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.listen(PORT, () => {
        console.log(`🏰 Room service listening on port ${PORT}`);
    });

    return { app, redis };
}

async function stopServer(resources) {
    const { redis: redisClient } = resources || {};
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
    }
}

if (require.main === module) {
    startServer().catch((err) => {
        console.error('Failed to start room service:', err);
        process.exit(1);
    });
}

module.exports = { startServer, stopServer };
