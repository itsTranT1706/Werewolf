const { randomUUID } = require('crypto');

function buildCommandMessage({ traceId, userId, roomId, actionType, payload }) {
  return {
    traceId: traceId || randomUUID(),
    userId,
    roomId,
    action: {
      type: actionType,
      payload: payload || {}
    },
    ts: Date.now()
  };
}

function parseBroadcastMessage(rawValue) {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch (err) {
    console.error('Failed to parse evt.broadcast message', err);
    return null;
  }
}

module.exports = {
  buildCommandMessage,
  parseBroadcastMessage
};
