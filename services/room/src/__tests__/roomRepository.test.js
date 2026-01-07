const RoomRepository = require('../repositories/roomRepository');

// Mock Prisma
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      room: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      roomPlayer: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    })),
  };
});

describe('RoomRepository', () => {
  let roomRepository;
  let mockPrisma;
  let mockKafkaProducer;

  beforeEach(() => {
    mockPrisma = {
      room: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      roomPlayer: {
        create: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    mockKafkaProducer = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    roomRepository = new RoomRepository(mockPrisma, mockKafkaProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRoomCode', () => {
    it('should generate a 4-digit code', () => {
      const code = roomRepository.generateRoomCode();

      expect(code).toMatch(/^\d{4}$/);
      expect(code.length).toBe(4);
      expect(parseInt(code)).toBeGreaterThanOrEqual(1000);
      expect(parseInt(code)).toBeLessThanOrEqual(9999);
    });
  });

  describe('findByCode', () => {
    it('should find room by code with players', async () => {
      const code = '1234';
      const expectedRoom = {
        id: 'room1',
        code,
        name: 'Test Room',
        players: [
          { id: 'player1', displayname: 'Player 1' },
          { id: 'player2', displayname: 'Player 2' },
        ],
      };

      mockPrisma.room.findUnique.mockResolvedValue(expectedRoom);

      const result = await roomRepository.findByCode(code);

      expect(mockPrisma.room.findUnique).toHaveBeenCalledWith({
        where: { code },
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
      });
      expect(result).toEqual(expectedRoom);
    });
  });

  describe('findById', () => {
    it('should find room by id with players', async () => {
      const roomId = 'room1';
      const expectedRoom = {
        id: roomId,
        code: '1234',
        name: 'Test Room',
        players: [{ id: 'player1', displayname: 'Player 1' }],
      };

      mockPrisma.room.findUnique.mockResolvedValue(expectedRoom);

      const result = await roomRepository.findById(roomId);

      expect(mockPrisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: roomId },
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
      });
      expect(result).toEqual(expectedRoom);
    });
  });

  describe('findAll', () => {
    it('should return rooms with pagination', async () => {
      const options = { page: 2, limit: 5, status: 'WAITING' };
      const mockRooms = [
        { id: 'room1', name: 'Room 1' },
        { id: 'room2', name: 'Room 2' },
      ];
      const totalCount = 12;

      mockPrisma.room.findMany.mockResolvedValue(mockRooms);
      mockPrisma.room.count.mockResolvedValue(totalCount);

      const result = await roomRepository.findAll(options);

      expect(mockPrisma.room.findMany).toHaveBeenCalledWith({
        where: { status: 'WAITING' },
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 5, // (page-1) * limit
        take: 5,
      });
      expect(mockPrisma.room.count).toHaveBeenCalledWith({ where: { status: 'WAITING' } });

      expect(result).toEqual({
        rooms: mockRooms,
        pagination: {
          page: 2,
          limit: 5,
          total: 12,
          totalPages: 3, // Math.ceil(12/5)
        },
      });
    });

    it('should handle default options', async () => {
      const mockRooms = [{ id: 'room1', name: 'Room 1' }];
      const totalCount = 1;

      mockPrisma.room.findMany.mockResolvedValue(mockRooms);
      mockPrisma.room.count.mockResolvedValue(totalCount);

      const result = await roomRepository.findAll();

      expect(mockPrisma.room.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('create', () => {
    it('should create room and send kafka event', async () => {
      const roomData = {
        name: 'Test Room',
        hostDisplayname: 'Host User',
        maxPlayers: 10,
      };

      const createdRoom = {
        id: 'room1',
        code: '1234',
        ...roomData,
        currentPlayers: 0,
        status: 'WAITING',
      };

      // Mock the generateRoomCode to return a specific code
      jest.spyOn(roomRepository, 'generateRoomCode').mockReturnValue('1234');

      mockPrisma.room.create.mockResolvedValue(createdRoom);

      const result = await roomRepository.create(roomData);

      expect(roomRepository.generateRoomCode).toHaveBeenCalled();
      expect(mockPrisma.room.create).toHaveBeenCalledWith({
        data: {
          ...roomData,
          code: '1234',
        },
        include: {
          players: true,
        },
      });
      expect(mockKafkaProducer.send).toHaveBeenCalledWith({
        topic: 'room.events',
        messages: [
          {
            key: 'room1',
            value: expect.any(String),
          },
        ],
      });

      const sentMessage = JSON.parse(mockKafkaProducer.send.mock.calls[0][0].messages[0].value);
      expect(sentMessage.type).toBe('ROOM_CREATED');
      expect(sentMessage.data).toEqual(createdRoom);
      expect(sentMessage.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result).toEqual(createdRoom);
    });
  });

  describe('update', () => {
    it('should update room and send kafka event', async () => {
      const roomId = 'room1';
      const updateData = { name: 'Updated Room' };
      const updatedRoom = {
        id: roomId,
        code: '1234',
        name: 'Updated Room',
        players: [{ id: 'player1', displayname: 'Player 1' }],
      };

      mockPrisma.room.update.mockResolvedValue(updatedRoom);

      const result = await roomRepository.update(roomId, updateData);

      expect(mockPrisma.room.update).toHaveBeenCalledWith({
        where: { id: roomId },
        data: updateData,
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
      });
      expect(mockKafkaProducer.send).toHaveBeenCalledWith({
        topic: 'room.events',
        messages: [
          {
            key: 'room1',
            value: expect.any(String),
          },
        ],
      });

      const sentMessage = JSON.parse(mockKafkaProducer.send.mock.calls[0][0].messages[0].value);
      expect(sentMessage.type).toBe('ROOM_UPDATED');
      expect(sentMessage.data).toEqual(updatedRoom);
      expect(sentMessage.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result).toEqual(updatedRoom);
    });
  });

  describe('addPlayer', () => {
    it('should add player and send kafka event', async () => {
      const roomId = 'room1';
      const playerData = {
        displayname: 'New Player',
        userId: 'user123',
        isHost: false,
      };

      const createdPlayer = { id: 'player1', ...playerData };
      const updatedRoom = {
        id: roomId,
        currentPlayers: 1,
        players: [createdPlayer],
      };

      mockPrisma.roomPlayer.create.mockResolvedValue(createdPlayer);
      mockPrisma.room.update.mockResolvedValue(updatedRoom);

      const result = await roomRepository.addPlayer(roomId, playerData);

      expect(mockPrisma.roomPlayer.create).toHaveBeenCalledWith({
        data: {
          roomId,
          ...playerData,
        },
      });
      expect(mockPrisma.room.update).toHaveBeenCalledWith({
        where: { id: roomId },
        data: { currentPlayers: { increment: 1 } },
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
      });
      // Check the PLAYER_JOINED event (second call)
      expect(mockKafkaProducer.send).toHaveBeenNthCalledWith(2, {
        topic: 'room.events',
        messages: [
          {
            key: roomId, // roomId is used as key for PLAYER_JOINED event
            value: expect.any(String),
          },
        ],
      });

      const sentMessage = JSON.parse(mockKafkaProducer.send.mock.calls[1][0].messages[0].value);
      expect(sentMessage.type).toBe('PLAYER_JOINED');
      expect(sentMessage.data).toEqual({ roomId, player: createdPlayer, room: updatedRoom });
      expect(sentMessage.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result).toEqual({ player: createdPlayer, room: updatedRoom });
    });
  });

  describe('removePlayer', () => {
    it('should remove player and send kafka event', async () => {
      const roomId = 'room1';
      const playerId = 'player1';

      const deletedPlayer = { id: playerId, displayname: 'Player 1' };
      const updatedRoom = {
        id: roomId,
        currentPlayers: 0,
        players: [],
      };

      mockPrisma.roomPlayer.delete.mockResolvedValue(deletedPlayer);
      mockPrisma.room.update.mockResolvedValue(updatedRoom);

      const result = await roomRepository.removePlayer(roomId, playerId);

      expect(mockPrisma.roomPlayer.delete).toHaveBeenCalledWith({
        where: { id: playerId },
      });
      expect(mockPrisma.room.update).toHaveBeenCalledWith({
        where: { id: roomId },
        data: { currentPlayers: { decrement: 1 } },
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
      });
      // Check the PLAYER_LEFT event (second call)
      expect(mockKafkaProducer.send).toHaveBeenNthCalledWith(2, {
        topic: 'room.events',
        messages: [
          {
            key: roomId, // roomId is used as key for PLAYER_LEFT event
            value: expect.any(String),
          },
        ],
      });

      const sentMessage = JSON.parse(mockKafkaProducer.send.mock.calls[1][0].messages[0].value);
      expect(sentMessage.type).toBe('PLAYER_LEFT');
      expect(sentMessage.data).toEqual({ roomId, player: deletedPlayer, room: updatedRoom });
      expect(sentMessage.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result).toEqual({ player: deletedPlayer, room: updatedRoom });
    });
  });

  describe('findPlayerByUserId', () => {
    it('should find player by userId in room', async () => {
      const roomId = 'room1';
      const userId = 'user123';
      const expectedPlayer = { id: 'player1', displayname: 'Player 1', userId };

      mockPrisma.roomPlayer.findFirst.mockResolvedValue(expectedPlayer);

      const result = await roomRepository.findPlayerByUserId(roomId, userId);

      expect(mockPrisma.roomPlayer.findFirst).toHaveBeenCalledWith({
        where: {
          roomId,
          userId,
        },
      });
      expect(result).toEqual(expectedPlayer);
    });
  });

  describe('getRoomPlayers', () => {
    it('should get all players in room ordered by joinedAt', async () => {
      const roomId = 'room1';
      const expectedPlayers = [
        { id: 'player1', displayname: 'Player 1', joinedAt: new Date('2023-01-01') },
        { id: 'player2', displayname: 'Player 2', joinedAt: new Date('2023-01-02') },
      ];

      mockPrisma.roomPlayer.findMany.mockResolvedValue(expectedPlayers);

      const result = await roomRepository.getRoomPlayers(roomId);

      expect(mockPrisma.roomPlayer.findMany).toHaveBeenCalledWith({
        where: { roomId },
        orderBy: { joinedAt: 'asc' },
      });
      expect(result).toEqual(expectedPlayers);
    });
  });
});
