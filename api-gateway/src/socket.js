const { socketAuthMiddleware } = require('./auth');
const { buildCommandMessage } = require('./contracts');
const { produceCommand } = require('./kafka');

function addUserSocket(userSockets, userId, socketId) {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
}

function removeUserSocket(userSockets, userId, socketId) {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) {
    userSockets.delete(userId);
  }
}

async function handleRoomJoin(socket, producer, payload = {}) {
  const { roomId } = payload;
  if (!roomId) {
    socket.emit('ERROR', { message: 'roomId is required' });
    return;
  }

  socket.join(roomId);
  const message = buildCommandMessage({
    userId: socket.data.userId,
    roomId,
    actionType: 'ROOM_JOIN',
    payload: {}
  });

  try {
    await produceCommand(producer, message);
  } catch (err) {
    console.error('Failed to publish ROOM_JOIN', err);
    socket.emit('ERROR', { message: 'Failed to publish action' });
  }
}

async function handleChatSend(socket, producer, payload = {}) {
  const { roomId, text } = payload;
  if (!roomId) {
    socket.emit('ERROR', { message: 'roomId is required' });
    return;
  }
  if (typeof text !== 'string' || !text.trim() || text.length > 200) {
    socket.emit('ERROR', { message: 'text must be 1-200 characters' });
    return;
  }

  const message = buildCommandMessage({
    userId: socket.data.userId,
    roomId,
    actionType: 'CHAT_SEND',
    payload: { text: text.trim() }
  });

  try {
    await produceCommand(producer, message);
  } catch (err) {
    console.error('Failed to publish CHAT_SEND', err);
    socket.emit('ERROR', { message: 'Failed to publish action' });
  }
}

function setupSocket(io, producer) {
  const userSockets = new Map();
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    addUserSocket(userSockets, userId, socket.id);

    socket.on('ROOM_JOIN', (payload) => handleRoomJoin(socket, producer, payload));
    socket.on('CHAT_SEND', (payload) => handleChatSend(socket, producer, payload));

    socket.on('disconnect', () => {
      removeUserSocket(userSockets, userId, socket.id);
    });
  });

  return { userSockets };
}

module.exports = {
  setupSocket
};
