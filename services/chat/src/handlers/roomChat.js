const evtBroadcastSchema = require('../schemas/evtBroadcast.schema.json');
const { publishBroadcast } = require('../kafka/producer');
const { validate, formatErrors } = require('../utils/validate');
const { generateId } = require('../utils/ids');

async function handleRoomChat(command, { producer, config, logger }) {
  const traceId = command.traceId;
  const userId = command.userId;
  const roomId = command.roomId;
  const text = typeof command.action?.payload?.text === 'string'
    ? command.action.payload.text.trim()
    : '';

  if (!roomId) {
    logger.warn('roomId is required for room chat', { traceId, userId });
    return;
  }

  if (!text || text.length > 500) {
    logger.warn('Invalid chat text', { traceId, roomId, length: text.length });
    return;
  }

  const createdAt = Date.now();
  const eventMessage = {
    traceId,
    roomId,
    event: {
      type: 'CHAT_MESSAGE',
      payload: {
        messageId: generateId(),
        userId,
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

module.exports = handleRoomChat;
