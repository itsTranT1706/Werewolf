# Werewolf

Game Ma Sói (Werewolf/Mafia) multiplayer thời gian thực sử dụng kiến trúc microservices hướng sự kiện với Apache Kafka làm event bus.

## Kiến trúc

**Luồng sự kiện:**
- Frontend → API Gateway (WebSocket) → Kafka topic `cmd.ingest`
- Microservices consume từ `cmd.ingest`, xử lý hành động, produce sang `evt.game.state` và `evt.broadcast`
- API Gateway consume từ `evt.broadcast` và emit cho clients qua WebSocket

**Kafka Topics:**
- `cmd.ingest`: Hành động người dùng (vote, chat, join, dùng skill)
- `evt.game.state`: Thay đổi trạng thái game (chuyển pha, người chết, kết thúc game)
- `evt.broadcast`: Tin nhắn đã xử lý để broadcast cho clients

**Services:**
- `api-gateway`: Quản lý kết nối Socket.io, chuyển đổi hành động client thành Kafka message
- `gameplay-service`: State machine chính (pha ngày/đêm, kỹ năng nhân vật, tính toán người chết)
- `vote-service`: Đếm phiếu thời gian thực và tổng hợp kết quả
- `chat-service`: Kiểm tra tin nhắn và lọc quyền chat (sói chat đêm, dân chat ngày)
- `room-service`: Tạo phòng, quản lý lobby người chơi
- `profile-service`: Stats người dùng, ranking, avatar (REST API, không dùng Kafka)

**Databases:**
- Redis: Cache trạng thái game (đọc/ghi nhanh cho các ván đang chơi)
- PostgreSQL: Thông tin user, dữ liệu phòng, lịch sử trận đấu

## Cấu trúc thư mục

```
.
├── docker-compose.yml
├── api-gateway/         # Node.js (Express + Socket.io)
├── frontend/
├── services/
│   ├── room/            # Go hoặc Node.js
│   ├── gameplay/        # Logic lõi
│   ├── vote/            # Xử lý đếm phiếu
│   ├── chat/            # Chat logic
│   └── profile/         # REST API service
```
