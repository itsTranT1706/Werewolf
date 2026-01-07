# Faction Chat - Hướng dẫn sử dụng

## Tổng quan
Chức năng **Faction Chat** cho phép các thành viên cùng phe chat riêng với nhau. Đặc biệt được sử dụng cho **phe Sói (Werewolf)** chat riêng vào **ban đêm**.

## Cách hoạt động

### 1. Command Format (cmd.ingest)
Client gửi command qua Kafka topic `cmd.ingest`:

```json
{
  "traceId": "unique-trace-id",
  "userId": "user123",
  "roomId": "room456",
  "action": {
    "type": "CHAT_SEND_FACTION",
    "payload": {
      "faction": "WEREWOLF",
      "phase": "NIGHT",
      "text": "Chúng ta sẽ tấn công ai đêm nay?"
    }
  },
  "ts": 1704067200000
}
```

### 2. Event Format (evt.broadcast)
Chat service sẽ publish event qua Kafka topic `evt.broadcast`:

```json
{
  "traceId": "unique-trace-id",
  "roomId": "room456",
  "event": {
    "type": "CHAT_MESSAGE_FACTION",
    "payload": {
      "messageId": "msg-abc123",
      "userId": "user123",
      "faction": "WEREWOLF",
      "text": "Chúng ta sẽ tấn công ai đêm nay?",
      "createdAt": 1704067200000
    }
  },
  "ts": 1704067200000
}
```

## Quy tắc Validation

### 1. Required Fields
- `roomId`: Phòng game
- `faction`: Phe của người chơi (VD: "WEREWOLF", "VILLAGER")
- `text`: Nội dung tin nhắn (1-500 ký tự)

### 2. Phase Validation
- **Phe Sói (WEREWOLF)**: Chỉ được chat khi `phase = "NIGHT"`
- Các phe khác có thể có quy tắc riêng

### 3. Error Cases
- Thiếu `roomId` → Bỏ qua command
- Thiếu `faction` → Bỏ qua command
- `text` rỗng hoặc > 500 ký tự → Bỏ qua command
- Sói chat không phải ban đêm → Bỏ qua command

## Integration với Frontend

### API Client Example
```javascript
// src/api/domains/chat.js
export const sendFactionChat = (roomId, faction, phase, text) => ({
  action: {
    type: 'CHAT_SEND_FACTION',
    payload: { faction, phase, text }
  },
  roomId
});
```

### Component Example
```javascript
// Trong GamePage khi user gửi tin nhắn phe
const handleFactionChatSubmit = (text) => {
  if (userRole === 'WEREWOLF' && gamePhase === 'NIGHT') {
    api.chat.sendFactionChat(roomId, 'WEREWOLF', gamePhase, text);
  }
};
```

## Gateway Integration

Gateway cần nhận WebSocket message và chuyển thành Kafka command:

```javascript
// api-gateway/src/socket.js
socket.on('chat:faction', (data) => {
  const command = {
    traceId: generateTraceId(),
    userId: socket.userId,
    roomId: data.roomId,
    action: {
      type: 'CHAT_SEND_FACTION',
      payload: {
        faction: data.faction,
        phase: data.phase,
        text: data.text
      }
    },
    ts: Date.now()
  };
  
  // Publish to cmd.ingest
  kafkaProducer.send({
    topic: 'cmd.ingest',
    messages: [{ value: JSON.stringify(command) }]
  });
});
```

## Broadcast Logic

Gateway nhận event từ `evt.broadcast` và gửi đến **chỉ những client thuộc cùng phe**:

```javascript
// api-gateway/src/socket.js
kafkaConsumer.on('message', (message) => {
  const event = JSON.parse(message.value);
  
  if (event.event.type === 'CHAT_MESSAGE_FACTION') {
    const { faction, userId, text, createdAt } = event.event.payload;
    const roomId = event.roomId;
    
    // Chỉ gửi đến các socket thuộc cùng faction trong room
    io.to(roomId).sockets.forEach((socket) => {
      if (socket.userData.faction === faction) {
        socket.emit('chat:faction:message', {
          userId,
          faction,
          text,
          createdAt
        });
      }
    });
  }
});
```

## Testing

### Manual Test với Kafka CLI

1. **Gửi command test:**
```bash
kafka-console-producer --broker-list localhost:9092 --topic cmd.ingest
```

Paste JSON:
```json
{"traceId":"test-1","userId":"wolf1","roomId":"room1","action":{"type":"CHAT_SEND_FACTION","payload":{"faction":"WEREWOLF","phase":"NIGHT","text":"Test faction chat"}},"ts":1704067200000}
```

2. **Nhận event:**
```bash
kafka-console-consumer --bootstrap-server localhost:9092 --topic evt.broadcast --from-beginning
```

## Mở rộng trong tương lai

- [ ] Thêm encryption cho tin nhắn phe
- [ ] Lưu lịch sử chat phe vào database
- [ ] Thêm rate limiting
- [ ] Hỗ trợ mentions (@username)
- [ ] Thêm rich text format (bold, italic)
