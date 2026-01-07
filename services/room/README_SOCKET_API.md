# Room Service - Socket.IO API

## Overview
The Room Service has been converted from REST APIs to Socket.IO for real-time room management. Players can create and join rooms using room codes without requiring authentication.

## Socket Events

### Room Creation
```javascript
// Create a new room
socket.emit('CREATE_ROOM', {
  name: 'My Game Room',        // Room name (required, 1-100 chars)
  maxPlayers: 10,              // Max players (optional, 4-75, default: 75)
  settings: { /* room settings */ }, // Optional room settings
  displayname: 'HostName'      // Host display name (optional)
});

// Response
socket.on('ROOM_CREATED', (data) => {
  console.log(data.room); // { id, code, name, maxPlayers, currentPlayers, status, settings, players }
});
```

### Room Joining
```javascript
// Join an existing room using room code
socket.emit('JOIN_ROOM', {
  code: '1234',                // 4-digit room code (required)
  displayname: 'PlayerName'    // Player display name (required, 1-50 chars)
});

// Response
socket.on('ROOM_JOINED', (data) => {
  console.log(data.room);      // Room info
  console.log(data.player);    // Player info
});

// Notify other players in room
socket.on('PLAYER_JOINED', (data) => {
  console.log(data.player);    // New player who joined
  console.log(data.room);      // Updated room info
});
```

### Room Management
```javascript
// Leave current room
socket.emit('LEAVE_ROOM');

// Response
socket.on('ROOM_LEFT', (data) => {
  console.log('Left room:', data.roomId);
});

// Notify others when player leaves
socket.on('PLAYER_LEFT', (data) => {
  console.log('Player left:', data.playerId, data.displayname);
  console.log('Updated room:', data.room);
});

// Get current room information
socket.emit('GET_ROOM_INFO');

// Response
socket.on('ROOM_INFO', (data) => {
  console.log(data.room); // Full room details
});
```

### Game Management (Host Only)
```javascript
// Start the game (host only)
socket.emit('START_GAME');

// Response
socket.on('GAME_STARTED', (data) => {
  console.log('Game started:', data.room);
});

// Update room settings (host only)
socket.emit('UPDATE_ROOM', {
  name: 'New Room Name',      // Optional
  maxPlayers: 20,             // Optional (4-75)
  settings: { /* new settings */ } // Optional
});

// Response
socket.on('ROOM_UPDATED', (data) => {
  console.log('Room updated:', data.room);
});

// Kick a player (host only)
socket.emit('KICK_PLAYER', {
  playerId: 'player-uuid'     // Player to kick
});

// Notify room when player is kicked
socket.on('PLAYER_KICKED', (data) => {
  console.log('Player kicked:', data.playerId);
  console.log('Updated room:', data.room);
});
```

### Host Changes
```javascript
// When the current host leaves, a new host is assigned
socket.on('NEW_HOST', (data) => {
  console.log('New host assigned:', data.newHost);
  console.log('Updated room:', data.room);
});
```

### Error Handling
```javascript
// All operations can return errors
socket.on('ERROR', (error) => {
  console.error('Operation failed:', error.message);
});

// Handle player disconnections
socket.on('PLAYER_DISCONNECTED', (data) => {
  console.log('Player disconnected:', data.playerId, data.displayname);
});
```

## Socket Room Grouping
The service uses `socket.join(roomId)` to group players into virtual rooms:
- When a player creates or joins a room, they are automatically added to the socket room
- Room broadcasts are sent only to players in the same socket room
- Players are removed from socket rooms when they leave or disconnect

## Anonymous Access
- No authentication required for room operations
- Players can join with just a display name
- Room codes are 4-digit numbers (0000-9999)
- First player to join becomes the host

## Connection
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:8082');

// Handle connection
socket.on('connect', () => {
  console.log('Connected to room service');
});

socket.on('disconnect', () => {
  console.log('Disconnected from room service');
});
```

## Room States
- `WAITING`: Room is open for players to join
- `STARTING`: Game is about to start
- `IN_PROGRESS`: Game is currently running
- `FINISHED`: Game has ended

## Validation Rules
- Room names: 1-100 characters
- Display names: 1-50 characters
- Room codes: Exactly 4 digits
- Max players: 4-75
- Minimum 4 players required to start a game
