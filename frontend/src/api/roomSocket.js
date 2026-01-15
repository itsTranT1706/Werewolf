/**
 * Room Service Socket.io Client Singleton
 * 
 * File này làm gì:
 * 1. Tạo kết nối WebSocket với Room Service (port 8082)
 * 2. Quản lý connection (connect, disconnect, reconnect)
 * 3. Cung cấp socket instance để các module room dùng
 * 
 * Lưu ý: Room service không yêu cầu authentication,
 * có thể tạo và join room mà không cần đăng nhập
 */

import { io } from 'socket.io-client'

let roomSocket = null

/**
 * Get or create room socket instance
 * 
 * Singleton pattern - chỉ tạo 1 connection duy nhất
 * Nếu đã có connection thì dùng lại, không tạo mới
 */
export function getRoomSocket() {
    // Nếu đã có socket và đang connected → dùng lại
    if (roomSocket?.connected) {
        return roomSocket
    }

    // URL của Room Service (WebSocket endpoint)
    const roomSocketUrl = import.meta.env.VITE_ROOM_SOCKET_URL || 'http://localhost:8082'


    // Event: Khi kết nối thành công
    roomSocket.on('connect', () => {
        console.log('✅ Room socket connected:', roomSocket.id)
    })

    // Event: Khi mất kết nối
    roomSocket.on('disconnect', () => {
        console.log('❌ Room socket disconnected')
    })

    // Event: Khi có lỗi từ server
    roomSocket.on('ERROR', (error) => {
        console.error('Room socket error:', error)
    })

    return roomSocket
}

/**
 * Disconnect room socket
 * Dùng khi không cần connection nữa
 */
export function disconnectRoomSocket() {
    if (roomSocket) {
        roomSocket.disconnect()
        roomSocket = null
    }
}

export default getRoomSocket


