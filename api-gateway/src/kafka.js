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

async function createBroadcastConsumer(kafka, { io, userSockets }) {
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
        if (roomId) {
          io.to(roomId).emit(event.type, data);
        } else if (targetUserId) {
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
