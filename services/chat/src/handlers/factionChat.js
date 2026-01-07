const evtBroadcastSchema = require('../schemas/evtBroadcast.schema.json');
const { publishBroadcast } = require('../kafka/producer');
const { validate, formatErrors } = require('../utils/validate');
const { generateId } = require('../utils/ids');

/**
 * Handler cho chat riêng của phe (Faction Chat)
 * Được sử dụng cho phe Sói chat riêng vào ban đêm
 * 
 * Yêu cầu:
 * - Người chơi phải thuộc phe (faction) được chỉ định
 * - Game phải ở giai đoạn phù hợp (thường là ban đêm cho phe Sói)
 * 
 * Payload từ command:
 * - faction: string (e.g., "WEREWOLF", "VILLAGER") 
 * - text: string (nội dung tin nhắn)
 * - phase: string (optional, để kiểm tra giai đoạn game, e.g., "NIGHT", "DAY")
 */
async function handleFactionChat(command, { producer, config, logger }) {
  const traceId = command.traceId;
  const userId = command.userId;
  const roomId = command.roomId;
  const faction = command.action?.payload?.faction;
  const phase = command.action?.payload?.phase;
  const text = typeof command.action?.payload?.text === 'string'
    ? command.action.payload.text.trim()
    : '';

  // Validate roomId
  if (!roomId) {
    logger.warn('roomId is required for faction chat', { traceId, userId });
    return;
  }

  // Validate faction
  if (!faction) {
    logger.warn('faction is required for faction chat', { traceId, userId, roomId });
    return;
  }

  // Validate text
  if (!text || text.length > 500) {
    logger.warn('Invalid faction chat text', {
      traceId,
      roomId,
      faction,
      length: text.length
    });
    return;
  }

  // Kiểm tra phase (nếu cần thiết)
  // Ví dụ: Phe Sói chỉ chat được vào ban đêm
  if (faction === 'WEREWOLF' && phase !== 'NIGHT') {
    logger.warn('Werewolf faction chat only allowed during NIGHT phase', {
      traceId,
      userId,
      roomId,
      currentPhase: phase
    });
    return;
  }

  const createdAt = Date.now();
  const eventMessage = {
    traceId,
    roomId,
    event: {
      type: 'CHAT_MESSAGE_FACTION',
      payload: {
        messageId: generateId(),
        userId,
        faction,
        text,
        createdAt
      }
    },
    ts: createdAt
  };

  const { valid, errors } = validate(evtBroadcastSchema, eventMessage);
  if (!valid) {
    logger.error('evt.broadcast validation failed for faction chat', {
      traceId,
      errors: formatErrors(errors)
    });
    return;
  }

  await publishBroadcast(producer, config.evtTopic, eventMessage, logger);

  logger.info('Faction chat message published', {
    traceId,
    roomId,
    userId,
    faction,
    phase
  });
}

module.exports = handleFactionChat;
