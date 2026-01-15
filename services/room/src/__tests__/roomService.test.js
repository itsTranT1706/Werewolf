const RoomService = require('../services/roomService');
const RoomRepository = require('../repositories/roomRepository');

// Mock dependencies
jest.mock('../repositories/roomRepository');

describe('RoomService', () => {
  let roomService;
  let mockPrisma;
  let mockKafkaProducer;
  let mockRoomRepository;

  beforeEach(() => {
    mockPrisma = {};
    mockKafkaProducer = {
      send: jest.fn().mockResolvedValue(undefined),
    };
    mockRoomRepository = {
      generateRoomCode: jest.fn(),
      findByCode: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      addPlayer: jest.fn(),
      removePlayer: jest.fn(),
      findPlayerByUserId: jest.fn(),
      getRoomPlayers: jest.fn(),
    };

    RoomRepository.mockImplementation(() => mockRoomRepository);
    roomService = new RoomService(mockPrisma, mockKafkaProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const roomData = {
        name: 'Test Room',
        hostDisplayname: 'Host User',
        hostId: 'host123',
        maxPlayers: 10,
        settings: { theme: 'dark' },
      };

      const expectedRoom = {
        id: 'room123',
        code: '1234',
        ...roomData,
        currentPlayers: 0,
        status: 'WAITING',
      };

      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      const result = await roomService.createRoom(roomData);

      expect(mockRoomRepository.create).toHaveBeenCalledWith(roomData);
      expect(result).toEqual(expectedRoom);
    });

    it('should throw error for empty room name', async () => {
      const roomData = {
        name: '',
        hostDisplayname: 'Host User',
      };

      await expect(roomService.createRoom(roomData)).rejects.toThrow('Room name is required');
    });

    it('should throw error for room name too long', async () => {
      const roomData = {
        name: 'a'.repeat(101),
        hostDisplayname: 'Host User',
      };

      await expect(roomService.createRoom(roomData)).rejects.toThrow('Room name must be less than 100 characters');
    });

    it('should throw error for invalid maxPlayers', async () => {
      const roomData = {
        name: 'Test Room',
        hostDisplayname: 'Host User',
        maxPlayers: 100,
      };

      await expect(roomService.createRoom(roomData)).rejects.toThrow('Max players must be between 4 and 75');
    });
  });

  describe('getRoomByCode', () => {
    it('should return room for valid code', async () => {
      const code = '1234';
      const expectedRoom = {
        id: 'room123',
        code,
        name: 'Test Room',
      };

      mockRoomRepository.findByCode.mockResolvedValue(expectedRoom);

      const result = await roomService.getRoomByCode(code);

      expect(mockRoomRepository.findByCode).toHaveBeenCalledWith(code);
      expect(result).toEqual(expectedRoom);
    });

    it('should throw error for invalid code format', async () => {
      await expect(roomService.getRoomByCode('abc')).rejects.toThrow('Invalid room code. Must be 4 digits.');
      await expect(roomService.getRoomByCode('123')).rejects.toThrow('Invalid room code. Must be 4 digits.');
      await expect(roomService.getRoomByCode('')).rejects.toThrow('Invalid room code. Must be 4 digits.');
    });

    it('should throw error for non-existent room', async () => {
      mockRoomRepository.findByCode.mockResolvedValue(null);

      await expect(roomService.getRoomByCode('9999')).rejects.toThrow('Room not found');
    });
  });

  describe('joinRoom', () => {
    it('should join room successfully', async () => {
      const code = '1234';
      const playerData = {
        displayname: 'Player One',
        userId: 'player123',
      };

      const room = {
        id: 'room123',
        code,
        name: 'Test Room',
        currentPlayers: 2,
        maxPlayers: 10,
        status: 'WAITING',
        players: [],
      };

      const expectedResult = {
        player: { id: 'player123', displayname: 'Player One' },
        room,
      };

      mockRoomRepository.findByCode.mockResolvedValue(room);
      mockRoomRepository.findPlayerByUserId.mockResolvedValue(null);
      mockRoomRepository.addPlayer.mockResolvedValue(expectedResult);

      const result = await roomService.joinRoom(code, playerData);

      expect(mockRoomRepository.findByCode).toHaveBeenCalledWith(code);
      expect(mockRoomRepository.findPlayerByUserId).toHaveBeenCalledWith(room.id, playerData.userId);
      expect(mockRoomRepository.addPlayer).toHaveBeenCalledWith(room.id, {
        ...playerData,
        isHost: room.currentPlayers === 0,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw error for empty displayname', async () => {
      const playerData = {
        displayname: '',
        userId: 'player123',
      };

      await expect(roomService.joinRoom('1234', playerData)).rejects.toThrow('Display name is required');
    });

    it('should throw error for displayname too long', async () => {
      const playerData = {
        displayname: 'a'.repeat(51),
        userId: 'player123',
      };

      await expect(roomService.joinRoom('1234', playerData)).rejects.toThrow('Display name must be less than 50 characters');
    });

    it('should throw error when room is full', async () => {
      const code = '1234';
      const playerData = { displayname: 'Player One', userId: 'player123' };

      const room = {
        id: 'room123',
        currentPlayers: 10,
        maxPlayers: 10,
      };

      mockRoomRepository.findByCode.mockResolvedValue(room);

      await expect(roomService.joinRoom(code, playerData)).rejects.toThrow('Room is full');
    });

    it('should throw error when user already in room', async () => {
      const code = '1234';
      const playerData = { displayname: 'Player One', userId: 'player123' };

      const room = { id: 'room123', currentPlayers: 2, maxPlayers: 10, status: 'WAITING' };
      const existingPlayer = { id: 'existing123' };

      mockRoomRepository.findByCode.mockResolvedValue(room);
      mockRoomRepository.findPlayerByUserId.mockResolvedValue(existingPlayer);

      await expect(roomService.joinRoom(code, playerData)).rejects.toThrow('You are already in this room');
    });

    it('should throw error when game has started', async () => {
      const code = '1234';
      const playerData = { displayname: 'Player One', userId: 'player123' };

      const room = {
        id: 'room123',
        currentPlayers: 2,
        maxPlayers: 10,
        status: 'IN_PROGRESS',
      };

      mockRoomRepository.findByCode.mockResolvedValue(room);

      await expect(roomService.joinRoom(code, playerData)).rejects.toThrow('Game has already started');
    });
  });

  describe('startGame', () => {
    it('should start game successfully', async () => {
      const roomId = 'room123';
      const hostId = 'host123';

      const room = {
        id: roomId,
        currentPlayers: 5,
        players: [{ id: 'host', userId: hostId, isHost: true }],
      };

      const updatedRoom = { ...room, status: 'STARTING', gameId: 'game123' };

      mockRoomRepository.findById.mockResolvedValue(room);
      mockRoomRepository.update.mockResolvedValue(updatedRoom);

      const result = await roomService.startGame(roomId, hostId);

      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
      expect(mockRoomRepository.update).toHaveBeenCalledWith(roomId, {
        status: 'STARTING',
        gameId: expect.stringMatching(/^game_\d+$/),
      });
      expect(result).toEqual(updatedRoom);
    });

    it('should throw error when not enough players', async () => {
      const roomId = 'room123';
      const hostId = 'host123';

      const room = {
        id: roomId,
        currentPlayers: 3,
        players: [{ id: 'host', userId: hostId, isHost: true }],
      };

      mockRoomRepository.findById.mockResolvedValue(room);

      await expect(roomService.startGame(roomId, hostId)).rejects.toThrow('Need at least 4 players to start the game');
    });

    it('should throw error when not host', async () => {
      const roomId = 'room123';
      const wrongUserId = 'notHost123';

      const room = {
        id: roomId,
        currentPlayers: 5,
        players: [{ id: 'host', userId: 'host123', isHost: true }],
      };

      mockRoomRepository.findById.mockResolvedValue(room);

      await expect(roomService.startGame(roomId, wrongUserId)).rejects.toThrow('Only host can start the game');
    });
  });
});
