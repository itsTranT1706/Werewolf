# Test CUPID Role - Quick Guide

## 🎯 Test Steps

### 1. Access Game
- Open: http://localhost (or your frontend URL)
- Login or play as Guest

### 2. Create Room
- Click "Tạo Phòng" or "Create Room"
- Wait for room to be created

### 3. Setup Roles (CRITICAL!)
- Click "Setup Roles" button
- Find **CUPID** (Thần Tình Yêu 💘)
- Set count to **1**
- Adjust other roles (example for 5 players):
  - CUPID: 1
  - YOUNG_WOLF: 1
  - ALPHA_WOLF: 1
  - SEER: 1
  - VILLAGER: 1
- Click "Xác Nhận" / Confirm

### 4. Add Players
- Share room link or add guests
- Need at least 3 players total

### 5. Start Game
- Click "Bắt Đầu Chơi" / Start Game
- Check Console (F12) for logs:
  ```
  🎮 Role setup confirmed: {CUPID: 1, ...}
  🎯 CUPID in setup? 1 number
  ```

### 6. Start Night
- Click "Bắt Đầu Đêm" / Start Night
- Check Console for:
  ```
  🌙 Night phase started
  🔍 Pre-check: {roleSetup: {CUPID: 1}}
  🎯 Night step check: {hasCupid: true, firstStep: "CUPID"}
  ❓ Why CUPID? {is day 1: true, hasCupid: true, result: "CUPID"}
  ```

## ✅ Expected Results

### If CUPID Works:
1. **Night Wizard Panel** shows "**Nghi Thức Tình Yêu**" (not "Nghỉ Thức Bảo Vệ")
2. **Counter** shows "Đã chọn 0/2 người chơi"
3. **Player cards** are clickable
4. When you click 2 players → **Pink hearts 💘** appear on their cards
5. **"Xác Nhận Nghi Thức"** button becomes enabled
6. Click confirm → Lovers receive pink notification modal

### If CUPID Doesn't Show:
Check console for these values in `🎯 Night step check:`:
- `hasCupid: false` → roleSetup not saved correctly
- `firstStep: "BODYGUARD"` → logic chose wrong step
- `roleSetup: null` → setup didn't save

## 🐛 Common Issues

**Issue 1: Shows "Nghỉ Thức Bảo Vệ" instead**
- Solution: Make sure you clicked "Setup Roles" AND set CUPID = 1
- Check console: `roleSetup.CUPID` should be `1`

**Issue 2: No logs in console**
- Solution: Hard refresh (Ctrl + Shift + R)
- Or clear cache and reload

**Issue 3: Can't click players**
- Check: Are you the Host/GM?
- Check: Is game phase = "NIGHT"?

## 📸 What to Screenshot

If issues occur, screenshot:
1. Full Console logs (scroll to top, capture all)
2. Night Wizard Panel
3. Role setup modal (when setting up)
