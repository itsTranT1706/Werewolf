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

    // URL của API Gateway (WebSocket endpoint)
    // API Gateway quản lý tất cả WebSocket connections, không phải Room Service
    // const roomSocketUrl = import.meta.env.VITE_ROOM_SOCKET_URL ||
    //     (window.location.hostname === 'localhost'
    //         ? 'http://localhost:8080'
    //         : `${window.location.protocol}//${window.location.hostname}:8080`)
    const isLocalhost = window.location.hostname === 'localhost'

    const roomSocketUrl = import.meta.env.VITE_ROOM_SOCKET_URL ||
        (isLocalhost
            ? 'http://localhost:8082'
            : window.location.origin)
    const roomSocket = import.meta.env.VITE_ROOM_SOCKET_URL
        ? '/socket.io'
        : (isLocalhost ? '/socket.io' : '/room-socket.io/socket.io')
    console.log(roomSocketUrl);

    // Tạo kết nối socket
    roomSocket = io(roomSocketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    })

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


