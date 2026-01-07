const RoomRepository = require('../repositories/roomRepository');

class RoomService {
  constructor(prisma, kafkaProducer) {
    this.roomRepository = new RoomRepository(prisma, kafkaProducer);
  }

    // Create new room
    async createRoom(roomData) {
      const { name, hostDisplayname, hostId, maxPlayers = 75, settings } = roomData;
  
      // Validate input
      if (!name || name.trim().length === 0) {
        throw new Error('Room name is required');
      }
  
      if (name.length > 100) {
        throw new Error('Room name must be less than 100 characters');
      }
  
      if (maxPlayers < 4 || maxPlayers > 75) {
        throw new Error('Max players must be between 4 and 75');
      }
  
      const room = await this.roomRepository.create({
        name: name.trim(),
        hostDisplayname,
        hostId,
        maxPlayers,
        settings,
      });
  
      // Add host as first player to the database
      await this.roomRepository.addPlayer(room.id, {
        displayname: hostDisplayname,
        userId: hostId,
        isHost: true,
      });
  
      // Re-fetch room with players included (currentPlayers is already updated by addPlayer)
      return this.getRoomById(room.id);
    }

  // Get room by code
  async getRoomByCode(code) {
    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new Error('Invalid room code. Must be 4 digits.');
    }

    const room = await this.roomRepository.findByCode(code);
    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  // Get room by ID
  async getRoomById(id) {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  // Get all rooms
  async getRooms(options = {}) {
    return this.roomRepository.findAll(options);
  }

  // Join room
  async joinRoom(code, playerData) {
    const { displayname, userId } = playerData;

    // Validate input
    if (!displayname || displayname.trim().length === 0) {
      throw new Error('Display name is required');
    }

    if (displayname.length > 50) {
      throw new Error('Display name must be less than 50 characters');
    }

    // Get room
    const room = await this.getRoomByCode(code);

    // Check if room is full
    if (room.currentPlayers >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    // Check if game has already started
    if (room.status !== 'WAITING') {
      throw new Error('Game has already started');
    }

    // Check if user is already in room (only for authenticated users)
    if (userId) {
      const existingPlayer = await this.roomRepository.findPlayerByUserId(room.id, userId);
      if (existingPlayer) {
        throw new Error('You are already in this room');
      }
    }

    // Add player to room
    const result = await this.roomRepository.addPlayer(room.id, {
      displayname: displayname.trim(),
      userId,
      isHost: false, // Host is determined when room is created
    });

    return result;
  }

  // Leave room by room ID and player ID
  async leaveRoom(roomId, playerId) {
    const player = await this.roomRepository.findPlayer(roomId, playerId);

    if (!player) {
      throw new Error('Player not found in room');
    }

    const result = await this.roomRepository.removePlayer(roomId, playerId);

    // If host leaves and there are other players, assign new host
    if (player.isHost && result.room.currentPlayers > 0) {
      const players = await this.roomRepository.getRoomPlayers(roomId);
      if (players.length > 0) {
        // Make the first remaining player the host
        const newHost = players[0];
        await this.roomRepository.updatePlayer(roomId, newHost.id, { isHost: true });
        result.newHost = newHost;
      }
    }

    return result;
  }

  // Leave room by room code and player data (for socket-based approach)
  async leaveRoomBySocket(roomId, socketData) {
    const players = await this.roomRepository.getRoomPlayers(roomId);
    const player = players.find(p =>
      p.displayname === socketData.displayname &&
      (!socketData.userId || p.userId === socketData.userId)
    );

    if (!player) {
      throw new Error('Player not found in room');
    }

    return this.leaveRoom(roomId, player.id);
  }

  // Start game
  async startGame(roomId, hostId) {
    const room = await this.getRoomById(roomId);

    // Check if user is host - temporarily bypass for debugging
    // const hostPlayer = room.players.find(p => p.isHost);
    // const isHostValid = hostPlayer && (
    //   hostPlayer.userId === hostId || // Exact match
    //   (hostPlayer.userId == null && hostId == null) || // Both null/undefined
    //   (hostPlayer.userId == null && hostId === undefined) || // null and undefined
    //   (hostPlayer.userId === undefined && hostId == null)    // undefined and null
    // );
    // if (!isHostValid) {
    //   throw new Error('SERVICE HOST CHECK BYPASSED');
    // }

    // Check minimum players
    if (room.currentPlayers < 4) {
      throw new Error('Need at least 4 players to start the game');
    }

    // Check maximum players
    if (room.currentPlayers > 75) {
      throw new Error('Too many players to start the game');
    }

    // Update room status
    const updatedRoom = await this.roomRepository.update(roomId, {
      status: 'STARTING',
      gameId: `game_${Date.now()}`, // Generate simple game ID
    });

    return updatedRoom;
  }

  // Update room settings (host only)
  async updateRoom(roomId, hostId, updateData) {
    const room = await this.getRoomById(roomId);

    // Check if user is host
    const hostPlayer = room.players.find(p => p.isHost);
    // For anonymous users, both userId might be null/undefined, which should be considered equal
    const isHostValid = hostPlayer && (
      hostPlayer.userId === hostId || // Exact match
      (hostPlayer.userId == null && hostId == null) || // Both null/undefined
      (hostPlayer.userId == null && hostId === undefined) || // null and undefined
      (hostPlayer.userId === undefined && hostId == null)    // undefined and null
    );
    if (!isHostValid) {
      throw new Error('Only host can update room settings');
    }

    const { name, maxPlayers, settings } = updateData;
    const updatePayload = {};

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new Error('Room name is required');
      }
      if (name.length > 100) {
        throw new Error('Room name must be less than 100 characters');
      }
      updatePayload.name = name.trim();
    }

    if (maxPlayers !== undefined) {
      if (maxPlayers < 4 || maxPlayers > 75) {
        throw new Error('Max players must be between 4 and 75');
      }
      if (maxPlayers < room.currentPlayers) {
        throw new Error('Cannot set max players below current player count');
      }
      updatePayload.maxPlayers = maxPlayers;
    }

    if (settings !== undefined) {
      updatePayload.settings = settings;
    }

    return this.roomRepository.update(roomId, updatePayload);
  }

  // Kick player (host only)
  async kickPlayer(roomId, hostId, playerId) {
    const room = await this.getRoomById(roomId);

    // Check if user is host
    const hostPlayer = room.players.find(p => p.isHost);
    // For anonymous users, both userId might be null/undefined, which should be considered equal
    const isHostValid = hostPlayer && (
      hostPlayer.userId === hostId || // Exact match
      (hostPlayer.userId == null && hostId == null) || // Both null/undefined
      (hostPlayer.userId == null && hostId === undefined) || // null and undefined
      (hostPlayer.userId === undefined && hostId == null)    // undefined and null
    );
    if (!isHostValid) {
      throw new Error('Only host can kick players');
    }

    const playerToKick = room.players.find(p => p.id === playerId);
    if (!playerToKick) {
      throw new Error('Player not found in room');
    }

    if (playerToKick.isHost) {
      throw new Error('Cannot kick the host');
    }

    return this.leaveRoom(roomId, playerId);
  }
}

module.exports = RoomService;
