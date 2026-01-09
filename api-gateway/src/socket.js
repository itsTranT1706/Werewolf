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


async function handleChatSend(socket, producer, payload = {}) {
  const { roomId, text } = payload;
  if (!roomId) {
    socket.emit('ERROR', { message: 'roomId is required' });
    return;
  }
  if (typeof text !== 'string' || !text.trim() || text.length > 500) {
    socket.emit('ERROR', { message: 'text must be 1-500 characters' });
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

async function handleChatSendDm(socket, producer, payload = {}) {
  const { targetUserId, text } = payload;
  if (!targetUserId) {
    socket.emit('ERROR', { message: 'targetUserId is required' });
    return;
  }
  if (typeof text !== 'string' || !text.trim() || text.length > 500) {
    socket.emit('ERROR', { message: 'text must be 1-500 characters' });
    return;
  }

  const message = buildCommandMessage({
    userId: socket.data.userId,
    roomId: null,
    actionType: 'CHAT_SEND_DM',
    payload: {
      targetUserId,
      text: text.trim()
    }
  });

  try {
    await produceCommand(producer, message);
  } catch (err) {
    console.error('Failed to publish CHAT_SEND_DM', err);
    socket.emit('ERROR', { message: 'Failed to publish action' });
  }
}

async function handleChatSendFaction(socket, producer, payload = {}) {
  const { roomId, faction, phase, text } = payload;

  if (!roomId) {
    socket.emit('ERROR', { message: 'roomId is required' });
    return;
  }

  if (!faction) {
    socket.emit('ERROR', { message: 'faction is required' });
    return;
  }

  if (typeof text !== 'string' || !text.trim() || text.length > 500) {
    socket.emit('ERROR', { message: 'text must be 1-500 characters' });
    return;
  }

  // Validate werewolf faction can only chat during night
  if (faction === 'WEREWOLF' && phase !== 'NIGHT') {
    socket.emit('ERROR', { message: 'Werewolf faction chat only allowed during NIGHT phase' });
    return;
  }

  const message = buildCommandMessage({
    userId: socket.data.userId,
    roomId,
    actionType: 'CHAT_SEND_FACTION',
    payload: {
      faction,
      phase,
      text: text.trim()
    }
  });

  try {
    await produceCommand(producer, message);
  } catch (err) {
    console.error('Failed to publish CHAT_SEND_FACTION', err);
    socket.emit('ERROR', { message: 'Failed to publish action' });
  }
}

async function handleGameStart(socket, producer, payload = {}) {
  const { roomId, players, roleSetup } = payload

  if (!roomId) {
    socket.emit('ERROR', { message: 'roomId is required' })
    return
  }

  if (!players || players.length < 3) {
    socket.emit('ERROR', { message: 'Cần ít nhất 3 người chơi' })
    return
  }

  if (players.length > 75) {
    socket.emit('ERROR', { message: 'Tối đa 75 người chơi' })
    return
  }

  const message = buildCommandMessage({
    userId: socket.data.userId,
    roomId,
    actionType: 'GAME_START',
    payload: { players, roleSetup, availableRoles: payload.availableRoles }
  })

  try {
    await produceCommand(producer, message)
    socket.emit('GAME_START_REQUESTED', { roomId, message: 'Game đang được khởi tạo...' })
  } catch (err) {
    console.error('Failed to publish GAME_START', err)
    socket.emit('ERROR', { message: 'Failed to start game' })
  }
}

async function handleGMCommand(socket, producer, actionType, payload = {}) {
  const { roomId } = payload

  if (!roomId) {
    socket.emit('ERROR', { message: 'roomId is required' })
    return
  }

  const message = buildCommandMessage({
    userId: socket.data.userId,
    roomId,
    actionType,
    payload
  })

  try {
    await produceCommand(producer, message)
  } catch (err) {
    console.error(`Failed to publish ${actionType}`, err)
    socket.emit('ERROR', { message: `Failed to execute ${actionType}` })
  }
}

function setupSocket(io, producer) {
  const userSockets = new Map();
  const roomFactions = new Map(); // Map<roomId, Map<userId, faction>>

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`[SOCKET] New connection: socketId=${socket.id}, userId=${userId}`);
    addUserSocket(userSockets, userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`[SOCKET] Socket ${socket.id} joined room user:${userId}, total sockets for this user: ${userSockets.get(userId)?.size || 0}`);

    socket.on('CHAT_SEND', (payload) => handleChatSend(socket, producer, payload));
    socket.on('CHAT_SEND_DM', (payload) => handleChatSendDm(socket, producer, payload));
    socket.on('CHAT_SEND_FACTION', (payload) => handleChatSendFaction(socket, producer, payload));

    // ✅ Thêm GAME_START handler
    socket.on('GAME_START', (payload) => handleGameStart(socket, producer, payload));

    // ✅ Join game room for receiving broadcasts
    socket.on('JOIN_GAME_ROOM', (payload) => {
      const { roomId } = payload || {};
      if (roomId) {
        socket.join(roomId);
        console.log(`[SOCKET] Socket ${socket.id} joined game room ${roomId}`);
      }
    });

    // ✅ GM Commands
    socket.on('GM_START_NIGHT', (payload) => handleGMCommand(socket, producer, 'GM_START_NIGHT', payload));
    socket.on('GM_CUPID_SELECT', (payload) => handleGMCommand(socket, producer, 'GM_CUPID_SELECT', payload));
    socket.on('GM_WEREWOLF_KILL', (payload) => handleGMCommand(socket, producer, 'GM_WEREWOLF_KILL', payload));
    socket.on('GM_SEER_CHECK', (payload) => handleGMCommand(socket, producer, 'GM_SEER_CHECK', payload));
    socket.on('GM_BODYGUARD_PROTECT', (payload) => handleGMCommand(socket, producer, 'GM_BODYGUARD_PROTECT', payload));
    socket.on('GM_WITCH_ACTION', (payload) => handleGMCommand(socket, producer, 'GM_WITCH_ACTION', payload));
    socket.on('GM_END_NIGHT', (payload) => handleGMCommand(socket, producer, 'GM_END_NIGHT', payload));
    socket.on('GM_ANNOUNCE_DEATHS', (payload) => handleGMCommand(socket, producer, 'GM_ANNOUNCE_DEATHS', payload));
    socket.on('GM_START_DAY', (payload) => handleGMCommand(socket, producer, 'GM_START_DAY', payload));
    socket.on('PLAYER_VOTE', (payload) => handleGMCommand(socket, producer, 'PLAYER_VOTE', payload));
    socket.on('GM_END_VOTE', (payload) => handleGMCommand(socket, producer, 'GM_END_VOTE', payload));
    socket.on('GM_HUNTER_SHOOT', (payload) => handleGMCommand(socket, producer, 'GM_HUNTER_SHOOT', payload));

    // Handler để update faction info từ gameplay service
    socket.on('UPDATE_FACTION', (payload) => {
      const { roomId, faction } = payload;
      if (!roomId || !faction) return;

      if (!roomFactions.has(roomId)) {
        roomFactions.set(roomId, new Map());
      }
      roomFactions.get(roomId).set(userId, faction);
      socket.data.currentFaction = faction;
      socket.data.currentRoomId = roomId;
    });

    socket.on('disconnect', () => {
      removeUserSocket(userSockets, userId, socket.id);
      // Cleanup faction data khi disconnect
      if (socket.data.currentRoomId && roomFactions.has(socket.data.currentRoomId)) {
        const factionMap = roomFactions.get(socket.data.currentRoomId);
        factionMap.delete(userId);
        if (factionMap.size === 0) {
          roomFactions.delete(socket.data.currentRoomId);
        }
      }
    });
  });

  return { userSockets, roomFactions };
}

module.exports = {
  setupSocket
};
