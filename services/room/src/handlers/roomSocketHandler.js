const RoomService = require('../services/roomService');
const { sendCommandToIngest } = require('../utils/kafka');

class RoomSocketHandler {
  constructor(prisma, producer, io) {
    this.prisma = prisma;
    this.producer = producer;
    this.io = io;
    this.roomService = new RoomService(prisma, producer);
    this.socketRooms = new Map(); // socketId -> roomId
    this.roomPlayers = new Map(); // roomId -> Set of socketIds
  }

  // Generate a unique 4-digit room code
  generateRoomCode() {
    let code;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.usedCodes && this.usedCodes.has(code));
    return code;
  }

  // CREATE_ROOM event handler
  async handleCreateRoom(socket, data) {
    try {
      const { name, maxPlayers = 75, settings, displayname, userId: incomingUserId } = data;
      if (!socket.data?.userId && incomingUserId) {
        socket.data.userId = incomingUserId;
      }

      // Validate input
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        socket.emit('ERROR', { message: 'Room name is required' });
        return;
      }

      if (name.length > 100) {
        socket.emit('ERROR', { message: 'Room name must be less than 100 characters' });
        return;
      }

      if (maxPlayers < 4 || maxPlayers > 75) {
        socket.emit('ERROR', { message: 'Max players must be between 4 and 75' });
        return;
      }

      const roomData = {
        name: name.trim(),
        hostDisplayname: displayname || 'Anonymous Host',
        hostId: socket.data?.userId, // May be undefined for anonymous users
        maxPlayers,
        settings,
      };

      // Clean up stale room membership for this user (disconnected tabs)
      if (roomData.hostId) {
        const existingPlayer = await this.roomService.roomRepository.findPlayerByUserIdInAnyRoom(roomData.hostId);
        if (existingPlayer) {
          const existingRoomId = existingPlayer.room?.id;
          const hasActiveSockets = existingRoomId && this.roomPlayers.has(existingRoomId)
            && this.roomPlayers.get(existingRoomId).size > 0;
          if (!hasActiveSockets && existingRoomId) {
            await this.roomService.leaveRoom(existingRoomId, existingPlayer.id);
          } else if (hasActiveSockets) {
            socket.emit('ERROR', { message: 'You are already in another room' });
            return;
          }
        }
      }

      // Create room
      const room = await this.roomService.createRoom(roomData);

      // Join the socket to the room
      socket.join(room.id);
      this.socketRooms.set(socket.id, room.id);

      // Initialize room players set
      this.roomPlayers.set(room.id, new Set([socket.id]));

      // Store room info in socket for later use
      socket.data.currentRoomId = room.id;
      socket.data.isHost = true;
      socket.data.displayname = roomData.hostDisplayname;
      socket.data.playerId = room.players[0].id; // Host is first player

      // Emit success to creator
      socket.emit('ROOM_CREATED', {
        room: {
          id: room.id,
          code: room.code,
          name: room.name,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.currentPlayers,
          status: room.status,
          settings: room.settings,
          players: room.players
        }
      });

      console.log(`Room created: ${room.code} by ${socket.id}`);

    } catch (error) {
      console.error('Create room error:', error);
      socket.emit('ERROR', { message: error.message });
    }
  }

  // JOIN_ROOM event handler
  async handleJoinRoom(socket, data) {
    try {
      const { code, displayname, userId: incomingUserId } = data;
      if (!socket.data?.userId && incomingUserId) {
        socket.data.userId = incomingUserId;
      }

      // Validate input
      if (!code || typeof code !== 'string' || code.length !== 4 || !/^\d{4}$/.test(code)) {
        socket.emit('ERROR', { message: 'Invalid room code. Must be 4 digits.' });
        return;
      }

      if (!displayname || typeof displayname !== 'string' || displayname.trim().length === 0) {
        socket.emit('ERROR', { message: 'Display name is required' });
        return;
      }

      if (displayname.length > 50) {
        socket.emit('ERROR', { message: 'Display name must be less than 50 characters' });
        return;
      }

      // Get room first to check if user is already in this room
      const userId = socket.data?.userId || incomingUserId;
      let room;
      try {
        room = await this.roomService.getRoomByCode(code);
      } catch (error) {
        socket.emit('ERROR', { message: error.message });
        return;
      }

      // Check if socket is already in this room (socket tracking)
      if (this.socketRooms.has(socket.id)) {
        const currentRoomId = this.socketRooms.get(socket.id);
        if (currentRoomId === room.id) {
          // Socket is already in this room, find player by playerId if available, otherwise by userId/displayname
          let player = null;
          if (socket.data?.playerId) {
            player = room.players.find(p => p.id === socket.data.playerId);
          }
          if (!player && userId) {
            player = room.players.find(p => p.userId === userId);
          }
          if (!player) {
            // For anonymous users, try to find by displayname (may not be accurate if duplicates exist)
            player = room.players.find(p => p.displayname === displayname.trim() && p.userId === null);
          }

          // Emit room info
          socket.emit('ROOM_JOINED', {
            room: {
              id: room.id,
              code: room.code,
              name: room.name,
              maxPlayers: room.maxPlayers,
              currentPlayers: room.currentPlayers,
              status: room.status,
              settings: room.settings,
              players: room.players
            },
            player: player || room.players[0] // Fallback to first player if not found
          });
          console.log(`Player ${socket.id} already in room: ${code}`);
          return;
        } else {
          // Socket is in a different room - emit error
          socket.emit('ERROR', { message: 'You are already in a room' });
          return;
        }
      }

      // Check if user is already in this room (check database for authenticated users)
      if (userId) {
        const existingPlayer = await this.roomService.isUserInRoom(room.id, userId);
        if (existingPlayer) {
          // User is already in this room, just update socket tracking and emit room info
          socket.join(room.id);
          this.socketRooms.set(socket.id, room.id);

          // Add socket to room players
          if (!this.roomPlayers.has(room.id)) {
            this.roomPlayers.set(room.id, new Set());
          }
          this.roomPlayers.get(room.id).add(socket.id);

          // Store room info in socket
          socket.data.currentRoomId = room.id;
          socket.data.playerId = existingPlayer.id;
          socket.data.displayname = displayname.trim();
          socket.data.isHost = existingPlayer.isHost;

          // Emit success to joiner
          socket.emit('ROOM_JOINED', {
            room: {
              id: room.id,
              code: room.code,
              name: room.name,
              maxPlayers: room.maxPlayers,
              currentPlayers: room.currentPlayers,
              status: room.status,
              settings: room.settings,
              players: room.players
            },
            player: existingPlayer
          });

          console.log(`Player ${socket.id} reconnected to room: ${code}`);
          return;
        }
      } else {
        // For anonymous users (no userId), check if player with same displayname already exists in this room
        const existingPlayer = room.players.find(p =>
          p.displayname === displayname.trim() &&
          (p.userId === null || p.userId === undefined)
        );

        if (existingPlayer) {
          // Player already exists, just update socket tracking and emit room info
          socket.join(room.id);
          this.socketRooms.set(socket.id, room.id);

          // Add socket to room players
          if (!this.roomPlayers.has(room.id)) {
            this.roomPlayers.set(room.id, new Set());
          }
          this.roomPlayers.get(room.id).add(socket.id);

          // Store room info in socket
          socket.data.currentRoomId = room.id;
          socket.data.playerId = existingPlayer.id;
          socket.data.displayname = displayname.trim();
          socket.data.isHost = existingPlayer.isHost;

          // Emit success to joiner
          socket.emit('ROOM_JOINED', {
            room: {
              id: room.id,
              code: room.code,
              name: room.name,
              maxPlayers: room.maxPlayers,
              currentPlayers: room.currentPlayers,
              status: room.status,
              settings: room.settings,
              players: room.players
            },
            player: existingPlayer
          });

          console.log(`Anonymous player ${socket.id} reconnected to room: ${code} (displayname: ${displayname.trim()})`);
          return;
        }
      }

      // Join room via service (only if player doesn't exist)
      const result = await this.roomService.joinRoom(code, {
        displayname: displayname.trim(),
        userId: userId, // May be undefined for anonymous users
      });

      // Join socket to room
      socket.join(result.room.id);
      this.socketRooms.set(socket.id, result.room.id);

      // Add socket to room players
      if (!this.roomPlayers.has(result.room.id)) {
        this.roomPlayers.set(result.room.id, new Set());
      }
      this.roomPlayers.get(result.room.id).add(socket.id);

      // Store room info in socket
      socket.data.currentRoomId = result.room.id;
      socket.data.playerId = result.player.id;
      socket.data.displayname = displayname.trim();
      socket.data.isHost = result.player.isHost;

      // Emit success to joiner
      socket.emit('ROOM_JOINED', {
        room: {
          id: result.room.id,
          code: result.room.code,
          name: result.room.name,
          maxPlayers: result.room.maxPlayers,
          currentPlayers: result.room.currentPlayers,
          status: result.room.status,
          settings: result.room.settings,
          players: result.room.players
        },
        player: result.player
      });

      // Notify others in room
      socket.to(result.room.id).emit('PLAYER_JOINED', {
        player: result.player,
        room: {
          id: result.room.id,
          maxPlayers: result.room.maxPlayers,
          currentPlayers: result.room.currentPlayers,
          players: result.room.players
        }
      });

      console.log(`Player ${socket.id} joined room: ${code}`);

    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('ERROR', { message: error.message });
    }
  }

  // LEAVE_ROOM event handler
  async handleLeaveRoom(socket, data) {
    try {
      const roomId = socket.data.currentRoomId;
      if (!roomId) {
        socket.emit('ERROR', { message: 'You are not in a room' });
        return;
      }

      // Leave room via service
      const result = await this.roomService.leaveRoomBySocket(roomId, {
        displayname: socket.data.displayname,
        userId: socket.data.userId
      });

      // Leave socket room
      socket.leave(roomId);
      this.socketRooms.delete(socket.id);

      // Remove socket from room players
      if (this.roomPlayers.has(roomId)) {
        this.roomPlayers.get(roomId).delete(socket.id);
        if (this.roomPlayers.get(roomId).size === 0) {
          this.roomPlayers.delete(roomId);
        }
      }

      // Clear socket data
      socket.data.currentRoomId = null;
      socket.data.isHost = false;

      // Emit success to leaver
      socket.emit('ROOM_LEFT', { roomId });

      // Notify others in room
      socket.to(roomId).emit('PLAYER_LEFT', {
        playerId: result.player?.id,
        displayname: socket.data.displayname,
        room: {
          id: result.room.id,
          currentPlayers: result.room.currentPlayers,
          players: result.room.players
        }
      });

      // If there's a new host, notify everyone and update socket data
      if (result.newHost) {
        // Update isHost flag for the new host socket
        const newHostSocket = Array.from(this.io.sockets.sockets.values())
          .find(s => s.data.currentRoomId === roomId && s.data.playerId === result.newHost.id);

        if (newHostSocket) {
          newHostSocket.data.isHost = true;
        }

        this.io.to(roomId).emit('NEW_HOST', {
          newHost: result.newHost,
          room: {
            id: result.room.id,
            players: result.room.players
          }
        });
      }

      console.log(`Player ${socket.id} left room: ${roomId}`);

    } catch (error) {
      console.error('Leave room error:', error);
      socket.emit('ERROR', { message: error.message });
    }
  }

  // START_GAME event handler
  // START_GAME event handler
  async handleStartGame(socket, data) {
    try {
      const roomId = socket.data.currentRoomId;
      if (!roomId) {
        socket.emit('ERROR', { message: 'You are not in a room' });
        return;
      }

      // For now, temporarily bypass host check to see if the service layer works
      console.log(`[DEBUG] handleStartGame: socket.data.userId = ${socket.data.userId}, socket.data.displayname = ${socket.data.displayname}`);
      // if (!isHost) {
      //   socket.emit('ERROR', { message: 'HOST CHECK BYPASSED' });
      //   return;
      // }

      // Attempt to start the game
      const updatedRoom = await this.roomService.startGame(roomId, socket.data.userId);

      // Get roleSetup and availableRoles from data
      const { roleSetup, availableRoles } = data || {};

      // Prepare players list for gameplay service
      const playersList = updatedRoom.players.map(p => ({
        userId: p.userId,
        username: p.displayname,
        isHost: p.isHost
      }));

      // Find host userId
      const hostPlayer = updatedRoom.players.find(p => p.isHost);
      const hostUserId = hostPlayer?.userId || null;

      // Generate traceId
      const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Send command to gameplay service to assign roles
      const command = {
        traceId,
        userId: socket.data.userId,
        roomId,
        action: {
          type: 'GAME_START',
          payload: {
            players: playersList,
            hostUserId,
            roleSetup: roleSetup || null,
            availableRoles: availableRoles || updatedRoom.settings?.availableRoles || null
          }
        },
        ts: Date.now()
      };

      try {
        await sendCommandToIngest(this.producer, command);
        console.log(`✅ Sent GAME_START command to gameplay service for room ${roomId}`);
      } catch (error) {
        console.error('❌ Failed to send GAME_START command to gameplay service:', error);
        // Still emit GAME_STARTED event, gameplay service will handle errors
      }

      // CASE 1: Thành công - đủ 4 người trở lên
      // Emit success to all players in room
      this.io.to(roomId).emit('GAME_STARTED', {
        room: {
          id: updatedRoom.id,
          code: updatedRoom.code,
          name: updatedRoom.name,
          status: updatedRoom.status,
          gameId: updatedRoom.gameId,
          players: updatedRoom.players,
          maxPlayers: updatedRoom.maxPlayers,
          currentPlayers: updatedRoom.currentPlayers,
          settings: updatedRoom.settings,
          createdAt: updatedRoom.createdAt,
          updatedAt: updatedRoom.updatedAt
        },
        message: 'Game started successfully!'
      });

      console.log(`Game started in room: ${updatedRoom.code} (${roomId}) with ${updatedRoom.currentPlayers} players`);

    } catch (error) {
      console.error('Start game error:', error);

      // CASE 2: Thất bại - không đủ người hoặc lỗi khác
      // Emit error to the host who tried to start the game
      socket.emit('ERROR', {
        message: error.message,
        code: 'GAME_START_FAILED'
      });

      // Có thể log thêm thông tin debug
      if (error.message.includes('Need at least 4 players')) {
        console.log(`Game start failed in room ${socket.data.currentRoomId}: Insufficient players (${error.message})`);
      } else if (error.message.includes('Only host can start')) {
        console.log(`Game start failed in room ${socket.data.currentRoomId}: Permission denied (${error.message})`);
      } else {
        console.log(`Game start failed in room ${socket.data.currentRoomId}: ${error.message}`);
      }
    }
  }

  // UPDATE_ROOM event handler
  async handleUpdateRoom(socket, data) {
    try {
      const roomId = socket.data.currentRoomId;
      if (!roomId) {
        socket.emit('ERROR', { message: 'You are not in a room' });
        return;
      }

      // Check if this socket is the host by verifying against room data
      const currentRoom = await this.roomService.getRoomById(roomId);
      const hostPlayer = currentRoom.players.find(p => p.isHost);

      // For anonymous users, both userId might be null/undefined, which should be considered equal
      const isHost = hostPlayer && (
        hostPlayer.userId === socket.data.userId || // Exact match
        (hostPlayer.userId == null && socket.data.userId == null) || // Both null/undefined
        (hostPlayer.userId == null && socket.data.userId === undefined) || // null and undefined
        (hostPlayer.userId === undefined && socket.data.userId == null) || // undefined and null
        (hostPlayer.userId == null && socket.data.userId == null && hostPlayer.displayname === socket.data.displayname) // Fallback for anonymous
      );

      if (!isHost) {
        socket.emit('ERROR', { message: 'Only host can update room settings' });
        return;
      }

      const room = await this.roomService.updateRoom(roomId, socket.data.userId, data);

      // Emit to all players in room
      this.io.to(roomId).emit('ROOM_UPDATED', {
        room: {
          id: room.id,
          name: room.name,
          maxPlayers: room.maxPlayers,
          settings: room.settings,
          updatedAt: room.updatedAt
        }
      });

      console.log(`Room updated: ${roomId}`);

    } catch (error) {
      console.error('Update room error:', error);
      socket.emit('ERROR', { message: error.message });
    }
  }

  // KICK_PLAYER event handler
  async handleKickPlayer(socket, data) {
    try {
      const { playerId } = data;
      const roomId = socket.data.currentRoomId;

      if (!roomId) {
        socket.emit('ERROR', { message: 'You are not in a room' });
        return;
      }

      // Check if this socket is the host by verifying against room data
      const room = await this.roomService.getRoomById(roomId);
      const hostPlayer = room.players.find(p => p.isHost);

      // For anonymous users, both userId might be null/undefined, which should be considered equal
      const isHost = hostPlayer && (
        hostPlayer.userId === socket.data.userId || // Exact match
        (hostPlayer.userId == null && socket.data.userId == null) || // Both null/undefined
        (hostPlayer.userId == null && socket.data.userId === undefined) || // null and undefined
        (hostPlayer.userId === undefined && socket.data.userId == null) || // undefined and null
        (hostPlayer.userId == null && socket.data.userId == null && hostPlayer.displayname === socket.data.displayname) // Fallback for anonymous
      );

      if (!isHost) {
        socket.emit('ERROR', { message: 'Only host can kick players' });
        return;
      }

      if (!playerId) {
        socket.emit('ERROR', { message: 'Player ID is required' });
        return;
      }

      const result = await this.roomService.kickPlayer(roomId, socket.data.userId, playerId);

      // Find the socket of the kicked player by matching playerId
      const kickedSocket = Array.from(this.io.sockets.sockets.values())
        .find(s => s.data.currentRoomId === roomId && s.data.playerId === playerId);

      if (kickedSocket) {
        kickedSocket.emit('KICKED_FROM_ROOM', { roomId });
        kickedSocket.leave(roomId);
        this.socketRooms.delete(kickedSocket.id);

        if (this.roomPlayers.has(roomId)) {
          this.roomPlayers.get(roomId).delete(kickedSocket.id);
        }
      }

      // Notify others in room
      socket.to(roomId).emit('PLAYER_KICKED', {
        playerId,
        room: {
          id: result.room.id,
          currentPlayers: result.room.currentPlayers,
          players: result.room.players
        }
      });

      console.log(`Player ${playerId} kicked from room: ${roomId}`);

    } catch (error) {
      console.error('Kick player error:', error);
      socket.emit('ERROR', { message: error.message });
    }
  }

  // GET_ROOM_INFO event handler
  async handleGetRoomInfo(socket, data) {
    try {
      const { code } = data;

      // Validate input
      if (!code || typeof code !== 'string' || code.length !== 4 || !/^\d{4}$/.test(code)) {
        socket.emit('ERROR', { message: 'Invalid room code. Must be 4 digits.' });
        return;
      }

      // Get room by code (user doesn't need to be in the room to get info)
      const room = await this.roomService.getRoomByCode(code);

      socket.emit('ROOM_INFO', {
        room: {
          id: room.id,
          code: room.code,
          name: room.name,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.currentPlayers,
          status: room.status,
          settings: room.settings,
          players: room.players,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt
        }
      });

    } catch (error) {
      console.error('Get room info error:', error);
      socket.emit('ERROR', { message: error.message });
    }
  }

  // Handle socket disconnect
  handleDisconnect(socket) {
    const roomId = this.socketRooms.get(socket.id);
    if (roomId) {
      // Leave the room
      this.socketRooms.delete(socket.id);

      if (this.roomPlayers.has(roomId)) {
        this.roomPlayers.get(roomId).delete(socket.id);
        if (this.roomPlayers.get(roomId).size === 0) {
          this.roomPlayers.delete(roomId);
        }
      }

      // Notify others if the player was in a room
      socket.to(roomId).emit('PLAYER_DISCONNECTED', {
        playerId: socket.data.playerId,
        displayname: socket.data.displayname
      });
    }
  }
}

module.exports = RoomSocketHandler;
