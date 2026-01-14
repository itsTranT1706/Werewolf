# Tính năng Chỉnh sửa Tên Người Chơi trong Phòng

## Tổng quan
Tính năng này cho phép người chơi cập nhật/chỉnh sửa tên hiển thị của họ trong phòng chơi mà không cần rời phòng và tham gia lại.

## Các thay đổi

### Backend (Room Service)

#### 1. Repository Layer
**File**: `services/room/src/repositories/roomRepository.js`
- **Thêm method**: `updatePlayerDisplayname(roomId, playerId, displayname)`
  - Cập nhật tên người chơi trong database
  - Gửi Kafka event `PLAYER_NAME_UPDATED`
  - Trả về player và room đã cập nhật

#### 2. Service Layer
**File**: `services/room/src/services/roomService.js`
- **Thêm method**: `updatePlayerDisplayname(roomId, playerId, displayname)`
  - Validate displayname (không được trống, max 50 ký tự)
  - Kiểm tra room và player tồn tại
  - Gọi repository để cập nhật

#### 3. Controller Layer
**File**: `services/room/src/controllers/roomController.js`
- **Thêm method**: `updatePlayerDisplayname(req, res)`
  - Handler cho HTTP endpoint
  - Xử lý errors và trả về response phù hợp

#### 4. Routes
**File**: `services/room/src/routes/roomRoutes.js`
- **Thêm route**: `PATCH /rooms/:id/players/:playerId`
  - Endpoint để cập nhật tên người chơi

#### 5. Socket Handler
**File**: `services/room/src/handlers/roomSocketHandler.js`
- **Thêm method**: `handleUpdatePlayerName(socket, data)`
  - Xử lý socket event `UPDATE_PLAYER_NAME`
  - Validate quyền sở hữu (người chơi chỉ có thể sửa tên của chính mình)
  - Emit event `PLAYER_NAME_UPDATED` cho tất cả người chơi trong phòng

**File**: `services/room/src/index.js`
- **Thêm listener**: `socket.on('UPDATE_PLAYER_NAME', ...)`

### Frontend

#### 1. Component Modal
**File**: `frontend/src/components/game/EditNameModal.jsx`
- Component modal mới để chỉnh sửa tên
- Tính năng:
  - Input field với validation real-time
  - Hiển thị số ký tự đã nhập (max 50)
  - Xử lý Enter để save, Escape để đóng
  - Error messages khi validation fail
  - UI phù hợp với theme medieval fantasy của game

#### 2. RoomPage Updates
**File**: `frontend/src/pages/RoomPage.jsx`

**Thêm State**:
```javascript
const [showEditNameModal, setShowEditNameModal] = useState(false)
```

**Thêm Handler**:
```javascript
const handleSaveNewName = (newName) => {
  // Emit socket event UPDATE_PLAYER_NAME
  roomSocket.emit('UPDATE_PLAYER_NAME', {
    roomId: currentRoomId,
    playerId: currentPlayerId,
    displayname: newName
  })
}

const handlePlayerNameUpdated = (data) => {
  // Cập nhật UI khi nhận event
  // Cập nhật currentDisplayname nếu là người chơi hiện tại
}
```

**Thêm Socket Listener**:
- Listen event `PLAYER_NAME_UPDATED`
- Cập nhật state `currentDisplayname`
- Hiển thị notification thành công

**UI Changes**:
- Thêm icon Edit (từ lucide-react) bên cạnh tên người chơi
- Icon chỉ hiển thị cho người chơi hiện tại
- Icon ẩn khi game đã bắt đầu hoặc người chơi đã chết
- Click icon sẽ mở EditNameModal

**Thêm Import**:
```javascript
import EditNameModal from '@/components/game/EditNameModal'
import { Edit2 } from 'lucide-react'
```

## Cách sử dụng

### Từ phía người chơi:
1. Vào phòng chơi
2. Tìm tên của mình trong danh sách người chơi
3. Click vào icon edit (bút chì) bên cạnh tên
4. Nhập tên mới vào modal
5. Click "Lưu" hoặc nhấn Enter
6. Tên sẽ được cập nhật ngay lập tức cho tất cả người chơi trong phòng

### Validation Rules:
- Tên không được để trống
- Tên không được dài quá 50 ký tự
- Tên mới phải khác tên hiện tại

### Giới hạn:
- Chỉ có thể chỉnh sửa tên trước khi game bắt đầu
- Chỉ có thể chỉnh sửa tên của chính mình
- Không thể chỉnh sửa khi người chơi đã chết (trong game)

## API

### HTTP Endpoint
```
PATCH /api/v1/rooms/:id/players/:playerId
Body: { displayname: "Tên mới" }
```

### Socket Events

#### Client → Server
```javascript
socket.emit('UPDATE_PLAYER_NAME', {
  roomId: 'room-id',
  playerId: 'player-id',
  displayname: 'Tên mới'
})
```

#### Server → Client
```javascript
socket.on('PLAYER_NAME_UPDATED', (data) => {
  // data.room: Room object với danh sách players đã cập nhật
  // data.player: Player object đã cập nhật
})
```

#### Kafka Event
```
Topic: evt.broadcast
Event Type: PLAYER_NAME_UPDATED
Payload: {
  roomId: 'room-id',
  player: { id, displayname, ... },
  room: { ... }
}
```

## Testing

### Manual Testing Steps:
1. Tạo một phòng mới
2. Join phòng với 2+ browser/tabs khác nhau
3. Trong một browser, click icon edit bên cạnh tên
4. Đổi tên và save
5. Verify rằng tên được cập nhật trong tất cả browsers
6. Thử các edge cases:
   - Tên trống (should fail)
   - Tên quá dài >50 chars (should fail)
   - Tên giống như tên hiện tại (should fail)
   - Bắt đầu game và kiểm tra icon edit đã ẩn

## Future Enhancements
- Cho phép chỉnh sửa tên trong game (nếu cần)
- Thêm history/log của các lần đổi tên
- Thêm rate limiting để tránh spam đổi tên
- Avatar customization cùng với tên
