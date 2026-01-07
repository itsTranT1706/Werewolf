const io = require('socket.io-client');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MDZlZjA5LTIxYzYtNDNiMC04YWUzLWQyZWI3ZDY2YzdmMSIsInVzZXJuYW1lIjoicXVhbmRkX3Rlc3QzIiwiaWF0IjoxNzY3MTc1OTIzLCJleHAiOjE3NjcyNjIzMjN9.XBO2giR_D6IFUPeeeKbKJP-vUJx989HyFS_Z9yoxKjo';

const socket = io('http://localhost:80', {
    auth: { token }
});

socket.on('connect', () => {
    console.log('✅ Connected!');

    // Update faction
    socket.emit('UPDATE_FACTION', { roomId: 'room123', faction: 'WEREWOLF' });

    // Send faction chat
    socket.emit('CHAT_SEND_FACTION', {
        roomId: 'room123',
        faction: 'WEREWOLF',
        phase: 'NIGHT',
        text: 'Test faction chat from Node.js client'
    });
});

socket.on('CHAT_MESSAGE_FACTION', (data) => {
    console.log('📩 Received faction chat:', data);
});

socket.on('ERROR', (error) => {
    console.error('❌ Error:', error);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
});