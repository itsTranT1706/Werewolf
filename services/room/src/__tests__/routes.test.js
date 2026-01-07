const request = require('supertest');
const express = require('express');
const cors = require('cors');
const roomRoutes = require('../routes/roomRoutes');
const RoomController = require('../controllers/roomController');

// Mock the RoomController
jest.mock('../controllers/roomController');

describe('Room Routes', () => {
  let app;
  let mockRoomController;

  beforeEach(() => {
    // Create Express app with middleware
    app = express();
    app.use(cors());
    app.use(express.json());

    // Mock controller
    mockRoomController = {
      getRooms: jest.fn(),
      getRoom: jest.fn(),
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      startGame: jest.fn(),
      updateRoom: jest.fn(),
      kickPlayer: jest.fn(),
    };

    RoomController.mockImplementation(() => mockRoomController);

    // Mock the middleware that attaches controller to request
    app.use((req, res, next) => {
      req.roomController = mockRoomController;
      next();
    });

    // Use the routes
    app.use('/api/v1/rooms', roomRoutes);

    // Error handling
    app.use((error, req, res, next) => {
      res.status(500).json({ error: error.message });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/rooms', () => {
    it('should call getRooms controller', async () => {
      mockRoomController.getRooms.mockImplementation((req, res) => {
        res.json({ rooms: [], pagination: {} });
      });

      const response = await request(app)
        .get('/api/v1/rooms')
        .expect(200);

      expect(mockRoomController.getRooms).toHaveBeenCalledTimes(1);
    });

    it('should handle query parameters', async () => {
      mockRoomController.getRooms.mockImplementation((req, res) => {
        expect(req.query.page).toBe('2');
        expect(req.query.limit).toBe('5');
        expect(req.query.status).toBe('WAITING');
        res.json({ rooms: [], pagination: {} });
      });

      await request(app)
        .get('/api/v1/rooms?page=2&limit=5&status=WAITING')
        .expect(200);
    });
  });

  describe('GET /api/v1/rooms/:code', () => {
    it('should call getRoom controller with code parameter', async () => {
      mockRoomController.getRoom.mockImplementation((req, res) => {
        expect(req.params.code).toBe('1234');
        res.json({ id: 'room1', code: '1234' });
      });

      const response = await request(app)
        .get('/api/v1/rooms/1234')
        .expect(200);

      expect(mockRoomController.getRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/rooms', () => {
    it('should call createRoom controller', async () => {
      const roomData = { name: 'Test Room', maxPlayers: 10 };

      mockRoomController.createRoom.mockImplementation((req, res) => {
        expect(req.body).toEqual(roomData);
        res.status(201).json({ id: 'room1', code: '5678' });
      });

      const response = await request(app)
        .post('/api/v1/rooms')
        .send(roomData)
        .expect(201);

      expect(mockRoomController.createRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/rooms/:code/join', () => {
    it('should call joinRoom controller', async () => {
      const joinData = { displayname: 'Player One' };

      mockRoomController.joinRoom.mockImplementation((req, res) => {
        expect(req.params.code).toBe('1234');
        expect(req.body).toEqual(joinData);
        res.json({ player: {}, room: {} });
      });

      const response = await request(app)
        .post('/api/v1/rooms/1234/join')
        .send(joinData)
        .expect(200);

      expect(mockRoomController.joinRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/rooms/:code/leave', () => {
    it('should call leaveRoom controller', async () => {
      const leaveData = { playerId: 'player123' };

      mockRoomController.leaveRoom.mockImplementation((req, res) => {
        expect(req.params.code).toBe('1234');
        expect(req.body).toEqual(leaveData);
        res.json({ player: {}, room: {} });
      });

      const response = await request(app)
        .post('/api/v1/rooms/1234/leave')
        .send(leaveData)
        .expect(200);

      expect(mockRoomController.leaveRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/rooms/:id/start', () => {
    it('should call startGame controller', async () => {
      mockRoomController.startGame.mockImplementation((req, res) => {
        expect(req.params.id).toBe('room1');
        res.json({ id: 'room1', status: 'STARTING' });
      });

      const response = await request(app)
        .post('/api/v1/rooms/room1/start')
        .expect(200);

      expect(mockRoomController.startGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /api/v1/rooms/:id', () => {
    it('should call updateRoom controller', async () => {
      const updateData = { name: 'Updated Room' };

      mockRoomController.updateRoom.mockImplementation((req, res) => {
        expect(req.params.id).toBe('room1');
        expect(req.body).toEqual(updateData);
        res.json({ id: 'room1', name: 'Updated Room' });
      });

      const response = await request(app)
        .patch('/api/v1/rooms/room1')
        .send(updateData)
        .expect(200);

      expect(mockRoomController.updateRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/rooms/:id/kick/:playerId', () => {
    it('should call kickPlayer controller', async () => {
      mockRoomController.kickPlayer.mockImplementation((req, res) => {
        expect(req.params.id).toBe('room1');
        expect(req.params.playerId).toBe('player123');
        res.json({ player: {}, room: {} });
      });

      const response = await request(app)
        .post('/api/v1/rooms/room1/kick/player123')
        .expect(200);

      expect(mockRoomController.kickPlayer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should handle controller errors', async () => {
      mockRoomController.getRooms.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/v1/rooms')
        .expect(500);

      expect(response.body.error).toBe('Database connection failed');
    });
  });
});
