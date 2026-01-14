const BASE_URL = 'http://localhost:8082/api/v1';

async function testCreateRoom() {
  try {
    console.log('🧪 Testing create room...');
    const response = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Room API',
        maxPlayers: 10
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Create room success:', {
      id: data.id,
      code: data.code,
      name: data.name,
      currentPlayers: data.currentPlayers,
      maxPlayers: data.maxPlayers
    });
    return data;
  } catch (error) {
    console.log('❌ Create room failed:', error.message);
    return null;
  }
}

async function testJoinRoom(roomCode) {
  try {
    console.log(`🧪 Testing join room with code: ${roomCode}`);
    const response = await fetch(`${BASE_URL}/rooms/${roomCode}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayname: 'Test Player'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Join room success:', {
      player: data.player,
      room: {
        id: data.room.id,
        code: data.room.code,
        name: data.room.name,
        currentPlayers: data.room.currentPlayers
      }
    });
    return data;
  } catch (error) {
    console.log('❌ Join room failed:', error.message);
    return null;
  }
}

async function testGetRoom(roomCode) {
  try {
    console.log(`🧪 Testing get room with code: ${roomCode}`);
    const response = await fetch(`${BASE_URL}/rooms/${roomCode}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Get room success:', {
      id: data.id,
      code: data.code,
      name: data.name,
      currentPlayers: data.currentPlayers,
      maxPlayers: data.maxPlayers,
      status: data.status,
      playersCount: data.players?.length || 0
    });
    return data;
  } catch (error) {
    console.log('❌ Get room failed:', error.message);
    return null;
  }
}

async function testJoinRoomAgain(roomCode) {
  try {
    console.log(`🧪 Testing join room again with same player: ${roomCode}`);
    const response = await fetch(`${BASE_URL}/rooms/${roomCode}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayname: 'Test Player'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('❌ Join room again should fail:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.log('✅ Join room again correctly failed:', errorData.error);
      return null;
    }
  } catch (error) {
    console.log('✅ Join room again correctly failed:', error.message);
    return null;
  }
}

async function testInvalidRoomCode() {
  try {
    console.log('🧪 Testing invalid room code: 9999');
    const response = await fetch(`${BASE_URL}/rooms/9999/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayname: 'Test Player'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('❌ Invalid room code should fail:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.log('✅ Invalid room code correctly failed:', errorData.error);
      return null;
    }
  } catch (error) {
    console.log('✅ Invalid room code correctly failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Room API Tests...\n');

  // Test create room
  const room = await testCreateRoom();
  if (!room) {
    console.log('❌ Cannot continue tests without a room');
    return;
  }

  console.log('');

  // Test get room
  await testGetRoom(room.code);
  console.log('');

  // Test join room
  await testJoinRoom(room.code);
  console.log('');

  // Test get room again (should show player joined)
  await testGetRoom(room.code);
  console.log('');

  // Test join room again (should fail)
  await testJoinRoomAgain(room.code);
  console.log('');

  // Test invalid room code
  await testInvalidRoomCode();
  console.log('');

  console.log('🎉 All tests completed!');
}

// Check if room service is running
axios.get('http://localhost:8082/health')
  .then(() => {
    console.log('✅ Room service is running\n');
    runTests();
  })
  .catch(() => {
    console.log('❌ Room service is not running on localhost:8082');
    console.log('Please start the room service first: cd services/room && npm start');
  });
