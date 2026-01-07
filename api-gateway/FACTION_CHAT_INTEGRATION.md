# API Gateway - Faction Chat Integration

## Tổng quan
API Gateway đã được cấu hình để hỗ trợ **Faction Chat** (chat riêng theo phe). Đặc biệt cho phe Sói chat riêng vào ban đêm.

## Các thay đổi

### 1. Socket Handler mới
File: [src/socket.js](src/socket.js)

**Handler: `CHAT_SEND_FACTION`**
- Nhận tin nhắn từ client
- Validate: roomId, faction, phase, text
- Kiểm tra Werewolf chỉ chat được ban đêm
- Publish command lên Kafka `cmd.ingest`

**Handler: `UPDATE_FACTION`**
- Cập nhật faction của user khi game bắt đầu
- Lưu vào `roomFactions` Map để filter broadcast

### 2. Broadcast Logic
File: [src/kafka.js](src/kafka.js)

**Faction Chat Filtering:**
- Khi nhận event `CHAT_MESSAGE_FACTION`
- Chỉ emit đến sockets có **cùng faction** trong room
- Sử dụng `roomFactions` Map để check

### 3. State Management
- `userSockets`: Map<userId, Set<socketId>>
- `roomFactions`: Map<roomId, Map<userId, faction>>

---

## Client Integration

### 1. Gửi Faction Chat

```javascript
// Frontend - src/api/domains/chat.js
export const sendFactionChat = (roomId, faction, phase, text) => {
  socket.emit('CHAT_SEND_FACTION', {
    roomId,
    faction,
    phase,
    text
  });
};
```

### 2. Update Faction khi game bắt đầu

```javascript
// Khi Gameplay Service assign role cho user
// Frontend nhận event GAME_ROLE_ASSIGNED
socket.on('GAME_ROLE_ASSIGNED', (data) => {
  const { roomId, role } = data.payload;
  
  // Map role -> faction
  let faction = 'VILLAGER';
  if (role === 'WEREWOLF' || role === 'ALPHA_WOLF') {
    faction = 'WEREWOLF';
  }
  
  // Update faction trên gateway
  socket.emit('UPDATE_FACTION', { roomId, faction });
});
```

### 3. Nhận Faction Chat

```javascript
// Frontend component
socket.on('CHAT_MESSAGE_FACTION', (data) => {
  const { payload, roomId } = data;
  const { userId, faction, text, createdAt } = payload;
  
  console.log(`[${faction}] ${userId}: ${text}`);
  
  // Display in faction chat UI
  addMessageToFactionChat({
    userId,
    faction,
    text,
    timestamp: createdAt
  });
});
```

---

## Luồng hoạt động đầy đủ

### Khi game bắt đầu:
```
1. Gameplay Service → Assign roles cho players
2. Gameplay Service → Publish evt.broadcast: GAME_ROLE_ASSIGNED
3. Gateway → Broadcast đến clients trong room
4. Frontend → Nhận GAME_ROLE_ASSIGNED
5. Frontend → Emit UPDATE_FACTION(roomId, faction)
6. Gateway → Lưu vào roomFactions Map
```

### Khi user chat faction:
```
1. Frontend → socket.emit('CHAT_SEND_FACTION', {...})
2. Gateway → Validate phase/faction
3. Gateway → Publish cmd.ingest: CHAT_SEND_FACTION
4. Chat Service → Process command
5. Chat Service → Publish evt.broadcast: CHAT_MESSAGE_FACTION
6. Gateway → Consumer nhận event
7. Gateway → Filter users by faction
8. Gateway → Emit chỉ đến users cùng faction
9. Frontend → Hiển thị message
```

---

## Testing

### Test 1: Gửi Faction Chat (Console)

Mở browser console:

```javascript
// Giả sử đã kết nối socket và đã UPDATE_FACTION
socket.emit('CHAT_SEND_FACTION', {
  roomId: 'room123',
  faction: 'WEREWOLF',
  phase: 'NIGHT',
  text: 'Chúng ta tấn công ai?'
});
```

### Test 2: Update Faction

```javascript
socket.emit('UPDATE_FACTION', {
  roomId: 'room123',
  faction: 'WEREWOLF'
});
```

### Test 3: Listen Events

```javascript
socket.on('CHAT_MESSAGE_FACTION', (data) => {
  console.log('Faction chat received:', data);
});

socket.on('ERROR', (error) => {
  console.error('Error:', error);
});
```

---

## Error Handling

### Client Errors:

| Error Message | Nguyên nhân | Giải pháp |
|--------------|-------------|-----------|
| `roomId is required` | Thiếu roomId | Truyền roomId vào payload |
| `faction is required` | Thiếu faction | Truyền faction vào payload |
| `text must be 1-500 characters` | Text không hợp lệ | Kiểm tra độ dài text |
| `Werewolf faction chat only allowed during NIGHT phase` | Sói chat ban ngày | Chỉ cho phép chat khi phase=NIGHT |

### Server Logs:

```javascript
// Socket.js logs
console.log('Failed to publish CHAT_SEND_FACTION', err);

// Kafka.js logs
console.log('Faction chat broadcast', { roomId, faction, recipientCount });
console.warn('No faction map found for room', { roomId, faction });
```

---

## Security Considerations

⚠️ **QUAN TRỌNG:**

1. **Backend validation**: Chat Service đã validate phase/faction
2. **Gateway validation**: Gateway double-check phase/faction
3. **Faction verification**: Gameplay Service cần verify user thực sự thuộc faction trước khi allow chat
4. **Anti-cheat**: Log tất cả faction chat để audit

### Recommended Flow:
```
1. Gameplay Service lưu player roles vào Redis/DB
2. Gateway query Gameplay Service để verify faction
3. Hoặc: Gameplay Service push faction info qua Kafka event
```

---

## Future Enhancements

- [ ] Verify faction với Gameplay Service trước khi accept message
- [ ] Rate limiting cho faction chat (anti-spam)
- [ ] Encryption cho faction chat messages
- [ ] History/replay faction chat sau khi game kết thúc
- [ ] Moderation tools (mute toxic players)
- [ ] Rich text support (bold, mentions)
