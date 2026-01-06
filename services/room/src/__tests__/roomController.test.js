const RoomController = require('../controllers/roomController');
const RoomService = require('../services/roomService');

// Mock dependencies
jest.mock('../services/roomService');

describe('RoomController', () => {
  let roomController;
  let mockRoomService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockRoomService = {
      createRoom: jest.fn(),
      getRoomByCode: jest.fn(),
      getRooms: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      startGame: jest.fn(),
      updateRoom: jest.fn(),
      kickPlayer: jest.fn(),
    };

    RoomService.mockImplementation(() => mockRoomService);
    roomController = new RoomController(mockRoomService);

    mockReq = {
      params: {},
      query: {},
      body: {},
      user: null,
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRooms', () => {
    it('should return rooms list', async () => {
      const mockRooms = {
        rooms: [{ id: 'room1', name: 'Room 1' }],
        pagination: { page: 1, total: 1 },
      };

      mockReq.query = { page: '1', limit: '10', status: 'WAITING' };
      mockRoomService.getRooms.mockResolvedValue(mockRooms);

      await roomController.getRooms(mockReq, mockRes);

      expect(mockRoomService.getRooms).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: 'WAITING',
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockRooms);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRoomService.getRooms.mockRejectedValue(error);

      await roomController.getRooms(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getRoom', () => {
    it('should return room details', async () => {
      const mockRoom = { id: 'room1', code: '1234', name: 'Test Room' };
      mockReq.params.code = '1234';
      mockRoomService.getRoomByCode.mockResolvedValue(mockRoom);

      await roomController.getRoom(mockReq, mockRes);

      expect(mockRoomService.getRoomByCode).toHaveBeenCalledWith('1234');
      expect(mockRes.json).toHaveBeenCalledWith(mockRoom);
    });

    it('should return 404 for non-existent room', async () => {
      const error = new Error('Room not found');
      mockReq.params.code = '9999';
      mockRoomService.getRoomByCode.mockRejectedValue(error);

      await roomController.getRoom(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });

    it('should return 404 for invalid room code', async () => {
      const error = new Error('Invalid room code. Must be 4 digits.');
      mockReq.params.code = 'abc';
      mockRoomService.getRoomByCode.mockRejectedValue(error);

      await roomController.getRoom(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('createRoom', () => {
    it('should create room successfully', async () => {
      const roomData = {
        name: 'New Room',
        maxPlayers: 10,
      };
      const createdRoom = { id: 'room1', code: '5678', ...roomData };

      mockReq.body = roomData;
      mockReq.user = { displayname: 'Host User', userId: 'host123' };
      mockRoomService.createRoom.mockResolvedValue(createdRoom);

      await roomController.createRoom(mockReq, mockRes);

      expect(mockRoomService.createRoom).toHaveBeenCalledWith({
        ...roomData,
        hostDisplayname: 'Host User',
        hostId: 'host123',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdRoom);
    });

    it('should handle anonymous host', async () => {
      const roomData = { name: 'New Room' };
      const createdRoom = { id: 'room1', code: '5678', ...roomData };

      mockReq.body = roomData;
      mockReq.user = null; // Anonymous user
      mockRoomService.createRoom.mockResolvedValue(createdRoom);

      await roomController.createRoom(mockReq, mockRes);

      expect(mockRoomService.createRoom).toHaveBeenCalledWith({
        ...roomData,
        hostDisplayname: 'Anonymous Host',
        hostId: undefined,
        maxPlayers: 75,
        settings: undefined,
      });
    });

    it('should return 400 for validation errors', async () => {
      const error = new Error('Room name is required');
      mockReq.body = { name: '' };
      mockRoomService.createRoom.mockRejectedValue(error);

      await roomController.createRoom(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('joinRoom', () => {
    it('should join room successfully', async () => {
      const joinData = { displayname: 'Player One' };
      const joinResult = {
        player: { id: 'player1', displayname: 'Player One' },
        room: { id: 'room1', code: '1234' },
      };

      mockReq.params.code = '1234';
      mockReq.body = joinData;
      mockRoomService.joinRoom.mockResolvedValue(joinResult);

      await roomController.joinRoom(mockReq, mockRes);

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith('1234', {
        displayname: 'Player One',
        userId: undefined,
      });
      expect(mockRes.json).toHaveBeenCalledWith(joinResult);
    });

    it('should handle authenticated player', async () => {
      const joinData = { displayname: 'Player One', userId: 'user123' };
      const joinResult = {
        player: { id: 'player1', displayname: 'Player One', userId: 'user123' },
        room: { id: 'room1', code: '1234' },
      };

      mockReq.params.code = '1234';
      mockReq.body = joinData;
      mockRoomService.joinRoom.mockResolvedValue(joinResult);

      await roomController.joinRoom(mockReq, mockRes);

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith('1234', joinData);
      expect(mockRes.json).toHaveBeenCalledWith(joinResult);
    });

    it('should handle anonymous player', async () => {
      const joinResult = {
        player: { id: 'player1', displayname: 'Anonymous Player' },
        room: { id: 'room1', code: '1234' },
      };

      mockReq.params.code = '1234';
      mockReq.body = {}; // No displayname provided
      mockRoomService.joinRoom.mockResolvedValue(joinResult);

      await roomController.joinRoom(mockReq, mockRes);

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith('1234', {
        displayname: 'Anonymous Player',
        userId: undefined,
      });
    });

    it('should return 400 for room full error', async () => {
      const error = new Error('Room is full');
      mockReq.params.code = '1234';
      mockReq.body = { displayname: 'Player One' };
      mockRoomService.joinRoom.mockRejectedValue(error);

      await roomController.joinRoom(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('startGame', () => {
    it('should start game successfully', async () => {
      const updatedRoom = { id: 'room1', status: 'STARTING', gameId: 'game123' };

      mockReq.params.id = 'room1';
      mockReq.user = { userId: 'host123' };
      mockRoomService.startGame.mockResolvedValue(updatedRoom);

      await roomController.startGame(mockReq, mockRes);

      expect(mockRoomService.startGame).toHaveBeenCalledWith('room1', 'host123');
      expect(mockRes.json).toHaveBeenCalledWith(updatedRoom);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockReq.params.id = 'room1';
      mockReq.user = null;

      await roomController.startGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required to start game' });
      expect(mockRoomService.startGame).not.toHaveBeenCalled();
    });

    it('should return 400 for validation errors', async () => {
      const error = new Error('Need at least 4 players to start the game');
      mockReq.params.id = 'room1';
      mockReq.user = { userId: 'host123' };
      mockRoomService.startGame.mockRejectedValue(error);

      await roomController.startGame(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
