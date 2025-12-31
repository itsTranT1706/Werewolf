const config = require('./config');
const { createKafkaClient } = require('./kafka/client');
const { createProducer, disconnectProducer } = require('./kafka/producer');
const { createConsumer, disconnectConsumer } = require('./kafka/consumer');
const handleRoomChat = require('./handlers/roomChat');
const handleDmChat = require('./handlers/dmChat');
const logger = require('./utils/logger')('chat-service');

async function bootstrap() {
  const kafka = createKafkaClient(config);
  const producer = await createProducer(kafka, logger);
  const consumer = await createConsumer(kafka, {
    config,
    logger,
    producer,
    handlers: {
      CHAT_SEND: handleRoomChat,
      CHAT_SEND_ROOM: handleRoomChat,
      CHAT_SEND_DM: handleDmChat
    }
  });

  logger.info('Chat service started', {
    cmdTopic: config.cmdTopic,
    evtTopic: config.evtTopic
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    try {
      await disconnectConsumer(consumer, logger);
      await disconnectProducer(producer, logger);
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: err.message });
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { error: reason });
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to bootstrap chat service', { error: err.message });
  process.exit(1);
});
