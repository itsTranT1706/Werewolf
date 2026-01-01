const evtBroadcastSchema = require('../schemas/evtBroadcast.schema.json');
const { publishBroadcast } = require('../kafka/producer');
const { validate, formatErrors } = require('../utils/validate');
const { generateId } = require('../utils/ids');

async function handleDmChat(command, { producer, config, logger }) {
  const traceId = command.traceId;
  const fromUserId = command.userId;
  const targetUserId = command.action?.payload?.targetUserId;
  const text = typeof command.action?.payload?.text === 'string'
    ? command.action.payload.text.trim()
    : '';

  if (!targetUserId) {
    logger.warn('targetUserId is required for DM chat', { traceId, fromUserId });
    return;
  }

  if (!text || text.length > 500) {
    logger.warn('Invalid DM text', { traceId, targetUserId, length: text.length });
    return;
  }

  const createdAt = Date.now();
  const eventMessage = {
    traceId,
    targetUserId,
    event: {
      type: 'CHAT_MESSAGE_DM',
      payload: {
        messageId: generateId(),
        fromUserId,
        text,
        createdAt
      }
    },
    ts: createdAt
  };

  const { valid, errors } = validate(evtBroadcastSchema, eventMessage);
  if (!valid) {
    logger.error('evt.broadcast validation failed', { traceId, errors: formatErrors(errors) });
    return;
  }

  await publishBroadcast(producer, config.evtTopic, eventMessage, logger);
}

module.exports = handleDmChat;
