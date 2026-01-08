/**
 * Create Room Modal
 * Component để tạo phòng với maxPlayers và chọn các role có trong phòng
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, FACTION } from '@/constants/roles'
import { getRoomSocket } from '@/api/roomSocket'
import { getOrCreateGuestUsername, getOrCreateGuestUserId } from '@/utils/guestUtils'

export default function CreateRoomModal({ isOpen, onClose }) {
    const navigate = useNavigate()
    const [maxPlayers, setMaxPlayers] = useState(12)
    const [selectedRoles, setSelectedRoles] = useState({
        'VILLAGER': true,
        'SEER': true,
        'WITCH': true,
        'BODYGUARD': true,
        'YOUNG_WOLF': true,
        'ALPHA_WOLF': true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [displayName, setDisplayName] = useState('') // Tên hiển thị cho guest user
    const [roomSocket, setRoomSocket] = useState(null)

    const villagerRoles = Object.values(ROLES).filter(r => r.faction === FACTION.VILLAGER)
    const werewolfRoles = Object.values(ROLES).filter(r => r.faction === FACTION.WEREWOLF)
    const neutralRoles = Object.values(ROLES).filter(r => r.faction === FACTION.NEUTRAL)

    // Khởi tạo room socket
    useEffect(() => {
        const socket = getRoomSocket()
        setRoomSocket(socket)

        // Đợi socket connected
        const handleConnect = () => {
            console.log('✅ Room socket connected, ready to create room')
        }

        // Listen for ROOM_CREATED event
        const handleRoomCreated = (data) => {
            const room = data.room
            const newRoomId = room.id
            const roomCode = room.code

            console.log(`🏗️ Room created via socket: ${newRoomId}, code: ${roomCode}`)

            // Lấy userId hiện tại
            let currentUserId = null
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    currentUserId = payload.userId || payload.id
                } else {
                    currentUserId = getOrCreateGuestUserId()
                }
            } catch (err) {
                currentUserId = getOrCreateGuestUserId()
            }

            // QUAN TRỌNG: Tất cả localStorage keys đều dùng CODE (4 số) thay vì UUID
            if (!roomCode) {
                console.error('⚠️ Room code is missing!')
                return
            }

            // Lưu room settings với code
            localStorage.setItem(`room_${roomCode}_settings`, JSON.stringify({
                maxPlayers: room.maxPlayers,
                availableRoles: Object.keys(selectedRoles).filter(roleId => selectedRoles[roleId])
            }))

            // Lưu hostId (người tạo phòng) với code
            if (currentUserId) {
                localStorage.setItem(`room_${roomCode}_host`, currentUserId)
                localStorage.setItem(`room_${roomCode}_creator_userId`, currentUserId)
            }

            console.log(`💾 Saved room data to localStorage with code: ${roomCode}`)

            // Navigate to room bằng CODE (4 digits) thay vì UUID
            // Để RoomPage có thể join trực tiếp bằng code
            navigate(`/room/${roomCode}`)
            onClose()
            setLoading(false)
        }

        // Listen for ERROR event
        const handleError = (error) => {
            console.error('Room creation error:', error)
            setError(error.message || 'Không thể tạo phòng')
            setLoading(false)
        }

        socket.on('connect', handleConnect)
        socket.on('ROOM_CREATED', handleRoomCreated)
        socket.on('ERROR', handleError)

        // Nếu đã connected, log ngay
        if (socket.connected) {
            console.log('✅ Room socket already connected')
        }

        return () => {
            socket.off('connect', handleConnect)
            socket.off('ROOM_CREATED', handleRoomCreated)
            socket.off('ERROR', handleError)
        }
    }, [navigate, onClose, selectedRoles])

    const toggleRole = (roleId) => {
        setSelectedRoles(prev => ({
            ...prev,
            [roleId]: !prev[roleId]
        }))
    }

    // Function để gửi CREATE_ROOM event
    const sendCreateRoomEvent = () => {
        console.log('🔍 sendCreateRoomEvent called, socket state:', {
            hasSocket: !!roomSocket,
            connected: roomSocket?.connected,
            socketId: roomSocket?.id
        })

        if (!roomSocket || !roomSocket.connected) {
            console.error('❌ Socket not connected!', {
                hasSocket: !!roomSocket,
                connected: roomSocket?.connected
            })
            setError('Socket chưa kết nối')
            setLoading(false)
            return
        }

        // Đảm bảo guest userId và username được tạo TRƯỚC khi tạo phòng
        const token = localStorage.getItem('token')
        let displayname = null

        if (!token) {
            // Sử dụng displayName nếu có, nếu không thì dùng username từ localStorage
            displayname = displayName.trim() || getOrCreateGuestUsername()
            // Lưu displayName vào localStorage nếu có
            if (displayName.trim()) {
                localStorage.setItem('guest_username', displayName.trim())
            }
        } else {
            // Lấy username từ token cho user đã đăng nhập
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                displayname = payload.username || payload.displayname || null
            } catch (err) {
                console.warn('Could not get username from token:', err)
            }
        }

        // Lấy userId để gửi lên backend
        let userId = null
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                userId = payload.userId || payload.id
            } else {
                userId = getOrCreateGuestUserId()
            }
        } catch (err) {
            userId = getOrCreateGuestUserId()
        }

        const roomData = {
            name: `Phòng ${Date.now()}`, // Tên phòng mặc định
            maxPlayers,
            settings: {
                availableRoles: Object.keys(selectedRoles).filter(roleId => selectedRoles[roleId])
            },
            displayname: displayname || 'Anonymous Host',
            userId: userId // QUAN TRỌNG: Gửi userId để backend biết ai là host
        }

        console.log('📤 Emitting CREATE_ROOM event via SOCKET:', roomData)
        console.log('📤 Socket ID:', roomSocket.id)
        console.log('📤 Socket connected:', roomSocket.connected)
        console.log('📤 UserId being sent:', userId)

        // Gửi CREATE_ROOM event qua socket (KHÔNG dùng REST API)
        roomSocket.emit('CREATE_ROOM', roomData)
    }

    const handleCreate = async () => {
        console.log('🎯 handleCreate called - Using SOCKET, NOT REST API')

        // Validate
        if (maxPlayers < 3 || maxPlayers > 75) {
            setError('Số người chơi phải từ 3-75')
            return
        }

        const availableRoles = Object.keys(selectedRoles).filter(roleId => selectedRoles[roleId])
        if (availableRoles.length === 0) {
            setError('Phải chọn ít nhất 1 role')
            return
        }

        // Check có ít nhất 1 Sói và 1 Dân
        const hasWerewolf = availableRoles.some(r => werewolfRoles.find(wr => wr.id === r))
        const hasVillager = availableRoles.some(r => villagerRoles.find(vr => vr.id === r))

        if (!hasWerewolf) {
            setError('Phải có ít nhất 1 role phe Ma Sói')
            return
        }

        if (!hasVillager) {
            setError('Phải có ít nhất 1 role phe Dân Làng')
            return
        }

        setError(null)
        setLoading(true)

        // Kiểm tra socket
        if (!roomSocket) {
            setError('Chưa khởi tạo socket. Vui lòng thử lại...')
            setLoading(false)
            return
        }

        // Đợi socket connected (tối đa 5 giây)
        if (!roomSocket.connected) {
            console.log('⏳ Waiting for socket connection...')
            setError('Đang kết nối với server. Vui lòng đợi...')

            // Đợi socket connect
            const timeout = setTimeout(() => {
                if (!roomSocket.connected) {
                    setError('Không thể kết nối với server. Vui lòng kiểm tra room-service đang chạy (port 8082).')
                    setLoading(false)
                }
            }, 5000)

            roomSocket.once('connect', () => {
                clearTimeout(timeout)
                console.log('✅ Socket connected, proceeding with room creation')
                sendCreateRoomEvent()
            })

            return
        }

        // Socket đã connected, tiếp tục tạo phòng
        sendCreateRoomEvent()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-wood-dark border-4 border-gold rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="p-6 border-b border-wood-light">
                    <h2 className="font-heading text-3xl text-parchment-text mb-2">
                        🏰 Tạo Phòng Mới
                    </h2>
                    <p className="text-gold-dim">
                        Thiết lập số người chơi và các role có trong phòng
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-blood-dried/50 border-l-4 border-blood-red m-4">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="p-6 space-y-6">
                    {/* Display Name Input (chỉ hiển thị khi chưa đăng nhập) */}
                    {!localStorage.getItem('token') && (
                        <div>
                            <label className="block text-parchment-text font-heading mb-2">
                                Tên Hiển Thị
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Nhập tên hiển thị của bạn"
                                maxLength={30}
                                className="w-full px-4 py-2 bg-wood-dark border border-wood-light rounded text-parchment-text placeholder-parchment-text/50 focus:outline-none focus:border-gold-dim"
                            />
                            <p className="text-xs text-parchment-text/60 mt-1">
                                Tên này sẽ được hiển thị trong phòng (tối đa 30 ký tự)
                            </p>
                        </div>
                    )}

                    {/* Max Players */}
                    <div>
                        <label className="block text-parchment-text font-heading mb-2">
                            Số Người Chơi Tối Đa: <span className="text-gold-dim font-bold">{maxPlayers}</span>
                        </label>
                        <input
                            type="range"
                            min="3"
                            max="75"
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-parchment-text/60 mt-1">
                            <span>3</span>
                            <span>75</span>
                        </div>
                    </div>

                    {/* Available Roles */}
                    <div>
                        <label className="block text-parchment-text font-heading mb-4">
                            Chọn Các Role Có Trong Phòng
                        </label>

                        {/* Phe Dân Làng */}
                        <div className="mb-4">
                            <h3 className="font-heading text-lg text-green-400 mb-3 flex items-center gap-2">

                                Phe Dân Làng
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {villagerRoles.map(role => (
                                    <label
                                        key={role.id}
                                        className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-all ${selectedRoles[role.id]
                                            ? 'bg-green-900/30 border-green-500'
                                            : 'bg-wood-dark/50 border-wood-light'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles[role.id] || false}
                                            onChange={() => toggleRole(role.id)}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-parchment-text font-heading">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Phe Ma Sói */}
                        <div>
                            <h3 className="font-heading text-lg text-red-400 mb-3 flex items-center gap-2">

                                Phe Ma Sói
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {werewolfRoles.map(role => (
                                    <label
                                        key={role.id}
                                        className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-all ${selectedRoles[role.id]
                                            ? 'bg-red-900/30 border-red-500'
                                            : 'bg-wood-dark/50 border-wood-light'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles[role.id] || false}
                                            onChange={() => toggleRole(role.id)}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-parchment-text font-heading">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Phe Độc Lập */}
                        <div className="mt-6">
                            <h3 className="font-heading text-lg text-amber-300 mb-3 flex items-center gap-2">

                                Phe Độc Lập
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {neutralRoles.map(role => (
                                    <label
                                        key={role.id}
                                        className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-all ${selectedRoles[role.id]
                                            ? 'bg-amber-900/30 border-amber-500'
                                            : 'bg-wood-dark/50 border-wood-light'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles[role.id] || false}
                                            onChange={() => toggleRole(role.id)}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-parchment-text font-heading">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-wood-light flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-blood-dried border border-blood-red rounded text-parchment-text hover:bg-blood-red transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-6 py-3 bg-gold border border-gold-dark rounded text-wood-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang tạo...' : '✅ Tạo Phòng'}
                    </button>
                </div>
            </div>
        </div>
    )
}
