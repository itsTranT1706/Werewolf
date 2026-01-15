const { io } = require('socket.io-client');

// Test room service socket functionality with multiple clients
async function testRoomSocket() {
  console.log('==================================================');
  console.log('Room Service Socket.IO Comprehensive Test');
  console.log('==================================================\n');

  console.log('🧪 Testing all room operations with multiple clients...\n');

  // Test data
  const testData = {
    room1: {
      name: 'Test Room Alpha',
      maxPlayers: 5,
      displayname: 'Host1'
    },
    room2: {
      name: 'Test Room Beta',
      maxPlayers: 6,  // Increased to allow more players for game start test
      displayname: 'Host2'
    },
    players: [
      { displayname: 'Player1' },
      { displayname: 'Player2' },
      { displayname: 'Player3' },
      { displayname: 'Player4' }
    ]
  };

  let roomCodes = {};
  let clients = [];
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function logTest(testName, success, message = '') {
    testResults.total++;
    const status = success ? '✅' : '❌';
    console.log(`${status} ${testName}`);
    if (message) console.log(`   ${message}`);
    if (success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
  }

  // Create multiple clients
  function createClient(name) {
    const client = io('http://localhost:8082', {
      reconnection: false,
      timeout: 5000,
      transports: ['websocket', 'polling']
    });

    // Listen for all events for debugging
    client.onAny((event, ...args) => {
      if (event !== 'connect' && event !== 'disconnect' && event !== 'ROOM_CREATED' && event !== 'ROOM_JOINED' && event !== 'PLAYER_JOINED' && event !== 'ROOM_LEFT' && event !== 'PLAYER_LEFT') {
        console.log(`[EVENT] ${event}:`, args[0]);
      }
    });

    return client;
  }

  // Helper function to wait
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  try {
    // ===== TEST 1: Create Room =====
    console.log('📝 Test 1: Creating rooms with different hosts...');

    const host1 = createClient('Host1');
    const host2 = createClient('Host2');

    clients.push(host1, host2);

    // Promise to wait for room creation with timeout
    const room1Created = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Room 1 creation timeout'));
      }, 10000); // 10 second timeout
      
      host1.on('ROOM_CREATED', (data) => {
        clearTimeout(timeout);
        roomCodes.room1 = data.room.code;
        console.log(`   Room 1 created: ${data.room.code} (${data.room.name})`);
        resolve();
      });
      
      host1.on('ERROR', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Room 1 creation failed: ${error.message}`));
      });
    });

    const room2Created = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Room 2 creation timeout'));
      }, 10000); // 10 second timeout
      
      host2.on('ROOM_CREATED', (data) => {
        clearTimeout(timeout);
        roomCodes.room2 = data.room.code;
        console.log(`   Room 2 created: ${data.room.code} (${data.room.name})`);
        resolve();
      });
      
      host2.on('ERROR', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Room 2 creation failed: ${error.message}`));
      });
    });

    // Connect hosts first
    await Promise.all([
      new Promise(resolve => {
        host1.on('connect', () => {
          console.log('   Host1 connected');
          resolve();
        });
      }),
      new Promise(resolve => {
        host2.on('connect', () => {
          console.log('   Host2 connected');
          resolve();
        });
      })
    ]);

    // Create rooms sequentially with delay to avoid race conditions
    host1.emit('CREATE_ROOM', testData.room1);
    await room1Created;

    // Small delay before creating second room
    await wait(500);
    host2.emit('CREATE_ROOM', testData.room2);
    await room2Created;

    logTest('Create multiple rooms', true, `Created rooms: ${Object.values(roomCodes).join(', ')}`);

    // ===== TEST 2: Join Room =====
    console.log('\n📝 Test 2: Joining rooms with multiple players...');

    const players = [];
    for (let i = 0; i < 3; i++) {
      players.push(createClient(`Player${i + 1}`));
      clients.push(players[i]);
    }

    // Join Room 1
    const joinPromises = [];
    players.slice(0, 2).forEach((player, index) => {
      joinPromises.push(new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Player${index + 1} join timeout`));
        }, 5000);
        
        player.on('ROOM_JOINED', (data) => {
          clearTimeout(timeout);
          console.log(`   Player${index + 1} joined Room ${roomCodes.room1}`);
          resolve();
        });

        player.on('connect', () => {
          console.log(`   Player${index + 1} connected`);
          player.emit('JOIN_ROOM', {
            code: roomCodes.room1,
            displayname: testData.players[index].displayname
          });
        });
        
        player.on('ERROR', (error) => {
          clearTimeout(timeout);
          reject(new Error(`Player${index + 1} join failed: ${error.message}`));
        });
      }));
    });

    await Promise.all(joinPromises);
    logTest('Join room with multiple players', true, `2 players joined room ${roomCodes.room1}`);

    // ===== TEST 3: Get Room Info =====
    console.log('\n📝 Test 3: Getting room information...');

    const roomInfoPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Get room info timeout'));
      }, 5000);
      
      host1.on('ROOM_INFO', (data) => {
        clearTimeout(timeout);
        console.log(`   Room ${roomCodes.room1} info: ${data.room.players.length + 1}/${data.room.maxPlayers} players`);
        resolve(data);
      });

      host1.on('ERROR', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Get room info failed: ${error.message}`));
      });

      host1.emit('GET_ROOM_INFO');
    });

    const roomInfo = await roomInfoPromise;
    const expectedPlayers = 3; // host + 2 players
    const actualPlayers = roomInfo.room.players.length; // players array includes all players
    logTest('Get room info', actualPlayers === expectedPlayers,
      `Expected ${expectedPlayers} players, got ${actualPlayers}`);

    
    // ===== TEST 4: Join Room with Invalid Code =====
    console.log('\n📝 Test 4: Testing invalid room code...');

    // Tạo socket client mới cho test invalid join
    const player3 = createClient('Player3');
    clients.push(player3);

    const invalidJoinPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Invalid join timeout'));
      }, 5000);
      
      // Listen for ERROR event first
      player3.on('ERROR', (error) => {
        clearTimeout(timeout);
        console.log(`   Invalid room code error: ${error.message}`);
        resolve(error);
      });
      
      // Listen for connection and emit JOIN_ROOM
      player3.on('connect', () => {
        console.log('   Player3 connected for invalid join test');
        // Use setTimeout to ensure connection is fully established
        setTimeout(() => {
          player3.emit('JOIN_ROOM', {
            code: '9999', // Invalid code
            displayname: 'Player3'
          });
        }, 100);
      });
    });

    await invalidJoinPromise;
    logTest('Join room with invalid code', true, 'Properly rejected invalid room code');    
    
    // ===== TEST 5: Start Game (Failure - Insufficient Players) =====
    console.log('\n📝 Test 5: Starting game with insufficient players...');

    // Use host2 to start game - room2 only has 1 player, so this should fail
    const gameStartFailPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Game start timeout'));
      }, 10000);
      
      // Remove previous error listener if any
      host2.removeAllListeners('ERROR');
      
      host2.on('GAME_STARTED', (data) => {
        clearTimeout(timeout);
        console.log(`   Game started in room ${roomCodes.room2}`);
        resolve({ success: true, data });
      });

      host2.on('ERROR', (error) => {
        clearTimeout(timeout);
        console.log(`   Game start error: "${error.message}"`);
        resolve({ success: false, error: error.message });
      });

      host2.emit('START_GAME');
    });

    const gameFailResult = await gameStartFailPromise;
    const isExpectedFailure = !gameFailResult.success &&
      (gameFailResult.error === 'Need at least 4 players to start the game' ||
       gameFailResult.error === 'Only host can start the game');
    
    logTest('Start game (insufficient players)', isExpectedFailure, 
      isExpectedFailure ? `Correctly failed to start game: ${gameFailResult.error}` : 
      gameFailResult.success ? 'Game started unexpectedly' : `Unexpected error: ${gameFailResult.error}`);

    // ===== TEST 6: Start Game (Success - Sufficient Players) =====
    console.log('\n📝 Test 6: Starting game with sufficient players...');

    // Add 3 more players to room2 to reach minimum 4 players
    const gamePlayers = [];
    for (let i = 0; i < 3; i++) {
      const gamePlayer = createClient(`GamePlayer${i + 1}`);
      clients.push(gamePlayer);
      gamePlayers.push(gamePlayer);
    }

    // Join players to room2
    const gameJoinPromises = gamePlayers.map((player, index) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`GamePlayer${index + 1} join timeout`));
        }, 5000);

        player.on('ROOM_JOINED', () => {
          clearTimeout(timeout);
          console.log(`   GamePlayer${index + 1} joined Room ${roomCodes.room2}`);
          resolve();
        });

        player.on('connect', () => {
          player.emit('JOIN_ROOM', {
            code: roomCodes.room2,
            displayname: `GamePlayer${index + 1}`
          });
        });

        player.on('ERROR', (error) => {
          clearTimeout(timeout);
          reject(new Error(`GamePlayer${index + 1} join failed: ${error.message}`));
        });
      });
    });

    await Promise.all(gameJoinPromises);
    console.log(`   Added 3 players to room ${roomCodes.room2}, now has 4 players total`);

    // Now try to start the game - should succeed
    const gameStartSuccessPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Game start success timeout'));
      }, 10000);

      // Clean up previous listeners
      host2.removeAllListeners('ERROR');
      host2.removeAllListeners('GAME_STARTED');

      host2.on('GAME_STARTED', (data) => {
        clearTimeout(timeout);
        console.log(`   Game successfully started in room ${roomCodes.room2}`);
        resolve({ success: true, data });
      });

      host2.on('ERROR', (error) => {
        clearTimeout(timeout);
        console.log(`   Unexpected game start error: ${error.message}`);
        resolve({ success: false, error: error.message });
      });

      host2.emit('START_GAME');
    });

    const gameSuccessResult = await gameStartSuccessPromise;
    logTest('Start game (sufficient players)', gameSuccessResult.success,
      gameSuccessResult.success ? 'Game started successfully with 4+ players' : `Game failed: ${gameSuccessResult.error}`);

    // ===== TEST 7: Leave Room =====
    console.log('\n📝 Test 7: Players leaving room...');

    const leavePromises = [];
    players.slice(0, 2).forEach((player, index) => {
      leavePromises.push(new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Player${index + 1} leave timeout`));
        }, 5000);
        
        player.on('ROOM_LEFT', (data) => {
          clearTimeout(timeout);
          console.log(`   Player${index + 1} left room`);
          resolve();
        });

        player.on('ERROR', (error) => {
          clearTimeout(timeout);
          reject(new Error(`Player${index + 1} leave failed: ${error.message}`));
        });

        player.emit('LEAVE_ROOM');
      }));
    });

    await Promise.all(leavePromises);
    logTest('Leave room', true, 'Multiple players left room successfully');

    // ===== TEST 8: Host kicking player =====
    console.log('\n📝 Test 8: Host kicking player...');

    // First join a player to room 1 (room2 was used for game start test)
    const playerForKick = createClient('KickTestPlayer');
    clients.push(playerForKick);

    const joinForKick = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Kick test join timeout'));
      }, 5000);

      playerForKick.on('ROOM_JOINED', () => {
        clearTimeout(timeout);
        console.log('   Player joined room for kick test');
        resolve();
      });

      playerForKick.on('connect', () => {
        playerForKick.emit('JOIN_ROOM', {
          code: roomCodes.room1,
          displayname: 'KickTestPlayer'
        });
      });

      playerForKick.on('ERROR', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Kick test join failed: ${error.message}`));
      });
    });

    await joinForKick;

    // Get room info to find the player ID
    const roomInfoForKick = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Get room info for kick timeout'));
      }, 5000);

      host1.on('ROOM_INFO', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      host1.on('ERROR', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Get room info for kick failed: ${error.message}`));
      });
    });

    host1.emit('GET_ROOM_INFO');
    const roomInfoKick = await roomInfoForKick;
    const playerToKick = roomInfoKick.room.players.find(p => p.displayname === 'KickTestPlayer');

    if (!playerToKick) {
      throw new Error('Could not find player to kick');
    }

    // Host1 kicks the player
    const kickPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Kick operation timeout'));
      }, 5000);

      playerForKick.on('KICKED_FROM_ROOM', (data) => {
        clearTimeout(timeout);
        console.log('   Player was kicked from room');
        resolve(true);
      });

      playerForKick.on('ERROR', () => {
        clearTimeout(timeout);
        console.log('   Kick failed or permission denied');
        resolve(false);
      });

      host1.emit('KICK_PLAYER', { playerId: playerToKick.id });
    });

    const kickResult = await kickPromise;
    logTest('Kick player', kickResult, kickResult ? 'Player kicked successfully' : 'Kick operation failed');

    // ===== TEST 9: Room Update =====
    console.log('\n📝 Test 9: Update room settings...');

    const updatePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Room update timeout'));
      }, 5000);
      
      host1.on('ROOM_UPDATED', (data) => {
        clearTimeout(timeout);
        console.log('   Room settings updated');
        resolve(true);
      });

      host1.on('ERROR', (error) => {
        clearTimeout(timeout);
        console.log(`   Room update error: ${error.message}`);
        resolve(false);
      });

      host1.emit('UPDATE_ROOM', {
        name: 'Updated Test Room',
        maxPlayers: 8
      });
    });

    const updateResult = await updatePromise;
    logTest('Update room settings', updateResult, updateResult ? 'Room updated successfully' : 'Update failed');

    // ===== CLEANUP =====
    console.log('\n🧹 Cleaning up...');

    // Leave all rooms and disconnect
    const cleanupPromises = clients.map(client => {
      return new Promise(resolve => {
        client.emit('LEAVE_ROOM');
        setTimeout(() => {
          client.disconnect();
          resolve();
        }, 100);
      });
    });

    await Promise.all(cleanupPromises);
    logTest('Cleanup', true, 'All clients disconnected');

    // ===== SUMMARY =====
    console.log('\n==================================================');
    console.log('TEST SUMMARY');
    console.log('==================================================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    if (testResults.failed === 0) {
      console.log('🎉 All tests passed! Room service is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the implementation.');
    }

  } catch (error) {
    console.error('\n💥 Test suite failed with error:', error);
    testResults.failed++;
  } finally {
    // Ensure all clients are disconnected
    clients.forEach(client => {
      try {
        client.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    });

    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

// Run the test
if (require.main === module) {
  testRoomSocket().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { testRoomSocket };