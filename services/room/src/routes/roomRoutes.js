const express = require('express');
const RoomController = require('../controllers/roomController');
const RoomService = require('../services/roomService');

const router = express.Router();

// Initialize service and controller
function createRoomController(req) {
  const roomService = new RoomService(req.prisma, req.kafkaProducer);
  return new RoomController(roomService);
}

// Middleware to attach controller to request
router.use((req, res, next) => {
  req.roomController = createRoomController(req);
  next();
});

// Routes
router.get('/', (req, res) => req.roomController.getRooms(req, res));
router.get('/:code', (req, res) => req.roomController.getRoom(req, res));
router.post('/', (req, res) => req.roomController.createRoom(req, res));
router.post('/:code/join', (req, res) => req.roomController.joinRoom(req, res));
router.post('/:code/leave', (req, res) => req.roomController.leaveRoom(req, res));
router.post('/:id/start', (req, res) => req.roomController.startGame(req, res));
router.patch('/:id', (req, res) => req.roomController.updateRoom(req, res));
router.post('/:id/kick/:playerId', (req, res) => req.roomController.kickPlayer(req, res));

module.exports = router;
