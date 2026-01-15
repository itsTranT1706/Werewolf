# 🧪 GAMEPLAY TEST CASES

## 📋 Chuẩn bị

### 1. Đảm bảo services đang chạy
```bash
docker compose ps
# Phải thấy: api-gateway, gameplay-service, kafka đang running
```

### 2. Mở Browser Console
- Chrome/Edge: F12 → Console tab
- Copy-paste các đoạn code test vào console

---

## 🎯 TEST CASE 1: START GAME & ROLE ASSIGNMENT

### Kết nối Socket
```javascript
// Trong browser console tại http://localhost:3000
const socket = io('http://localhost:8080', {
  auth: {
    token: localStorage.getItem('token') || null,
    guestId: localStorage.getItem('guest_user_id') || null
  }
})

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id)
})

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected')
})

// Listen tất cả events để debug
socket.onAny((eventName, ...args) => {
  console.log(`📨 Event: ${eventName}`, args)
})
```

### Start Game
```javascript
const testRoomId = 'test-room-' + Date.now()

socket.emit('GAME_START', {
  roomId: testRoomId,
  players: [
    { userId: 'gm1', username: 'GM' },
    { userId: 'p1', username: 'Alice' },
    { userId: 'p2', username: 'Bob' },
    { userId: 'p3', username: 'Charlie' },
    { userId: 'p4', username: 'Dave' },
    { userId: 'p5', username: 'Eve' },
    { userId: 'p6', username: 'Frank' },
    { userId: 'p7', username: 'Grace' },
    { userId: 'p8', username: 'Hannah' },
    { userId: 'p9', username: 'Ivan' },
    { userId: 'p10', username: 'Jack' },
    { userId: 'p11', username: 'Kate' },
    { userId: 'p12', username: 'Leo' }
  ],
  availableRoles: ['WEREWOLF', 'SEER', 'WITCH', 'BODYGUARD', 'VILLAGER', 'CUPID', 'MONSTER_HUNTER']
})
```

### Expected Events:
```javascript
// GM nhận
socket.on('GAME_ROLE_ASSIGNMENT_LIST', (data) => {
  console.log('📋 GM received role list:', data)
  // data.payload.assignment = array of { player, role, roleName, faction }
  window.roleAssignment = data.payload.assignment
  console.table(window.roleAssignment)
})

// Mỗi player nhận
socket.on('GAME_ROLE_ASSIGNED', (data) => {
  console.log('🎭 Player received role:', data)
  // data.payload = { userId, role, roleName, faction }
})

// Tất cả nhận
socket.on('GAME_STARTED', (data) => {
  console.log('🎮 Game started:', data)
})
```

### ✅ Pass Criteria:
- GM nhận được GAME_ROLE_ASSIGNMENT_LIST với đầy đủ 12 players
- Mỗi player có role hợp lệ
- Có ít nhất 1 WEREWOLF và nhiều VILLAGER

---

## 🌙 TEST CASE 2: NIGHT PHASE - CUPID (ĐÊM 1)

### Start Night
```javascript
socket.emit('GM_START_NIGHT', {
  roomId: testRoomId
})
```

### Expected Event:
```javascript
socket.on('NIGHT_PHASE_STARTED', (data) => {
  console.log('🌙 Night started:', data)
  // data.payload = { day: 1, message: "Đêm 1 bắt đầu..." }
})
```

### Cupid Select Lovers
```javascript
// Chọn 2 người làm lovers (ví dụ: p1 và p7)
socket.emit('GM_CUPID_SELECT', {
  roomId: testRoomId,
  lovers: ['p1', 'p7']  // Alice và Grace
})
```

### Expected Event:
```javascript
socket.on('LOVERS_SELECTED', (data) => {
  console.log('💘 Lover selected:', data)
  // data.payload = { yourLover: { userId, username }, message }
  // CHỈ p1 và p7 nhận event này
})
```

### ✅ Pass Criteria:
- NIGHT_PHASE_STARTED broadcast tới tất cả
- LOVERS_SELECTED chỉ gửi riêng cho 2 người được chọn
- Không thể chọn lovers lần 2 (nếu gọi lại → lỗi)

---

## 🐺 TEST CASE 3: WEREWOLF KILL

### Werewolf chọn target
```javascript
// Werewolf giết Bob (p2)
socket.emit('GM_WEREWOLF_KILL', {
  roomId: testRoomId,
  targetUserId: 'p2'
})
```

### ✅ Pass Criteria:
- Không có event broadcast (internal state only)
- Console log trong gameplay service: "✅ Werewolf targeting: Bob"

---

## 🔮 TEST CASE 4: SEER CHECK

### Seer xem vai trò
```javascript
// Seer xem Alice (p1)
socket.emit('GM_SEER_CHECK', {
  roomId: testRoomId,
  targetUserId: 'p1'
})
```

### Expected Event (GM only):
```javascript
socket.on('GM_SEER_RESULT', (data) => {
  console.log('🔮 Seer result:', data)
  // data.payload = { 
  //   checkedPlayer: 'Alice', 
  //   checkedUserId: 'p1',
  //   result: 'WEREWOLF' hoặc 'VILLAGER',
  //   message: 'Alice là Ma Sói 🐺' hoặc 'Alice là Dân Làng 👨‍🌾'
  // }
})
```

### ✅ Pass Criteria:
- GM_SEER_RESULT chỉ gửi cho GM
- Result = 'WEREWOLF' nếu Alice là sói, ngược lại = 'VILLAGER'

---

## 🛡️ TEST CASE 5: BODYGUARD PROTECT

### Bodyguard bảo vệ
```javascript
// Bảo vệ Bob (người bị sói giết)
socket.emit('GM_BODYGUARD_PROTECT', {
  roomId: testRoomId,
  targetUserId: 'p2'
})
```

### ✅ Pass Criteria:
- Không có event broadcast
- Không thể bảo vệ cùng người 2 đêm liên tiếp (test ở đêm 2)

---

## 🧙‍♀️ TEST CASE 6: WITCH ACTION

### Witch cứu + không độc
```javascript
socket.emit('GM_WITCH_ACTION', {
  roomId: testRoomId,
  save: true,              // Cứu người bị sói giết
  poisonTargetUserId: null // Không độc ai
})
```

### Witch độc (đêm sau)
```javascript
socket.emit('GM_WITCH_ACTION', {
  roomId: testRoomId,
  save: false,             // Không cứu
  poisonTargetUserId: 'p3' // Độc Charlie
})
```

### ✅ Pass Criteria:
- Mỗi skill chỉ dùng được 1 lần
- Nếu gọi lại save sau khi đã dùng → lỗi "Witch save skill already used"

---

## 🌃 TEST CASE 7: END NIGHT & CALCULATE RESULT

### End Night
```javascript
socket.emit('GM_END_NIGHT', {
  roomId: testRoomId
})
```

### Expected Event (GM only):
```javascript
socket.on('GM_NIGHT_RESULT', (data) => {
  console.log('📊 Night result:', data)
  console.log('Deaths:', data.payload.deaths)
  console.log('Saved:', data.payload.saved)
  console.log('Protected:', data.payload.protected)
  
  // Lưu để dùng cho announce
  window.nightResult = data.payload
})
```

### Test Scenarios:

#### Scenario A: Witch cứu + Bodyguard bảo vệ cùng người
```javascript
// Werewolf giết p2
// Witch cứu
// Bodyguard bảo vệ p2
// Result: p2 SỐNG (saved), không ai chết
```

#### Scenario B: Witch không cứu, Bodyguard bảo vệ người khác
```javascript
// Werewolf giết p2
// Witch không cứu
// Bodyguard bảo vệ p5
// Result: p2 CHẾT
```

#### Scenario C: Witch độc thêm người
```javascript
// Werewolf giết p2
// Witch không cứu, độc p3
// Result: p2 CHẾT, p3 CHẾT (2 người chết)
```

### ✅ Pass Criteria:
- GM_NIGHT_RESULT chỉ gửi cho GM
- Logic tính chính xác:
  - Witch save → target sống
  - Bodyguard protect → target sống
  - Cả 2 cùng target → target sống (1 trong 2 save thôi cũng đủ)
  - Poison → target chết thêm

---

## 💀 TEST CASE 8: ANNOUNCE DEATHS

### Announce
```javascript
socket.emit('GM_ANNOUNCE_DEATHS', {
  roomId: testRoomId,
  deaths: window.nightResult.deaths
})
```

### Expected Event (All players):
```javascript
socket.on('PLAYERS_DIED', (data) => {
  console.log('💀 Deaths announced:', data)
  // data.payload = { deaths: [...], count: 0-2, message }
})
```

### ✅ Pass Criteria:
- PLAYERS_DIED broadcast tới tất cả
- Nếu deaths.length = 0 → message = "Đêm qua yên bình, không ai chết"
- Nếu có người chết → message liệt kê tên

---

## 💔 TEST CASE 9: LOVERS CHAIN DEATH

### Setup: Lovers có 1 người chết
```javascript
// Giả sử p1 (Alice) là lover với p7 (Grace)
// Sói giết p1
socket.emit('GM_WEREWOLF_KILL', {
  roomId: testRoomId,
  targetUserId: 'p1'
})

socket.emit('GM_END_NIGHT', { roomId: testRoomId })
```

### Expected:
```javascript
socket.on('GM_NIGHT_RESULT', (data) => {
  console.log('Deaths:', data.payload.deaths)
  // Expect: [
  //   { userId: 'p1', username: 'Alice', cause: 'WEREWOLF_KILL' },
  //   { userId: 'p7', username: 'Grace', cause: 'LOVERS_SUICIDE' }
  // ]
})
```

### ✅ Pass Criteria:
- Khi 1 lover chết → lover kia tự động chết theo
- Cause = 'LOVERS_SUICIDE'

---

## ☀️ TEST CASE 10: DAY PHASE & VOTE

### Start Day
```javascript
socket.emit('GM_START_DAY', {
  roomId: testRoomId,
  duration: 120 // 2 phút
})
```

### Expected Event:
```javascript
socket.on('DAY_PHASE_STARTED', (data) => {
  console.log('☀️ Day started:', data)
  // data.payload = { day: 1, duration: 120, message }
})
```

### Players Vote
```javascript
// p1 vote p3
socket.emit('PLAYER_VOTE', {
  roomId: testRoomId,
  targetUserId: 'p3'
})

// Giả lập nhiều người vote
const votes = {
  'p1': 'p3',  // Alice vote Charlie
  'p2': 'p3',  // Bob vote Charlie
  'p3': 'p5',  // Charlie vote Eve
  'p4': 'p3',  // Dave vote Charlie
  'p5': 'p3',  // Eve vote Charlie (4 phiếu cho Charlie)
  'p6': 'p10', // Frank vote Jack
}

Object.entries(votes).forEach(([voterId, targetId]) => {
  // Phải emit từ socket của từng user riêng
  // Hoặc fake bằng cách emit với userId khác nhau
  socket.emit('PLAYER_VOTE', {
    roomId: testRoomId,
    targetUserId: targetId
  })
})
```

### Expected Event (Optional):
```javascript
socket.on('VOTE_RECORDED', (data) => {
  console.log('🗳️ Vote recorded:', data)
})
```

### End Vote
```javascript
socket.emit('GM_END_VOTE', {
  roomId: testRoomId
})
```

### Expected Event:
```javascript
socket.on('VOTE_RESULT', (data) => {
  console.log('📊 Vote result:', data)
  console.log('Hanged:', data.payload.hangedPlayer)
  console.log('Vote details:', data.payload.voteResults)
  
  window.voteResult = data.payload
})
```

### ✅ Pass Criteria:
- Player với nhiều phiếu nhất bị treo
- Hòa phiếu → không ai bị treo (reason: 'TIE')
- Mayor vote = 2 phiếu thay vì 1

---

## 🎯 TEST CASE 11: HUNTER SHOOT

### Setup: Hunter bị vote
```javascript
// Giả sử p7 (Grace) là Hunter và bị vote
// Sau khi GM_END_VOTE, nếu hangedPlayer.role === 'MONSTER_HUNTER'
```

### Expected Event (GM only):
```javascript
socket.on('HUNTER_CAN_SHOOT', (data) => {
  console.log('🔫 Hunter can shoot:', data)
  // data.payload = { hunterId, hunterName, message }
})
```

### Hunter bắn
```javascript
socket.emit('GM_HUNTER_SHOOT', {
  roomId: testRoomId,
  hunterId: 'p7',      // Grace
  targetUserId: 'p1'   // Bắn Alice
})
```

### Expected Event:
```javascript
socket.on('HUNTER_SHOT', (data) => {
  console.log('🔫 Hunter shot:', data)
  // data.payload = {
  //   hunterId: 'p7',
  //   deaths: [{ userId: 'p1', username: 'Alice', cause: 'HUNTER_SHOT' }],
  //   chainHunter: null | { userId, username }
  // }
})
```

### Test Chain Reaction:
```javascript
// Nếu Hunter bắn Hunter khác
socket.emit('GM_HUNTER_SHOOT', {
  roomId: testRoomId,
  hunterId: 'p7',      // Grace (Hunter)
  targetUserId: 'p10'  // Jack (cũng là Hunter)
})

// Expected: HUNTER_CAN_SHOOT event lại với hunterId = 'p10'
```

### ✅ Pass Criteria:
- Hunter chỉ bắn khi chết
- Bắn trúng Hunter → chain reaction
- Deaths có cause = 'HUNTER_SHOT'

---

## 🏁 TEST CASE 12: WIN CONDITION

### Villagers Win
```javascript
// Kill tất cả Werewolves
// Sau khi announce deaths hoặc vote result
socket.on('GAME_OVER', (data) => {
  console.log('🏁 Game over:', data)
  // data.payload = {
  //   winner: 'VILLAGER',
  //   message: 'Phe Dân Làng thắng! Tất cả Ma Sói đã bị tiêu diệt.',
  //   alivePlayers: [...],
  //   allPlayers: [...]
  // }
})
```

### Werewolves Win
```javascript
// Werewolves >= Villagers
// winner: 'WEREWOLF'
// message: 'Phe Ma Sói thắng! Dân làng đã bị tiêu diệt.'
```

### ✅ Pass Criteria:
- GAME_OVER broadcast khi có phe thắng
- Winner chính xác
- allPlayers có đầy đủ thông tin role

---

## 🔄 TEST CASE 13: FULL GAME FLOW

### Complete flow (auto test)
```javascript
async function testFullGame() {
  console.log('🎮 Starting full game test...')
  
  const roomId = 'test-full-' + Date.now()
  
  // 1. Start game
  socket.emit('GAME_START', {
    roomId,
    players: [
      { userId: 'gm', username: 'GM' },
      { userId: 'p1', username: 'Alice' },
      { userId: 'p2', username: 'Bob' },
      { userId: 'p3', username: 'Charlie' },
      { userId: 'p4', username: 'Dave' },
      { userId: 'p5', username: 'Eve' }
    ],
    availableRoles: ['WEREWOLF', 'SEER', 'WITCH', 'BODYGUARD', 'VILLAGER', 'MONSTER_HUNTER']
  })
  
  await sleep(2000)
  
  // 2. Night 1
  console.log('🌙 Night 1')
  socket.emit('GM_START_NIGHT', { roomId })
  
  await sleep(1000)
  
  // Werewolf kill
  socket.emit('GM_WEREWOLF_KILL', { roomId, targetUserId: 'p2' })
  
  // Seer check
  socket.emit('GM_SEER_CHECK', { roomId, targetUserId: 'p1' })
  
  // Bodyguard protect
  socket.emit('GM_BODYGUARD_PROTECT', { roomId, targetUserId: 'p3' })
  
  // Witch save
  socket.emit('GM_WITCH_ACTION', { roomId, save: true, poisonTargetUserId: null })
  
  await sleep(1000)
  
  // End night
  socket.emit('GM_END_NIGHT', { roomId })
  
  await sleep(2000)
  
  // Announce deaths
  socket.emit('GM_ANNOUNCE_DEATHS', { roomId, deaths: [] })
  
  await sleep(1000)
  
  // 3. Day 1
  console.log('☀️ Day 1')
  socket.emit('GM_START_DAY', { roomId, duration: 60 })
  
  await sleep(1000)
  
  // Vote
  socket.emit('PLAYER_VOTE', { roomId, targetUserId: 'p1' })
  
  await sleep(1000)
  
  // End vote
  socket.emit('GM_END_VOTE', { roomId })
  
  console.log('✅ Full game test completed')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Run test
testFullGame()
```

---

## 🐛 DEBUG TIPS

### Check Kafka messages
```bash
# Trong terminal
docker logs werewolf-gameplay-service-1 --tail 50 -f
docker logs werewolf-api-gateway-1 --tail 50 -f
```

### Check game state
```javascript
// Thêm vào gmHandlers.js để debug
console.log('Current game state:', gameStateManager.getGame(roomId))
```

### Common Issues:

1. **Socket không kết nối**
   - Check VITE_SOCKET_URL trong .env
   - Check CORS trong api-gateway

2. **Event không nhận được**
   - Check socket.onAny() để xem tất cả events
   - Check kafka logs

3. **Logic sai**
   - Check game state trong console
   - Verify night actions đã được save chưa

---

## 📊 EXPECTED RESULTS SUMMARY

| Test Case | Expected Event | Target | Pass Criteria |
|-----------|---------------|--------|---------------|
| 1. Start Game | GAME_ROLE_ASSIGNMENT_LIST | GM | ✅ Role list đầy đủ |
| 1. Start Game | GAME_ROLE_ASSIGNED | Each player | ✅ Mỗi người nhận role riêng |
| 2. Cupid | LOVERS_SELECTED | 2 lovers | ✅ Chỉ 2 người nhận |
| 4. Seer | GM_SEER_RESULT | GM | ✅ Result đúng WEREWOLF/VILLAGER |
| 7. End Night | GM_NIGHT_RESULT | GM | ✅ Deaths/saved/protected chính xác |
| 8. Announce | PLAYERS_DIED | All | ✅ Broadcast tới tất cả |
| 9. Lovers | Deaths chain | All | ✅ 2 người chết cùng lúc |
| 10. Vote | VOTE_RESULT | All | ✅ Player với nhiều phiếu nhất bị treo |
| 11. Hunter | HUNTER_SHOT | All | ✅ Hunter bắn được + chain |
| 12. Win | GAME_OVER | All | ✅ Winner đúng, game kết thúc |

---

## ✅ CHECKLIST

- [ ] Socket kết nối thành công
- [ ] Game start + role assignment
- [ ] Cupid select lovers (đêm 1)
- [ ] Werewolf kill
- [ ] Seer check
- [ ] Bodyguard protect
- [ ] Witch save/poison
- [ ] End night + calculate result
- [ ] Announce deaths
- [ ] Lovers chain death
- [ ] Day phase start
- [ ] Player vote
- [ ] Vote result
- [ ] Hunter shoot
- [ ] Hunter chain reaction
- [ ] Win condition check
- [ ] Game over broadcast

**Test thành công khi tất cả ✅ được check!**
