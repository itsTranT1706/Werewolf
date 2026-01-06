const { createKafkaClient, createProducer, sendRoomEvent } = require('../utils/kafka');

// Mock kafkajs
jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    }),
  })),
}));

describe('Kafka Utils', () => {
  let mockKafka;
  let mockProducer;

  beforeEach(() => {
    mockKafka = {
      producer: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
      }),
    };

    // Reset environment variables
    process.env.KAFKA_BROKERS = 'localhost:9092';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createKafkaClient', () => {
    it('should create Kafka client with default brokers', () => {
      const { Kafka } = require('kafkajs');

      const client = createKafkaClient();

      expect(Kafka).toHaveBeenCalledWith({
        clientId: 'room-service',
        brokers: ['localhost:9092'],
      });
    });

    it('should create Kafka client with multiple brokers', () => {
      const { Kafka } = require('kafkajs');
      process.env.KAFKA_BROKERS = 'broker1:9092,broker2:9092,broker3:9092';

      const client = createKafkaClient();

      expect(Kafka).toHaveBeenCalledWith({
        clientId: 'room-service',
        brokers: ['broker1:9092', 'broker2:9092', 'broker3:9092'],
      });
    });
  });

  describe('createProducer', () => {
    it('should create and connect producer', async () => {
      const mockProducerInstance = {
        connect: jest.fn().mockResolvedValue(undefined),
      };

      mockKafka.producer.mockReturnValue(mockProducerInstance);

      const producer = await createProducer(mockKafka);

      expect(mockProducerInstance.connect).toHaveBeenCalledTimes(1);
      expect(producer).toBe(mockProducerInstance);
    });
  });

  describe('sendRoomEvent', () => {
    it('should send room event to Kafka', async () => {
      const mockProducer = {
        send: jest.fn().mockResolvedValue(undefined),
      };

      const eventType = 'ROOM_CREATED';
      const roomData = {
        id: 'room123',
        code: '1234',
        name: 'Test Room',
        currentPlayers: 1,
      };

      // Mock Date.now to return a consistent timestamp
      const fixedTimestamp = '2023-01-01T12:00:00.000Z';
      jest.spyOn(global, 'Date').mockImplementation(() => ({
        toISOString: () => fixedTimestamp,
      }));

      await sendRoomEvent(mockProducer, eventType, roomData);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'room.events',
        messages: [
          {
            key: 'room123',
            value: JSON.stringify({
              type: eventType,
              data: roomData,
              timestamp: fixedTimestamp,
            }),
          },
        ],
      });

      // Restore Date
      jest.restoreAllMocks();
    });

    it('should handle send errors gracefully', async () => {
      const mockProducer = {
        send: jest.fn().mockRejectedValue(new Error('Kafka connection failed')),
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const eventType = 'ROOM_CREATED';
      const roomData = { id: 'room123', name: 'Test Room' };

      // Should not throw error
      await expect(sendRoomEvent(mockProducer, eventType, roomData)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('Error sending room event:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle complex room data', async () => {
      const mockProducer = {
        send: jest.fn().mockResolvedValue(undefined),
      };

      const eventType = 'PLAYER_JOINED';
      const roomData = {
        roomId: 'room123',
        player: {
          id: 'player1',
          displayname: 'Player One',
          userId: 'user123',
          isHost: false,
          joinedAt: '2023-01-01T12:00:00.000Z', // JSON serialized format
        },
        room: {
          id: 'room123',
          code: '1234',
          name: 'Test Room',
          currentPlayers: 2,
          maxPlayers: 10,
          status: 'WAITING',
          players: [
            { id: 'host', displayname: 'Host', isHost: true },
            { id: 'player1', displayname: 'Player One', isHost: false },
          ],
        },
      };

      await sendRoomEvent(mockProducer, eventType, roomData);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'room.events',
        messages: [
          {
            key: roomData.roomId || roomData.id,
            value: expect.any(String),
          },
        ],
      });

      const sentMessage = JSON.parse(mockProducer.send.mock.calls[0][0].messages[0].value);
      expect(sentMessage.type).toBe(eventType);
      expect(sentMessage.data).toEqual(roomData);
      expect(sentMessage.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
