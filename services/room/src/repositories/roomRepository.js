const { sendRoomEvent } = require('../utils/kafka');

class RoomRepository {
  constructor(prisma, kafkaProducer) {
    this.prisma = prisma;
    this.kafkaProducer = kafkaProducer;
  }

  // Generate a unique 4-digit room code
  generateRoomCode() {
    let code;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (code.length !== 4);
    return code;
  }

  // Find room by code
  async findByCode(code) {
    return this.prisma.room.findUnique({
      where: { code },
      include: {
        players: {
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  }

  // Find room by ID
  async findById(id) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        players: {
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  }

  // Get all rooms with pagination
  async findAll({ page = 1, limit = 10, status } = {}) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        include: {
          players: {
            orderBy: { joinedAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.room.count({ where }),
    ]);

    return {
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create new room
  async create(roomData) {
    let code;
    let attempts = 0;
    const maxAttempts = 100;

    // Generate unique 4-digit code
    do {
      code = this.generateRoomCode();
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique room code');
      }
    } while (await this.findByCode(code));

    const room = await this.prisma.room.create({
      data: {
        ...roomData,
        code,
      },
      include: {
        players: true,
      },
    });

    // Send Kafka event
    await sendRoomEvent(this.kafkaProducer, 'ROOM_CREATED', room);

    return room;
  }

  // Update room
  async update(id, updateData) {
    const room = await this.prisma.room.update({
      where: { id },
      data: updateData,
      include: {
        players: {
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    // Send Kafka event
    await sendRoomEvent(this.kafkaProducer, 'ROOM_UPDATED', room);

    return room;
  }

  // Delete room
  async delete(id) {
    const room = await this.prisma.room.delete({
      where: { id },
      include: {
        players: true,
      },
    });

    return room;
  }

  // Add player to room
  async addPlayer(roomId, playerData) {
    const player = await this.prisma.roomPlayer.create({
      data: {
        roomId,
        ...playerData,
      },
    });

    // Update room player count
    const room = await this.update(roomId, {
      currentPlayers: {
        increment: 1,
      },
    });

    // Send Kafka event
    await sendRoomEvent(this.kafkaProducer, 'PLAYER_JOINED', {
      roomId,
      player,
      room,
    });

    return { player, room };
  }

  // Remove player from room
  async removePlayer(roomId, playerId) {
    const player = await this.prisma.roomPlayer.delete({
      where: { id: playerId },
    });

    // Update room player count
    const room = await this.update(roomId, {
      currentPlayers: {
        decrement: 1,
      },
    });

    // Send Kafka event
    await sendRoomEvent(this.kafkaProducer, 'PLAYER_LEFT', {
      roomId,
      player,
      room,
    });

    return { player, room };
  }

  // Find player in room
  async findPlayer(roomId, playerId) {
    return this.prisma.roomPlayer.findFirst({
      where: {
        roomId,
        id: playerId,
      },
    });
  }

  // Find player by userId in room
  async findPlayerByUserId(roomId, userId) {
    return this.prisma.roomPlayer.findFirst({
      where: {
        roomId,
        userId,
      },
    });
  }

  // Find player by userId in any room (only WAITING rooms)
  async findPlayerByUserIdInAnyRoom(userId) {
    return this.prisma.roomPlayer.findFirst({
      where: {
        userId,
        room: {
          status: 'WAITING',
        },
      },
      include: {
        room: true,
      },
    });
  }

  // Get room players
  async getRoomPlayers(roomId) {
    return this.prisma.roomPlayer.findMany({
      where: { roomId },
      orderBy: { joinedAt: 'asc' },
    });
  }

  // Update player
  async updatePlayer(roomId, playerId, updateData) {
    return this.prisma.roomPlayer.update({
      where: { id: playerId },
      data: updateData,
    });
  }

  // Update player displayname
  async updatePlayerDisplayname(roomId, playerId, displayname) {
    const player = await this.prisma.roomPlayer.update({
      where: { id: playerId },
      data: { displayname },
    });

    // Get updated room with players
    const room = await this.findById(roomId);

    // Send Kafka event
    await sendRoomEvent(this.kafkaProducer, 'PLAYER_NAME_UPDATED', {
      roomId,
      player,
      room,
    });

    return { player, room };
  }
}

module.exports = RoomRepository;
