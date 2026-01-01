const cmdIngestSchema = require('../schemas/cmdIngest.schema.json');
const { validate, formatErrors } = require('../utils/validate');

async function createConsumer(kafka, { config, logger, producer, handlers }) {
  const consumer = kafka.consumer({ groupId: config.kafkaGroupId });
  await consumer.connect();
  await consumer.subscribe({ topic: config.cmdTopic, fromBeginning: false });
  logger.info('Kafka consumer subscribed', { topic: config.cmdTopic, groupId: config.kafkaGroupId });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const rawValue = message.value?.toString();
      if (!rawValue) {
        logger.warn('Received empty command message');
        return;
      }

      let command;
      try {
        command = JSON.parse(rawValue);
      } catch (err) {
        logger.warn('Failed to parse command JSON', { error: err.message });
        return;
      }

      const { valid, errors } = validate(cmdIngestSchema, command);
      if (!valid) {
        logger.warn('Command validation failed', { errors: formatErrors(errors) });
        return;
      }

      const actionType = command.action?.type;
      const handler = handlers?.[actionType];
      if (!handler) {
        logger.warn('No handler for action type', { actionType, traceId: command.traceId });
        return;
      }

      logger.info('Processing command', {
        traceId: command.traceId,
        actionType,
        roomId: command.roomId,
        userId: command.userId
      });

      try {
        await handler(command, { config, logger, producer });
      } catch (err) {
        logger.error('Handler error', {
          error: err.message,
          traceId: command.traceId,
          actionType
        });
      }
    }
  });

  return consumer;
}

async function disconnectConsumer(consumer, logger) {
  if (!consumer) return;
  try {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  } catch (err) {
    logger.error('Failed to disconnect consumer', { error: err.message });
  }
}

module.exports = {
  createConsumer,
  disconnectConsumer
};
