# Fix: Hunter Revenge - Không thể chọn người để bắn

## Vấn đề
Khi Thợ Săn (Monster Hunter) chết trong game, modal "Phát Súng Cuối Cùng" hiển thị nhưng không thể chọn người chơi để bắn.

## Nguyên nhân
1. **Logic chọn người chơi bị giới hạn**: Hàm `handlePlayerSelect` chỉ cho phép chọn người chơi khi `isGMMode = true` (host + game not in lobby), không xem xét trường hợp Hunter revenge.
2. **Thiếu visual feedback**: Người chơi không biết họ cần click vào player card để chọn mục tiêu.
3. **Thiếu validation**: Không ngăn chặn việc chọn người chơi đã chết, host, hoặc chính Hunter.

## Giải pháp

### 1. Cập nhật logic chọn người chơi
**File**: `frontend/src/pages/RoomPage.jsx`

#### Trước:
```javascript
const handlePlayerSelect = (player) => {
    if (!isGMMode) return
    const playerId = getPlayerKey(player)
    setSelectedPlayerId(prev => prev === playerId ? null : playerId)
}
```

#### Sau:
```javascript
const handlePlayerSelect = (player) => {
    // Allow selection if:
    // 1. In GM mode (normal gameplay)
    // 2. Hunter can shoot (special case)
    if (!isGMMode && !hunterCanShoot) return
    
    const playerId = getPlayerKey(player)
    const isDead = isPlayerDead(player)
    const isHost = isElder(player)
    
    // Prevent selecting dead players or host/moderator
    if (isDead || isHost) return
    
    // When Hunter is shooting, prevent selecting themselves
    if (hunterCanShoot && playerId === hunterCanShoot.hunterId) {
        console.log('🏹 Hunter cannot shoot themselves')
        return
    }
    
    setSelectedPlayerId(prev => prev === playerId ? null : playerId)
}
```

### 2. Cập nhật visual indicators

#### a) Player Card Selection State
```javascript
// Trước
const isSelected = isGMMode && selectedPlayerId === playerId

// Sau
const isSelected = (isGMMode || hunterCanShoot) && selectedPlayerId === playerId
const canSelect = (isGMMode || hunterCanShoot) && !isDead && !elder
```

#### b) Cursor Style
```javascript
// Trước
className={`... ${isGMMode && !isDead ? 'cursor-pointer' : ''}`}

// Sau
className={`... ${canSelect ? 'cursor-pointer' : ''}`}
```

#### c) Thêm Hunter Target Mode Indicator
Thêm border pulsing cho các player cards có thể chọn khi Hunter đang ở chế độ bắn:
```javascript
{hunterCanShoot && !isDead && !elder && canSelect && !isSelected && (
    <div className="absolute inset-0 border-2 border-dashed border-[#c9a227]/40 animate-pulse pointer-events-none"></div>
)}
```

### 3. Cải thiện UI trong Hunter Revenge Modal

#### a) Hướng dẫn rõ ràng hơn
```javascript
// Trước
<span className="text-[#c9a227]">Chọn một người chơi từ danh sách bên trái.</span>

// Sau
<span className="text-[#c9a227] font-bold not-italic">⬅ Nhấp vào người chơi bên trái để chọn mục tiêu</span>
```

#### b) Thêm warning khi chưa chọn mục tiêu
```javascript
{!selectedPlayerId && (
    <div className="bg-[#c9a227]/10 border border-[#c9a227]/40 px-4 py-3 mb-5">
        <p className="text-[#c9a227] text-sm flex items-center justify-center gap-2">
            <RuneTarget className="w-4 h-4 animate-pulse" />
            <span className="font-bold">Chưa chọn mục tiêu - Nhấp vào người chơi để chọn</span>
        </p>
    </div>
)}
```

## Kết quả

### Các tính năng mới:
1. ✅ Hunter có thể chọn người chơi để bắn khi modal hiển thị
2. ✅ Player cards có visual feedback rõ ràng (border pulsing)
3. ✅ Không thể chọn người chơi đã chết
4. ✅ Không thể chọn host/moderator
5. ✅ Hunter không thể bắn chính mình
6. ✅ Hiển thị warning khi chưa chọn mục tiêu
7. ✅ Hướng dẫn rõ ràng với icon và text được highlight

### UI/UX Improvements:
- **Border pulsing** trên các player cards có thể chọn (màu vàng)
- **Warning box** hiển thị khi chưa chọn mục tiêu
- **Clear instruction** với icon mũi tên và text bold
- **Cursor pointer** chỉ hiển thị trên các player cards có thể chọn
- **Selection feedback** với border đỏ và icon target khi đã chọn

## Testing

### Test Cases:
1. ✅ Khi Hunter chết, modal "Phát Súng Cuối Cùng" hiển thị
2. ✅ Click vào player cards (không chết, không phải host) để chọn
3. ✅ Player được chọn có border đỏ và icon target
4. ✅ Click lại player đã chọn để bỏ chọn
5. ✅ Không thể click vào player đã chết (cursor không đổi, không có effect)
6. ✅ Không thể click vào host/moderator
7. ✅ Nút "Bắn" chỉ active khi đã chọn mục tiêu
8. ✅ Click "Không Bắn" để Hunter skip việc bắn
9. ✅ Click "Bắn" để Hunter bắn người đã chọn

### Edge Cases:
- ✅ Hunter là người cuối cùng còn sống → Không thể bắn ai
- ✅ Chỉ còn host và 1 player → Hunter không thể bắn (host không thể chọn)
- ✅ Chain Hunter shots (Hunter bắn Hunter khác) → Modal mới hiển thị cho Hunter tiếp theo

## Files Changed
- `frontend/src/pages/RoomPage.jsx`
  - Updated `handlePlayerSelect()` function
  - Updated player card selection state logic
  - Added hunter target mode visual indicators
  - Improved Hunter Revenge Modal UI
