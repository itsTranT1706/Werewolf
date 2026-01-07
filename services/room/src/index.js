const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const prisma = require('./config/database')
const { createKafkaClient, createProducer, createConsumer } = require('./utils/kafka')
const RoomSocketHandler = require('./handlers/roomSocketHandler')

const PORT = process.env.PORT || 8082

async function startServer() {
  // ===== EXPRESS =====
  const app = express()

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'room-service' })
  })

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

  // ===== KAFKA =====
  const kafka = createKafkaClient()
  const producer = await createProducer(kafka)
  const consumer = await createConsumer(kafka, 'room-service-group')

  const socketHandler = new RoomSocketHandler(prisma, producer, io)

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
