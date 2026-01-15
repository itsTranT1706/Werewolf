/**
 * Socket.io Client Singleton
 * 
 * File này làm gì:
 * 1. Tạo kết nối WebSocket với API Gateway
 * 2. Quản lý connection (connect, disconnect, reconnect)
 * 3. Xử lý authentication (gửi JWT token)
 * 4. Cung cấp socket instance để các module khác dùng
 */

import { io } from 'socket.io-client'

let socket = null

/**
 * Get or create socket instance
 * 
 * Singleton pattern - chỉ tạo 1 connection duy nhất
 * Nếu đã có connection thì dùng lại, không tạo mới
 */
export function getSocket() {
    // Nếu đã có socket và đang connected → dùng lại
    if (socket?.connected) {
        return socket
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem('token')
    // Nếu không có token, dùng guestId để socket backend nhận dạng
    const guestId = !token ? localStorage.getItem('guest_user_id') || localStorage.getItem('guestId') : null

    // URL của API Gateway (WebSocket endpoint)
    // Tự động detect server URL từ window.location khi deploy production
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
        (window.location.hostname === 'localhost' 
            ? 'http://localhost:8080' 
            : `${window.location.protocol}//${window.location.hostname}:8080`)

    // Tạo socket connection
    socket = io(socketUrl, {
        auth: {
            token: token,       // JWT nếu có
            guestId: guestId || undefined // fallback cho guest
        },
        transports: ['websocket', 'polling'], // Ưu tiên WebSocket, fallback polling
        reconnection: true,  // Tự động reconnect nếu mất kết nối
        reconnectionDelay: 1000,  // Đợi 1s trước khi reconnect
        reconnectionAttempts: 5  // Thử tối đa 5 lần
    })

    // Event: Khi kết nối thành công
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id)
    })

    // Event: Khi mất kết nối
    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected')
    })

    // Event: Khi có lỗi từ server
    socket.on('ERROR', (error) => {
        console.error('Socket error:', error)
    })

    return socket
}

/**
 * Disconnect socket
 * Dùng khi logout hoặc không cần connection nữa
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export default getSocket