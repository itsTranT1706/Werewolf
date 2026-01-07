const { Kafka } = require('kafkajs');

function createKafkaClient() {
  return new Kafka({
    clientId: 'room-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  });
}

async function createProducer(kafka) {
  const producer = kafka.producer();
  await producer.connect();
  return producer;
}

async function createConsumer(kafka, groupId = 'room-service-group') {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: 'commands', fromBeginning: false });
  return consumer;
}

async function sendRoomEvent(producer, eventType, roomData) {
  try {
    await producer.send({
      topic: 'room.events',
      messages: [
        {
          key: roomData.roomId || roomData.id,
          value: JSON.stringify({
            type: eventType,
            data: roomData,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
  } catch (error) {
    console.error('Error sending room event:', error);
  }
}

module.exports = {
  createKafkaClient,
  createProducer,
  createConsumer,
  sendRoomEvent,
};
