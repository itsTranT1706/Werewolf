/**
 * Room Service - Event-Driven Architecture
 * 
 * Luồng:
 * 1. Frontend → API Gateway → Kafka cmd.ingest (CREATE_ROOM, JOIN_ROOM)
 * 2. Room Service consume cmd.ingest → xử lý với PostgreSQL
 * 3. Room Service emit events → Kafka evt.broadcast
 * 4. API Gateway broadcast qua Socket.io
 */

const { PrismaClient } = require('@prisma/client');
const { Kafka } = require('kafkajs');
const RoomRepository = require('./repositories/roomRepository');

const PORT = process.env.PORT || 8082;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@database:5432/profile_service_db?schema=public';
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');

// Initialize Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

// Initialize Kafka
const kafka = new Kafka({
  clientId: 'room-service',
  brokers: KAFKA_BROKERS
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'room-service-cmd' });

// Initialize Repository
const roomRepository = new RoomRepository(prisma, producer);

async function startService() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Connect Kafka
    await producer.connect();
    await consumer.connect();
    console.log('✅ Connected to Kafka');

    // Subscribe to cmd.ingest
    await consumer.subscribe({ topic: 'cmd.ingest', fromBeginning: false });
    console.log('📡 Subscribed to cmd.ingest');

    // Process commands
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const command = JSON.parse(message.value.toString());
          await handleCommand(command);
        } catch (err) {
          console.error('❌ Error processing command:', err);
        }
      }
    });

    console.log('🏰 Room Service started on port', PORT);
  } catch (error) {
    console.error('❌ Failed to start service:', error);
    process.exit(1);
  }
}

/**
 * Handle commands from Kafka
 */
async function handleCommand(command) {
  const { action, userId, roomId, traceId } = command;

  if (!action || !action.type) {
    console.error('❌ Invalid command:', command);
    return;
  }

  console.log(`📥 Command: ${action.type}`, { userId, roomId, traceId });

  try {
    switch (action.type) {
      case 'CREATE_ROOM':
        await handleCreateRoom(command);
        break;

      case 'JOIN_ROOM':
        await handleJoinRoom(command);
        break;

      case 'LEAVE_ROOM':
        await handleLeaveRoom(command);
        break;

      case 'ROOM_JOIN':
        // Socket join room - không cần xử lý gì
        console.log(`👤 User ${userId} socket joined room ${roomId}`);
        break;

      default:
        console.log(`⚠️ Unknown command: ${action.type}`);
    }
  } catch (error) {
    console.error(`❌ Error handling ${action.type}:`, error);
    // Emit error event
    await emitEvent('evt.broadcast', {
      traceId,
      roomId,
      targetUserId: userId,
      event: {
        type: `${action.type}_ERROR`,
        payload: {
          message: error.message
        }
      },
      ts: Date.now()
    });
  }
}

/**
 * CREATE_ROOM command handler
 */
async function handleCreateRoom(command) {
  const { userId, action, traceId } = command;
  const { name, maxPlayers = 75, availableRoles, username } = action.payload;

  console.log(`🏗️ Creating room: ${name} by ${username} (${userId})`);

  // Validate
  if (!name || name.trim().length === 0) {
    throw new Error('Room name is required');
  }

  if (maxPlayers < 3 || maxPlayers > 75) {
    throw new Error('Max players must be between 3 and 75');
  }

  // Create room
  const room = await roomRepository.create({
    name: name.trim(),
    hostDisplayname: username || 'Anonymous Host',
    hostId: userId,
    maxPlayers: maxPlayers + 1, // +1 để tính cả quản trò
    settings: { availableRoles }
  });

  console.log(`✅ Room created: ${room.code}`);

  // Emit ROOM_CREATED event
  await emitEvent('evt.broadcast', {
    traceId,
    roomId: room.code,
    targetUserId: userId,
    event: {
      type: 'ROOM_CREATED',
      payload: {
        room: formatRoom(room)
      }
    },
    ts: Date.now()
  });
}

/**
 * JOIN_ROOM command handler
 */
async function handleJoinRoom(command) {
  const { userId, action, traceId } = command;
  const { roomCode, username } = action.payload;

  console.log(`👋 User ${username} (${userId}) joining room ${roomCode}`);

  // Get room
  const room = await roomRepository.findByCode(roomCode);
  if (!room) {
    throw new Error('Room not found');
  }

  // Check if full
  if (room.currentPlayers >= room.maxPlayers) {
    throw new Error('Room is full');
  }

  // Check if game started
  if (room.status !== 'WAITING') {
    throw new Error('Game has already started');
  }

  // Check if already joined
  if (userId) {
    const existing = await roomRepository.findPlayerByUserId(room.id, userId);
    if (existing) {
      throw new Error('You are already in this room');
    }
  }

  // Add player
  const result = await roomRepository.addPlayer(room.id, {
    displayname: username || 'Anonymous Player',
    userId,
    isHost: false
  });

  console.log(`✅ User ${username} joined room ${roomCode}`);

  // PLAYER_JOINED event đã được emit trong roomRepository.addPlayer
}

/**
 * LEAVE_ROOM command handler
 */
async function handleLeaveRoom(command) {
  const { userId, action, traceId } = command;
  const { roomCode } = action.payload;

  console.log(`👋 User ${userId} leaving room ${roomCode}`);

  // Get room
  const room = await roomRepository.findByCode(roomCode);
  if (!room) {
    throw new Error('Room not found');
  }

  // Find player
  const player = room.players.find(p => p.userId === userId);
  if (!player) {
    throw new Error('Player not found in room');
  }

  // Remove player
  await roomRepository.removePlayer(room.id, player.id);

  console.log(`✅ User ${userId} left room ${roomCode}`);

  // PLAYER_LEFT event đã được emit trong roomRepository.removePlayer
}

/**
 * Emit event to Kafka
 */
async function emitEvent(topic, event) {
  try {
    await producer.send({
      topic,
      messages: [{
        value: JSON.stringify(event)
      }]
    });
  } catch (error) {
    console.error('❌ Failed to emit event:', error);
  }
}

/**
 * Format room for response
 */
function formatRoom(room) {
  return {
    id: room.code,
    code: room.code,
    name: room.name,
    hostId: room.hostId,
    maxPlayers: room.maxPlayers - 1, // -1 để trả về số người chơi (không tính quản trò)
    currentPlayers: room.currentPlayers,
    status: room.status,
    availableRoles: room.settings?.availableRoles || null,
    players: room.players ? room.players.map(p => ({
      userId: p.userId,
      username: p.displayname,
      isHost: p.isHost,
      isGuest: !p.userId || p.userId.startsWith('guest-')
    })) : [],
    createdAt: room.createdAt
  };
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  await consumer.disconnect();
  await producer.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down...');
  await consumer.disconnect();
  await producer.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

// Start service
startService();
