async function createProducer(kafka, logger) {
  const producer = kafka.producer();
  await producer.connect();
  logger.info('Kafka producer connected');
  return producer;
}

async function publishBroadcast(producer, topic, message, logger) {
  if (!producer) {
    throw new Error('Producer not initialized');
  }
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }]
  });
  logger.info('Broadcast event published', {
    topic,
    eventType: message?.event?.type,
    traceId: message?.traceId,
    roomId: message?.roomId,
    targetUserId: message?.targetUserId
  });
}

async function disconnectProducer(producer, logger) {
  if (!producer) return;
  try {
    await producer.disconnect();
    logger.info('Kafka producer disconnected');
  } catch (err) {
    logger.error('Failed to disconnect producer', { error: err.message });
  }
}

module.exports = {
  createProducer,
  publishBroadcast,
  disconnectProducer
};
