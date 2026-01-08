const { Kafka } = require('kafkajs');
const { parseBroadcastMessage } = require('./contracts');

function createKafkaClient() {
  const brokers = (process.env.KAFKA_BROKERS || 'kafka:9092')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
  return new Kafka({
    clientId: 'api-gateway',
    brokers
  });
}

async function createProducer(kafka) {
  const producer = kafka.producer();
  await producer.connect();
  return producer;
}

async function createBroadcastConsumer(kafka, { io, userSockets, roomFactions }) {
  const consumer = kafka.consumer({ groupId: 'api-gateway-broadcast' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'evt.broadcast', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = parseBroadcastMessage(message.value?.toString());
      if (!payload?.event?.type) return;
      const { traceId, roomId, targetUserId, event, ts } = payload;
      const data = {
        traceId,
        roomId,
        targetUserId,
        payload: event.payload,
        ts
      };

      try {
         // Handle GAME_ROLE_ASSIGNED - Send to specific user
         if (event.type === 'GAME_ROLE_ASSIGNED' && targetUserId) {
          console.log(`[KAFKA] Sending GAME_ROLE_ASSIGNED to userId: ${targetUserId}, role: ${event.payload?.role}`);
          
          // Emit to room user:${targetUserId}
          io.to(`user:${targetUserId}`).emit(event.type, data);
          
          // Also emit to specific sockets in userSockets map
          const sockets = userSockets.get(targetUserId);
          if (sockets && sockets.size) {
            console.log(`[KAFKA] Found ${sockets.size} socket(s) for userId ${targetUserId}`);
            sockets.forEach((id) => {
              io.to(id).emit(event.type, data);
              console.log(`[KAFKA] Emitted to socket ${id}`);
            });
          } else {
            console.warn(`[KAFKA] ⚠️ No sockets found in userSockets map for userId ${targetUserId}`);
            // Try to find socket by checking all connected sockets
            const allSockets = Array.from(io.sockets.sockets.values());
            const matchingSockets = allSockets.filter(s => s.data.userId === targetUserId);
            if (matchingSockets.length > 0) {
              console.log(`[KAFKA] Found ${matchingSockets.length} socket(s) by checking all sockets`);
              matchingSockets.forEach(socket => {
                socket.emit(event.type, data);
                console.log(`[KAFKA] Emitted to socket ${socket.id} (userId: ${socket.data.userId})`);
              });
            } else {
              console.error(`[KAFKA] ❌ No socket found for userId ${targetUserId}`);
            }
          }
          console.log('Role assigned to user:', targetUserId, event.payload.role);
          return;
        }
        // Handle faction chat - only emit to users with matching faction
        if (event.type === 'CHAT_MESSAGE_FACTION' && roomId) {
          const faction = event.payload?.faction;
          if (!faction) return;

          const factionMap = roomFactions?.get(roomId);
          if (!factionMap) {
            console.warn('No faction map found for room', { roomId, faction });
            return;
          }

          // Emit to all users in the room with matching faction
          const socketsInRoom = await io.in(roomId).fetchSockets();
          socketsInRoom.forEach((socket) => {
            const socketUserId = socket.data.userId;
            const userFaction = factionMap.get(socketUserId);

            if (userFaction === faction) {
              socket.emit(event.type, data);
            }
          });

          console.log('Faction chat broadcast', { roomId, faction, recipientCount: socketsInRoom.length });
          return;
        }

        // Handle other event types
        if (roomId) {
          io.to(roomId).emit(event.type, data);
        } else if (targetUserId) {
          io.to(`user:${targetUserId}`).emit(event.type, data);
          const sockets = userSockets.get(targetUserId);
          if (sockets && sockets.size) {
            sockets.forEach((id) => io.to(id).emit(event.type, data));
          }
        } else {
          io.emit(event.type, data);
        }
      } catch (err) {
        console.error('Failed to emit broadcast event', err);
      }
    }
  });

  return consumer;
}

async function produceCommand(producer, message) {
  if (!producer) {
    throw new Error('Producer not initialized');
  }
  await producer.send({
    topic: 'cmd.ingest',
    messages: [{ value: JSON.stringify(message) }]
  });
}

async function disconnectKafka({ producer, consumer }) {
  try {
    if (producer) {
      await producer.disconnect();
    }
  } catch (err) {
    console.error('Error disconnecting producer', err);
  }

  try {
    if (consumer) {
      await consumer.disconnect();
    }
  } catch (err) {
    console.error('Error disconnecting consumer', err);
  }
}

module.exports = {
  createKafkaClient,
  createProducer,
  createBroadcastConsumer,
  produceCommand,
  disconnectKafka
};
