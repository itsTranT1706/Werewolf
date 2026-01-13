# 🎮 GM MODE - GAME FLOW DOCUMENTATION

> Tài liệu mô tả luồng xử lý Game Master Mode cho hệ thống Ma Sói

---

## 📋 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Luồng chuẩn bị game](#luồng-chuẩn-bị-game)
4. [Luồng mỗi đêm (Night Phase)](#luồng-mỗi-đêm-night-phase)
5. [Luồng ban ngày (Day Phase)](#luồng-ban-ngày-day-phase)
6. [Game State Management](#game-state-management)
7. [Events & Commands](#events--commands)
8. [Ví dụ thực tế](#ví-dụ-thực-tế)

---

## 🎯 TỔNG QUAN

### Khái niệm

- **Game Master (GM)**: Người quản trò, điều hành game, biết tất cả vai trò
- **Players**: Người chơi, chơi offline, quyết định riêng với GM
- **Hệ thống**: Công cụ tracking, tính toán kết quả, hiển thị thông tin cho GM

### Vai trò Quản Trò

GM chịu trách nhiệm:
1. Nhận phân vai từ hệ thống
2. Gọi từng role mỗi đêm (offline)
3. Nhập hành động vào hệ thống
4. Nhận kết quả tính toán
5. Công bố thông tin cho người chơi

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
┌─────────────┐      Socket.io       ┌──────────────┐
│   Client    │ ←──────────────────→ │ API Gateway  │
│  (GM/Player)│                      │              │
└─────────────┘                      └──────┬───────┘
                                            │
                                         Kafka
                                   (cmd.ingest topic)
                                            │
                                            ↓
                                   ┌────────────────┐
                                   │   Gameplay     │
                                   │    Service     │
                                   │                │
                                   │ - gmHandlers   │
                                   │ - gameLogic    │
                                   │ - stateManager │
                                   └────────┬───────┘
                                            │
                                         Kafka
                                   (evt.broadcast topic)
                                            │
                                            ↓
                                   ┌────────────────┐
                                   │ API Gateway    │
                                   │  (Broadcast)   │
                                   └────────┬───────┘
                                            │
                                    Socket.io emit
                                            ↓
                                   ┌────────────────┐
                                   │ Client receives│
                                   │     events     │
                                   └────────────────┘
```

### Tech Stack

- **Frontend**: Socket.io client
- **API Gateway**: Socket.io server + Kafka producer
- **Gameplay Service**: Kafka consumer + Game logic
- **State Storage**: In-memory Map (GameStateManager)

---

## 🚀 LUỒNG CHUẨN BỊ GAME

### 1. Host tạo phòng

```javascript
// Client
roomApi.create({
  maxPlayers: 12,
  availableRoles: ['WEREWOLF', 'SEER', 'WITCH', 'BODYGUARD', 'VILLAGER', 'CUPID', 'HUNTER']
})
```

### 2. Host bấm "Start Game"

```javascript
// Client gửi
socket.emit('GAME_START', {
  roomId: 'room-123',
  players: [
    { userId: 'u1', username: 'Alice' },
    { userId: 'u2', username: 'Bob' },
    { userId: 'u3', username: 'Charlie' },
    // ... 9 players
  ],
  availableRoles: ['WEREWOLF', 'SEER', 'WITCH', ...]
})
```

### 3. Gameplay Service xử lý

```javascript
// services/gameplay/src/index.js
handleGameStart()
  ↓
1. Phân vai (assignRoles)
   - Auto assign từ availableRoles
   - Shuffle ngẫu nhiên
   
2. Validate (validateRoleAssignment)
   - Check số lượng
   - Check có Sói và Dân
   - Check unique roles
   
3. Tạo Game State
   gameStateManager.createGame(roomId, players, roleIds)
   → Game State được tạo với:
      - players: [{ userId, username, role, isAlive: true }]
      - phase: 'NIGHT'
      - day: 1
      - nightActions: {}
      - lovers: []
      - witchSkills: { saveUsed: false, poisonUsed: false }
      
4. Gửi events
```

### 4. Events được gửi

**a) Cho GM (targetUserId: hostId):**
```javascript
GAME_ROLE_ASSIGNMENT_LIST {
  assignment: [
    { player: { userId: 'u1', username: 'Alice' }, 
      role: 'WEREWOLF', 
      roleName: 'Ma Sói', 
      faction: 'WEREWOLF' },
    { player: { userId: 'u2', username: 'Bob' }, 
      role: 'SEER', 
      roleName: 'Tiên Tri', 
      faction: 'VILLAGER' },
    // ... all players
  ]
}
```

**b) Cho từng player riêng (targetUserId: playerId):**
```javascript
GAME_ROLE_ASSIGNED {
  userId: 'u1',
  role: 'WEREWOLF',
  roleName: 'Ma Sói',
  faction: 'WEREWOLF'
}
```

### 5. UI hiển thị cho GM

```
╔═══════════════════════════════════════════════╗
║       🎮 QUẢN TRÒ - PHÒNG #1234              ║
╠═══════════════════════════════════════════════╣
║ 📋 DANH SÁCH PHÂN VAI                         ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
║ ✓ Alice      🐺 Ma Sói                        ║
║ ✓ Bob        🔮 Tiên Tri                      ║
║ ✓ Charlie    👨‍🌾 Dân Làng                      ║
║ ✓ Dave       🧙‍♀️ Phù Thủy                      ║
║ ✓ Eve        🛡️ Bảo Vệ                         ║
║ ✓ Frank      💘 Cupid                         ║
║ ✓ Grace      🎯 Thợ Săn                       ║
║ ✓ Hannah     👨‍🌾 Dân Làng                      ║
║ ... (12 players total)                       ║
╠═══════════════════════════════════════════════╣
║              [Bắt Đầu Đêm 1]                  ║
╚═══════════════════════════════════════════════╝
```

---

## 🌙 LUỒNG MỖI ĐÊM (NIGHT PHASE)

### Step 1: GM Bắt Đầu Đêm

**Client:**
```javascript
socket.emit('GM_START_NIGHT', { roomId: 'room-123' })
```

**Server Flow:**
```
API Gateway (socket.js)
  → handleGMCommand('GM_START_NIGHT')
  → buildCommandMessage()
  → Kafka: cmd.ingest
        ↓
Gameplay Service (gmHandlers.js)
  → handleGMStartNight()
  → gameStateManager.resetNightActions()
  → gameStateManager.nextPhase() // if needed
  → Kafka: evt.broadcast → NIGHT_PHASE_STARTED
        ↓
API Gateway (kafka.js)
  → Broadcast to room
        ↓
All Clients receive:
  NIGHT_PHASE_STARTED {
    day: 1,
    message: "Đêm 1 bắt đầu. Tất cả ngủ..."
  }
```

**GM UI Update:**
```
🌙 ĐÊM 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thứ tự gọi role:

[  Chưa  ] 💘 Cupid (Frank)
[  Chưa  ] 🐺 Ma Sói (Alice)
[  Chưa  ] 🔮 Tiên Tri (Bob)
[  Chưa  ] 🛡️ Bảo Vệ (Eve)
[  Chưa  ] 🧙‍♀️ Phù Thủy (Dave)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 2: Cupid Chọn Lovers (Chỉ Đêm 1)

**GM Workflow:**
1. GM gọi offline: "Cupid thức dậy. Chọn 2 người làm cặp đôi."
2. Cupid chỉ (không nói): Charlie và Grace
3. GM nhập vào hệ thống

**Client:**
```javascript
socket.emit('GM_CUPID_SELECT', {
  roomId: 'room-123',
  lovers: ['u3', 'u7'] // Charlie và Grace
})
```

**Server Flow:**
```
handleGMCupidSelect()
  ↓
1. Validate
   - Phải là đêm 1
   - Chưa chọn lovers
   - 2 người hợp lệ và còn sống
   
2. Update State
   gameStateManager.setLovers(roomId, 'u3', 'u7')
   → game.lovers = ['u3', 'u7']
   → player[u3].isLovers = true
   → player[u3].loversWith = 'u7'
   → player[u7].isLovers = true
   → player[u7].loversWith = 'u3'
   
3. Emit Events (riêng cho 2 người)
   LOVERS_SELECTED (targetUserId: u3)
   LOVERS_SELECTED (targetUserId: u7)
```

**Players Nhận (chỉ 2 người):**
```javascript
// Charlie nhận
LOVERS_SELECTED {
  yourLover: { userId: 'u7', username: 'Grace' },
  message: "Bạn đã được Cupid chọn làm người yêu với Grace"
}

// Grace nhận
LOVERS_SELECTED {
  yourLover: { userId: 'u3', username: 'Charlie' },
  message: "Bạn đã được Cupid chọn làm người yêu với Charlie"
}
```

**GM UI:**
```
[✓ Đã gọi] 💘 Cupid → Đã chọn: Charlie ❤️ Grace
```

---

### Step 3: Werewolf Giết

**GM Workflow:**
1. "Ma Sói thức dậy. Các ngươi muốn giết ai?"
2. Alice (Sói) chỉ: Bob
3. GM nhập

**Client:**
```javascript
socket.emit('GM_WEREWOLF_KILL', {
  roomId: 'room-123',
  targetUserId: 'u2' // Bob
})
```

**Server Flow:**
```
handleGMWerewolfKill()
  ↓
1. Validate target (còn sống)
2. Save to state
   game.nightActions.werewolfTarget = 'u2'
3. Return success
```

**GM UI:**
```
[✓ Đã gọi] 🐺 Ma Sói → Chọn giết: Bob
```

---

### Step 4: Seer Xem Vai Trò

**GM Workflow:**
1. "Tiên Tri thức dậy. Ngươi muốn xem ai?"
2. Bob chỉ: Alice
3. GM nhập

**Client:**
```javascript
socket.emit('GM_SEER_CHECK', {
  roomId: 'room-123',
  targetUserId: 'u1' // Alice
})
```

**Server Flow:**
```
handleGMSeerCheck()
  ↓
1. Validate target
2. Check role
   target.role === 'WEREWOLF' → result = 'WEREWOLF'
   else → result = 'VILLAGER'
3. Save checked target
   game.nightActions.seerChecked = 'u1'
4. Emit result (riêng cho GM)
   GM_SEER_RESULT (targetUserId: gmUserId)
```

**GM Nhận:**
```javascript
GM_SEER_RESULT {
  checkedPlayer: 'Alice',
  checkedUserId: 'u1',
  result: 'WEREWOLF',
  message: "Alice là Ma Sói 🐺"
}
```

**GM UI:**
```
🔮 KẾT QUẢ TIÊN TRI:
Alice là: 🐺 MA SÓI

(GM chỉ cho Seer xem: Ngón tay cái xuống = Sói)

[✓ Đã gọi] 🔮 Tiên Tri → Xem Alice: 🐺 Sói
```

---

### Step 5: Bodyguard Bảo Vệ

**GM Workflow:**
1. "Bảo Vệ thức dậy. Ngươi muốn bảo vệ ai?"
2. Eve chỉ: Bob
3. GM nhập

**Client:**
```javascript
socket.emit('GM_BODYGUARD_PROTECT', {
  roomId: 'room-123',
  targetUserId: 'u2' // Bob
})
```

**Server Flow:**
```
handleGMBodyguardProtect()
  ↓
1. Validate
   - Target hợp lệ
   - Không được bảo vệ cùng người 2 đêm liên tiếp
     if (game.lastProtected === targetUserId) → Error
     
2. Save to state
   game.nightActions.protectedPlayer = 'u2'
   game.lastProtected = 'u2'
```

**GM UI:**
```
[✓ Đã gọi] 🛡️ Bảo Vệ → Bảo vệ: Bob
```

---

### Step 6: Witch Hành Động

**GM Workflow:**
1. "Phù Thủy thức dậy. Đêm nay Sói giết Bob."
2. Phù thủy (Dave) quyết định: Cứu Bob, không độc ai
3. GM nhập

**GM UI Hiển Thị:**
```
🧙‍♀️ PHÙ THỦY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐺 Sói giết: Bob

Phù thủy có:
☑️ Thuốc cứu (còn)
☑️ Thuốc độc (còn)

[Cứu Bob] [Không cứu]
[Độc ai?] [Dropdown: chọn người] [Không độc]
```

**Client:**
```javascript
socket.emit('GM_WITCH_ACTION', {
  roomId: 'room-123',
  save: true,              // Cứu
  poisonTargetUserId: null // Không độc
})
```

**Server Flow:**
```
handleGMWitchAction()
  ↓
1. Xử lý cứu (nếu save = true)
   - Validate: witchSkills.saveUsed === false
   - game.nightActions.witchSaved = true
   - game.witchSkills.saveUsed = true
   
2. Xử lý độc (nếu có poisonTargetUserId)
   - Validate: witchSkills.poisonUsed === false
   - Validate target hợp lệ
   - game.nightActions.poisonedTarget = poisonTargetUserId
   - game.witchSkills.poisonUsed = true
```

**GM UI:**
```
[✓ Đã gọi] 🧙‍♀️ Phù Thủy → Cứu Bob, không độc

Skill còn lại:
❌ Thuốc cứu (đã dùng)
✓ Thuốc độc (còn)
```

---

### Step 7: GM Kết Thúc Đêm

**Client:**
```javascript
socket.emit('GM_END_NIGHT', { roomId: 'room-123' })
```

**Server Flow:**
```
handleGMEndNight()
  ↓
1. Tính toán kết quả (processNightResult)
   
   a. Xử lý Werewolf target
      werewolfTarget = 'u2' (Bob)
      
      Check:
      - witchSaved = true → Bob SỐNG
      - protectedPlayer = 'u2' → Bob SỐNG
      
      Kết quả: Bob SỐNG (được cứu)
      
   b. Xử lý Poison target
      poisonedTarget = null → Không ai bị độc
      
   c. Xử lý Lovers chain death
      Không ai chết → Không chain
      
   Result: {
     deaths: [],
     saved: ['u2'],
     protected: ['u2']
   }
   
2. Gửi kết quả riêng cho GM
   GM_NIGHT_RESULT (targetUserId: gmUserId)
```

**GM Nhận:**
```javascript
GM_NIGHT_RESULT {
  deaths: [],
  saved: [
    { userId: 'u2', username: 'Bob' }
  ],
  protected: [
    { userId: 'u2', username: 'Bob' }
  ],
  message: "Không ai chết đêm qua"
}
```

**GM UI:**
```
🌙 KẾT QUẢ ĐÊM 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💀 Người chết: Không ai

💊 Được cứu:
   - Bob (Sói giết, Phù thủy cứu)

🛡️ Được bảo vệ:
   - Bob (Bảo vệ bảo vệ, không bị tấn công)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Công Bố Kết Quả Cho Tất Cả]
```

---

### Step 8: GM Công Bố Người Chết

**Client:**
```javascript
socket.emit('GM_ANNOUNCE_DEATHS', {
  roomId: 'room-123',
  deaths: [] // Không ai chết
})
```

**Server Flow:**
```
handleGMAnnounceDeaths()
  ↓
1. Broadcast cho tất cả
   PLAYERS_DIED {
     deaths: [],
     count: 0,
     message: "Đêm qua yên bình, không ai chết."
   }
   
2. Check win condition
   checkWinCondition(roomId)
   → null (game tiếp tục)
```

**All Players Nhận:**
```javascript
PLAYERS_DIED {
  deaths: [],
  count: 0,
  message: "Đêm qua yên bình, không ai chết."
}
```

---

## ☀️ LUỒNG BAN NGÀY (DAY PHASE)

### Step 1: GM Bắt Đầu Ngày

**Client:**
```javascript
socket.emit('GM_START_DAY', {
  roomId: 'room-123',
  duration: 120 // 2 phút thảo luận
})
```

**Server Flow:**
```
handleGMStartDay()
  ↓
1. Update phase
   gameStateManager.nextPhase()
   → game.phase = 'DAY'
   
2. Broadcast
   DAY_PHASE_STARTED {
     day: 1,
     duration: 120,
     message: "Ngày 1 bắt đầu. Thời gian thảo luận: 120s"
   }
```

**Client UI:**
```
☀️ NGÀY 1 - THẢO LUẬN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thời gian còn lại: 2:00

[Public Chat mở - tất cả có thể nói chuyện]

Alice: Bob có vẻ khả nghi...
Bob: Tôi là Tiên tri, tôi biết Alice là Sói!
Charlie: Tôi tin Bob
...
```

---

### Step 2: Vote Treo Cổ

> **Lưu ý:** Phần này CHƯA CODE theo yêu cầu

**Sẽ implement:**
```javascript
// Client (từng player vote)
socket.emit('PLAYER_VOTE', {
  roomId: 'room-123',
  targetUserId: 'u1' // Vote Alice
})

// GM kết thúc vote
socket.emit('GM_END_VOTE', { roomId: 'room-123' })

// Hệ thống tính kết quả
// Mayor có 2 phiếu thay vì 1
// Broadcast VOTE_RESULT
```

---

### Step 3: Hunter Bắn (Nếu Bị Treo)

**Giả sử Grace (Hunter) bị treo cổ:**

**Client:**
```javascript
socket.emit('GM_HUNTER_SHOOT', {
  roomId: 'room-123',
  hunterId: 'u7',     // Grace
  targetUserId: 'u1'  // Grace bắn Alice
})
```

**Server Flow:**
```
handleGMHunterShoot()
  ↓
1. Process hunter shoot
   processHunterShoot(roomId, 'u7', 'u1')
   
   a. Kill target
      gameStateManager.killPlayer('u1', 'HUNTER_SHOT')
      
   b. Check lovers chain
      u1 (Alice) không phải lover → Không chain
      
   c. Check if target is also Hunter
      u1.role !== 'HUNTER' → Không chain
      
   Result: {
     deaths: [
       { userId: 'u1', username: 'Alice', cause: 'HUNTER_SHOT' }
     ],
     chainHunter: null
   }
   
2. Broadcast
   HUNTER_SHOT {
     hunterId: 'u7',
     deaths: [...]
   }
   
3. Check win condition
   checkWinCondition(roomId)
   → Tất cả Sói chết → VILLAGER thắng!
```

**All Players Nhận:**
```javascript
HUNTER_SHOT {
  hunterId: 'u7',
  deaths: [
    { userId: 'u1', username: 'Alice', cause: 'HUNTER_SHOT' }
  ],
  chainHunter: null
}

GAME_OVER {
  winner: 'VILLAGER',
  message: 'Phe Dân Làng thắng! Tất cả Sói đã chết.',
  alivePlayers: [
    { userId: 'u2', username: 'Bob', role: 'SEER' },
    { userId: 'u3', username: 'Charlie', role: 'VILLAGER' },
    ...
  ]
}
```

---

## 💾 GAME STATE MANAGEMENT

### Game State Structure

```javascript
{
  roomId: 'room-123',
  phase: 'NIGHT', // 'NIGHT' | 'DAY' | 'ENDED'
  day: 1,
  
  // Players info
  players: [
    {
      userId: 'u1',
      username: 'Alice',
      role: 'WEREWOLF',
      isAlive: true,
      isLovers: false,
      loversWith: null
    },
    {
      userId: 'u3',
      username: 'Charlie',
      role: 'VILLAGER',
      isAlive: true,
      isLovers: true,
      loversWith: 'u7'
    },
    // ...
  ],
  
  // Night actions (reset mỗi đêm)
  nightActions: {
    werewolfTarget: 'u2',      // Sói giết ai
    seerChecked: 'u1',         // Tiên tri xem ai
    protectedPlayer: 'u2',     // Bảo vệ ai
    witchSaved: true,          // Phù thủy có cứu không
    poisonedTarget: null       // Phù thủy độc ai
  },
  
  // Persistent data
  lovers: ['u3', 'u7'],        // Lovers IDs
  lastProtected: 'u2',         // Người được bảo vệ đêm trước
  
  // Witch skills (dùng 1 lần)
  witchSkills: {
    saveUsed: true,
    poisonUsed: false
  },
  
  // Deaths history
  deaths: [
    {
      userId: 'u8',
      username: 'Hannah',
      role: 'VILLAGER',
      day: 1,
      phase: 'NIGHT',
      cause: 'POISONED',
      timestamp: 1234567890
    }
  ],
  
  // Vote data (ban ngày)
  votes: {
    'u1': 'u7',  // Alice vote Grace
    'u2': 'u7',  // Bob vote Grace
    // ...
  },
  
  createdAt: 1234567890,
  lastUpdate: 1234567890
}
```

### State Operations

**gameStateManager API:**
```javascript
// Create
createGame(roomId, players, roleIds)

// Read
getGame(roomId)
getPlayer(roomId, userId)
getAlivePlayers(roomId)
getDeadPlayers(roomId)

// Update
updateGame(roomId, updates)
killPlayer(roomId, userId, cause)
setLovers(roomId, userId1, userId2)
nextPhase(roomId)
resetNightActions(roomId)
resetVotes(roomId)

// Delete
deleteGame(roomId)

// Helpers
areLovers(roomId, userId1, userId2)
getLover(roomId, userId)
```

---

## 📡 EVENTS & COMMANDS

### Commands (Client → Server)

| Command | Payload | Mô tả |
|---------|---------|-------|
| `GAME_START` | `{ roomId, players, availableRoles }` | Bắt đầu game |
| `GM_START_NIGHT` | `{ roomId }` | Bắt đầu đêm |
| `GM_CUPID_SELECT` | `{ roomId, lovers: [userId1, userId2] }` | Cupid chọn lovers |
| `GM_WEREWOLF_KILL` | `{ roomId, targetUserId }` | Sói giết |
| `GM_SEER_CHECK` | `{ roomId, targetUserId }` | Tiên tri xem |
| `GM_BODYGUARD_PROTECT` | `{ roomId, targetUserId }` | Bảo vệ |
| `GM_WITCH_ACTION` | `{ roomId, save, poisonTargetUserId }` | Phù thủy cứu/độc |
| `GM_END_NIGHT` | `{ roomId }` | Kết thúc đêm |
| `GM_ANNOUNCE_DEATHS` | `{ roomId, deaths }` | Công bố người chết |
| `GM_START_DAY` | `{ roomId, duration }` | Bắt đầu ngày |
| `GM_HUNTER_SHOOT` | `{ roomId, hunterId, targetUserId }` | Hunter bắn |

### Events (Server → Client)

| Event | Target | Payload | Mô tả |
|-------|--------|---------|-------|
| `GAME_ROLE_ASSIGNMENT_LIST` | GM only | `{ assignment: [...] }` | Danh sách phân vai |
| `GAME_ROLE_ASSIGNED` | Each player | `{ role, roleName, faction }` | Vai trò của player |
| `NIGHT_PHASE_STARTED` | All | `{ day, message }` | Đêm bắt đầu |
| `LOVERS_SELECTED` | 2 lovers | `{ yourLover, message }` | Thông báo lovers |
| `GM_SEER_RESULT` | GM only | `{ checkedPlayer, result }` | Kết quả Tiên tri |
| `GM_NIGHT_RESULT` | GM only | `{ deaths, saved, protected }` | Kết quả đêm |
| `PLAYERS_DIED` | All | `{ deaths, count, message }` | Công bố người chết |
| `DAY_PHASE_STARTED` | All | `{ day, duration }` | Ngày bắt đầu |
| `HUNTER_SHOT` | All | `{ hunterId, deaths, chainHunter }` | Hunter bắn |
| `GAME_OVER` | All | `{ winner, message, alivePlayers }` | Game kết thúc |

---

## 📝 VÍ DỤ THỰC TẾ

### Ví dụ: Đêm 2 có người chết và Lovers chain

**Setup:**
- Charlie (VILLAGER) ❤️ Grace (HUNTER) là lovers
- Sói giết Charlie
- Phù thủy không cứu
- Bảo vệ bảo vệ Bob (không bị tấn công)

**Night Actions:**
```javascript
nightActions: {
  werewolfTarget: 'u3',      // Charlie
  protectedPlayer: 'u2',     // Bob
  witchSaved: false,
  poisonedTarget: null
}
```

**Processing:**
```javascript
processNightResult(roomId)

1. Werewolf target = Charlie
   - Not saved → Charlie chết
   
2. Poison target = null
   
3. Lovers chain check
   - Charlie chết → Check lover
   - Charlie.loversWith = 'u7' (Grace)
   - Grace còn sống → Grace chết theo
   
Result: {
  deaths: [
    { userId: 'u3', username: 'Charlie', cause: 'WEREWOLF_KILL' },
    { userId: 'u7', username: 'Grace', cause: 'LOVERS_SUICIDE' }
  ],
  saved: [],
  protected: ['u2']
}
```

**GM Nhận:**
```javascript
GM_NIGHT_RESULT {
  deaths: [
    { userId: 'u3', username: 'Charlie', cause: 'WEREWOLF_KILL' },
    { userId: 'u7', username: 'Grace', cause: 'LOVERS_SUICIDE' }
  ],
  saved: [],
  protected: [
    { userId: 'u2', username: 'Bob' }
  ],
  message: "2 người đã chết"
}
```

**GM công bố → All players nhận:**
```javascript
PLAYERS_DIED {
  deaths: [
    { userId: 'u3', username: 'Charlie' },
    { userId: 'u7', username: 'Grace' }
  ],
  count: 2,
  message: "Đêm qua, Charlie, Grace đã chết."
}
```

---

### Ví dụ: Hunter Chain Reaction

**Setup:**
- Alice (WEREWOLF) bị vote treo
- Alice không phải Hunter
- Bob (HUNTER) bắn Alice... NHẦM! Bob bắn Dave
- Dave (HUNTER) → Chain!

**Flow:**
```javascript
// GM: Alice bị vote treo (không phải Hunter → không bắn)

// Giả sử sau đó Grace (HUNTER) bị vote
socket.emit('GM_HUNTER_SHOOT', {
  hunterId: 'u7',      // Grace
  targetUserId: 'u4'   // Dave (cũng là Hunter)
})

processHunterShoot('u7', 'u4')
  ↓
1. Kill Dave
   deaths = [{ userId: 'u4', username: 'Dave', cause: 'HUNTER_SHOT' }]
   
2. Check: Dave is Hunter → CHAIN!
   return {
     deaths: [{ userId: 'u4', username: 'Dave', cause: 'HUNTER_SHOT' }],
     chainHunter: { userId: 'u4', username: 'Dave' }
   }

Broadcast HUNTER_SHOT with chainHunter info

GM sees: "Dave cũng là Thợ Săn! Được bắn tiếp..."

GM calls Dave offline: "Bạn bị bắn, bắn lại ai?"
Dave chỉ: Alice

GM emit GM_HUNTER_SHOOT again with hunterId = 'u4', targetUserId = 'u1'
...
```

---

## 🔧 TECHNICAL NOTES

### Error Handling

Tất cả GM handlers có try-catch:
```javascript
try {
  await gmHandlers.handleGMWitchAction(roomId, payload, producer)
} catch (err) {
  console.error('Error in GM_WITCH_ACTION:', err)
  // Không crash service, chỉ log error
}
```

### Validation

Mọi action đều validate:
- Game tồn tại
- Target hợp lệ (còn sống)
- Skill chưa dùng (Witch)
- Phase đúng (Cupid chỉ đêm 1)

### State Persistence

**Hiện tại:** In-memory (Map)
**Tương lai:** Có thể thêm:
- Redis cache
- PostgreSQL persistence
- Auto-save mỗi action

### Scalability

- 1 GameStateManager instance per service
- Nếu scale nhiều instances → cần shared state (Redis)
- Hoặc dùng room sharding (mỗi instance handle các room khác nhau)

---

## 🚀 DEPLOYMENT & TESTING

### Start Services

```bash
# Terminal 1: Start Kafka
docker compose up kafka -d

# Terminal 2: Start Gameplay Service
cd services/gameplay
npm run dev

# Terminal 3: Start API Gateway
cd api-gateway
npm run dev
```

### Test Flow

```javascript
// 1. Client connect
const socket = io('http://localhost:3000', {
  auth: { token: 'your-token' }
})

// 2. Start game
socket.emit('GAME_START', {
  roomId: 'test-room',
  players: [
    { userId: 'u1', username: 'Alice' },
    { userId: 'u2', username: 'Bob' },
    // ... 3-12 players
  ],
  availableRoles: ['WEREWOLF', 'SEER', 'WITCH', 'BODYGUARD', 'VILLAGER']
})

// 3. Listen for role assignment
socket.on('GAME_ROLE_ASSIGNMENT_LIST', (data) => {
  console.log('GM received roles:', data)
})

// 4. Start night
socket.emit('GM_START_NIGHT', { roomId: 'test-room' })

// 5. Continue with GM commands...
```

---

## 📚 FILES REFERENCE

### Gameplay Service
- `src/index.js` - Main entry, command handler
- `src/handlers/gmHandlers.js` - GM action handlers
- `src/utils/gameStateManager.js` - State management
- `src/utils/gameLogic.js` - Game logic (night result, win check)
- `src/utils/roleAssignment.js` - Role assignment logic

### API Gateway
- `src/socket.js` - Socket.io handlers
- `src/kafka.js` - Kafka consumer/producer
- `src/contracts.js` - Message schemas

---

## ✅ TODO & IMPROVEMENTS

**Đã hoàn thành:**
- ✅ Game state management
- ✅ GM night phase handlers
- ✅ Night result processing
- ✅ Lovers chain death
- ✅ Hunter shoot
- ✅ Win condition check
- ✅ Witch skills tracking
- ✅ Bodyguard protection validation

**Chưa implement:**
- ❌ Vote logic (ban ngày)
- ❌ Mayor 2 phiếu trong vote
- ❌ Persistence (lưu DB)
- ❌ Reconnect handling
- ❌ Game history/replay
- ❌ Advanced roles (Detective, Mayor reveal, etc)

---

## 🤝 CONTRIBUTION

Để thêm role mới:
1. Thêm vào `constants/roles.js`
2. Update `roleAssignment.js` logic
3. Tạo handler mới trong `gmHandlers.js`
4. Thêm command case trong `index.js`
5. Thêm socket listener trong `socket.js`
6. Update `gameLogic.js` nếu cần

---

**Last Updated:** January 7, 2026
**Version:** 1.0.0
**Author:** Werewolf Game System
