const io = require('socket.io-client');

// === CẤU HÌNH TEST ===
const GATEWAY_URL = 'http://localhost:80';
const ROOM_ID = 'test-room-123';

// Giả sử bạn có 3 JWT tokens khác nhau
// Trong thực tế, login 3 users khác nhau để lấy 3 tokens
const TOKENS = {
    wolf1: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MDZlZjA5LTIxYzYtNDNiMC04YWUzLWQyZWI3ZDY2YzdmMSIsInVzZXJuYW1lIjoicXVhbmRkX3Rlc3QzIiwiaWF0IjoxNzY3MTc1OTIzLCJleHAiOjE3NjcyNjIzMjN9.XBO2giR_D6IFUPeeeKbKJP-vUJx989HyFS_Z9yoxKjo',
    wolf2: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFlOGRkN2FlLThkMjAtNDM2OS1iNjYzLTc1Yjg1MzNmODQyOSIsInVzZXJuYW1lIjoicXVhbmRkX3Rlc3QyIiwiaWF0IjoxNzY3MTc1OTE1LCJleHAiOjE3NjcyNjIzMTV9.Rc5S8kbxMfaoeDQPEqSZ_CllbWdwJrDmNVuCC3-bSVg', // Thay bằng token thật
    villager: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgyYTFkYzU4LTRiYzYtNGI3OS1iNWJmLTk4NGYyNmJlOGQ3YSIsInVzZXJuYW1lIjoicXVhbmRkX3Rlc3QxIiwiaWF0IjoxNzY3MTc1ODY1LCJleHAiOjE3NjcyNjIyNjV9.dZPFXZlPcvd1pfgkTNIVYkSRnwntlXXPdJ65b3LedLI'  // Thay bằng token thật
};

// === TẠO 3 CONNECTIONS ===
const sockets = {};

function createPlayer(name, token, faction) {
    console.log(`\n🎮 Creating player: ${name} (${faction})`);

    const socket = io(GATEWAY_URL, {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log(`✅ [${name}] Connected`);

        // Join room
        socket.emit('ROOM_JOIN', { roomId: ROOM_ID });

        // Update faction
        socket.emit('UPDATE_FACTION', { roomId: ROOM_ID, faction });
        console.log(`🏷️  [${name}] Faction set to: ${faction}`);
    });

    socket.on('connect_error', (err) => {
        console.error(`❌ [${name}] Connection error:`, err.message);
    });

    socket.on('ERROR', (error) => {
        console.error(`❌ [${name}] Error:`, error);
    });

    // Listen for room chat
    socket.on('CHAT_MESSAGE', (data) => {
        console.log(`💬 [${name}] Room chat:`, data.payload.text);
    });

    // Listen for faction chat
    socket.on('CHAT_MESSAGE_FACTION', (data) => {
        const { userId, faction, text } = data.payload;
        console.log(`🐺 [${name}] Faction chat (${faction}):`, text);
    });

    sockets[name] = socket;
    return socket;
}

// === KHỞI TẠO 3 PLAYERS ===
setTimeout(() => {
    createPlayer('Wolf1', TOKENS.wolf1, 'WEREWOLF');
    createPlayer('Wolf2', TOKENS.wolf2, 'WEREWOLF');
    createPlayer('Villager', TOKENS.villager, 'VILLAGER');
}, 500);

// === TEST SCENARIOS ===
setTimeout(() => {
    console.log('\n\n=== 📝 TEST 1: Room Chat (All should receive) ===');
    sockets.Wolf1.emit('CHAT_SEND', {
        roomId: ROOM_ID,
        text: 'Hello everyone in the room!'
    });
}, 2000);

setTimeout(() => {
    console.log('\n\n=== 🐺 TEST 2: Werewolf Faction Chat (Only wolves) ===');
    sockets.Wolf1.emit('CHAT_SEND_FACTION', {
        roomId: ROOM_ID,
        faction: 'WEREWOLF',
        phase: 'NIGHT',
        text: 'Secret wolf meeting - attack the villager!'
    });
    console.log('Expected: Wolf1 ✅, Wolf2 ✅, Villager ❌');
}, 4000);

setTimeout(() => {
    console.log('\n\n=== 🐺 TEST 3: Wolf2 sends faction chat ===');
    sockets.Wolf2.emit('CHAT_SEND_FACTION', {
        roomId: ROOM_ID,
        faction: 'WEREWOLF',
        phase: 'NIGHT',
        text: 'I agree, lets do it!'
    });
    console.log('Expected: Wolf1 ✅, Wolf2 ✅, Villager ❌');
}, 6000);

setTimeout(() => {
    console.log('\n\n=== ❌ TEST 4: Werewolf chat during DAY (Should fail) ===');
    sockets.Wolf1.emit('CHAT_SEND_FACTION', {
        roomId: ROOM_ID,
        faction: 'WEREWOLF',
        phase: 'DAY',
        text: 'This should not work'
    });
    console.log('Expected: No one receives (gateway validation)');
}, 8000);

setTimeout(() => {
    console.log('\n\n=== 👤 TEST 5: Villager tries to send wolf chat (Should fail if validated) ===');
    sockets.Villager.emit('CHAT_SEND_FACTION', {
        roomId: ROOM_ID,
        faction: 'WEREWOLF',
        phase: 'NIGHT',
        text: 'Hacking attempt'
    });
    console.log('Expected: Should work but shows security issue - need faction verification!');
}, 10000);

setTimeout(() => {
    console.log('\n\n=== 🏁 TEST COMPLETED ===');
    console.log('Disconnecting all players...');
    Object.values(sockets).forEach(s => s.disconnect());
    setTimeout(() => process.exit(0), 1000);
}, 12000);

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n👋 Closing all connections...');
    Object.values(sockets).forEach(s => s.disconnect());
    process.exit(0);
});
