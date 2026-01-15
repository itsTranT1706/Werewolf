const RoomService = require('../services/roomService');

class RoomController {
  constructor(roomService) {
    this.roomService = roomService;
  }

  // GET /api/v1/rooms - List rooms
  async getRooms(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      };

      const result = await this.roomService.getRooms(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/v1/rooms/:code - Get room by code (4 digits) or ID (UUID)
  async getRoom(req, res) {
    try {
      const { code } = req.params;

      // Check if it's a 4-digit code or UUID
      let room;
      if (/^\d{4}$/.test(code)) {
        // It's a 4-digit code
        room = await this.roomService.getRoomByCode(code);
      } else {
        // Assume it's a UUID/ID
        room = await this.roomService.getRoomById(code);
      }

      res.json(room);
    } catch (error) {
      if (error.message === 'Room not found' || error.message.includes('Invalid room code')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // POST /api/v1/rooms - Create room
  async createRoom(req, res) {
    try {
      const { name, maxPlayers, settings } = req.body;
      const { displayname, userId } = req.user || {}; // May be null for anonymous users

      const roomData = {
        name,
        hostDisplayname: displayname || 'Anonymous Host',
        hostId: userId,
        maxPlayers: maxPlayers || 75,
        settings,
      };

      const room = await this.roomService.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // POST /api/v1/rooms/:code/join - Join room
  async joinRoom(req, res) {
    try {
      const { code } = req.params;
      const { displayname, userId } = req.body;

      const playerData = {
        displayname: displayname || 'Anonymous Player',
        userId,
      };

      const result = await this.roomService.joinRoom(code, playerData);
      res.json(result);
    } catch (error) {
      if (error.message === 'Room not found' ||
        error.message === 'Room is full' ||
        error.message === 'Game has already started' ||
        error.message === 'You are already in this room') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // POST /api/v1/rooms/:code/leave - Leave room
  async leaveRoom(req, res) {
    try {
      const { code } = req.params;
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({ error: 'Player ID is required' });
      }

      const result = await this.roomService.leaveRoom(code, playerId);
      res.json(result);
    } catch (error) {
      if (error.message === 'Room not found' ||
        error.message === 'Player not found in room' ||
        error.message.includes('Invalid room code')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // POST /api/v1/rooms/:id/start - Start game
  async startGame(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.user || {};

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to start game' });
      }

      const room = await this.roomService.startGame(id, userId);
      res.json(room);
    } catch (error) {
      if (error.message === 'Only host can start the game' ||
        error.message === 'Need at least 4 players to start the game') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // PATCH /api/v1/rooms/:id - Update room
  async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.user || {};
      const updateData = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to update room' });
      }

      const room = await this.roomService.updateRoom(id, userId, updateData);
      res.json(room);
    } catch (error) {
      if (error.message === 'Only host can update room settings' ||
        error.message.includes('Max players must be') ||
        error.message.includes('Room name')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // POST /api/v1/rooms/:id/kick/:playerId - Kick player
  async kickPlayer(req, res) {
    try {
      const { id, playerId } = req.params;
      const { userId } = req.user || {};

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required to kick players' });
      }

      const result = await this.roomService.kickPlayer(id, userId, playerId);
      res.json(result);
    } catch (error) {
      if (error.message === 'Only host can kick players' ||
        error.message === 'Player not found in room' ||
        error.message === 'Cannot kick the host') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // PATCH /api/v1/rooms/:id/players/:playerId - Update player displayname
  async updatePlayerDisplayname(req, res) {
    try {
      const { id, playerId } = req.params;
      const { displayname } = req.body;

      const result = await this.roomService.updatePlayerDisplayname(id, playerId, displayname);
      res.json(result);
    } catch (error) {
      if (error.message === 'Display name is required' ||
        error.message === 'Display name must be less than 50 characters' ||
        error.message === 'Player not found in room' ||
        error.message === 'Room not found') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

module.exports = RoomController;
