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

    return room;
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

    // Check if user is already in room
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
      isHost: room.currentPlayers === 0, // First player becomes host
    });

    return result;
  }

  // Leave room
  async leaveRoom(roomCode, playerId) {
    // First find the room by code to get the room ID
    const room = await this.getRoomByCode(roomCode);
    const player = await this.roomRepository.findPlayer(room.id, playerId);

    if (!player) {
      throw new Error('Player not found in room');
    }

    const result = await this.roomRepository.removePlayer(room.id, playerId);

    // If host leaves and there are other players, assign new host
    if (player.isHost && result.room.currentPlayers > 0) {
      const players = await this.roomRepository.getRoomPlayers(room.id);
      if (players.length > 0) {
        // Make the first remaining player the host
        await this.roomRepository.update(room.id, {});
        // Note: In a real implementation, you'd want to update the first player's isHost status
      }
    }

    return result;
  }

  // Start game
  async startGame(roomId, hostId) {
    const room = await this.getRoomById(roomId);

    // Check if user is host
    const hostPlayer = room.players.find(p => p.isHost);
    if (!hostPlayer || hostPlayer.userId !== hostId) {
      throw new Error('Only host can start the game');
    }

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
    if (!hostPlayer || hostPlayer.userId !== hostId) {
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
    if (!hostPlayer || hostPlayer.userId !== hostId) {
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
