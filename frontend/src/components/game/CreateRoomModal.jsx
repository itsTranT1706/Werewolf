/**
 * Create Room Modal
 * Component để tạo phòng với maxPlayers và chọn các role có trong phòng
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, FACTION } from '@/constants/roles'
import { roomApi } from '@/api'
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

    const villagerRoles = Object.values(ROLES).filter(r => r.faction === FACTION.VILLAGER)
    const werewolfRoles = Object.values(ROLES).filter(r => r.faction === FACTION.WEREWOLF)
    const neutralRoles = Object.values(ROLES).filter(r => r.faction === FACTION.NEUTRAL)

    const toggleRole = (roleId) => {
        setSelectedRoles(prev => ({
            ...prev,
            [roleId]: !prev[roleId]
        }))
    }

    const handleCreate = async () => {
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

        try {
            // Đảm bảo guest userId và username được tạo TRƯỚC khi tạo phòng
            const token = localStorage.getItem('token')
            let username = null
            let currentUserId = null

            if (!token) {
                // Tạo guest userId và username trước khi gửi request
                currentUserId = getOrCreateGuestUserId()
                // Sử dụng displayName nếu có, nếu không thì dùng username từ localStorage
                username = displayName.trim() || getOrCreateGuestUsername()
                // Lưu displayName vào localStorage nếu có
                if (displayName.trim()) {
                    localStorage.setItem('guest_username', displayName.trim())
                }
                console.log(`👤 Guest user - userId: ${currentUserId}, username: ${username}`)
            } else {
                // Lấy userId + username từ token cho user đã đăng nhập
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    currentUserId = payload.userId || payload.id
                    // username trong token chính là username dùng ở trang hồ sơ
                    username = payload.username || payload.displayname || null
                    console.log(`🔐 Auth user - userId: ${currentUserId}, username: ${username}`)
                } catch (err) {
                    console.warn('Could not get userId/username from token:', err)
                }
            }

            // QUAN TRỌNG: Đảm bảo userId được gửi lên backend khớp với currentUserId
            // Lưu vào localStorage trước để client.js interceptor có thể dùng
            if (currentUserId && !token) {
                // Nếu là guest, đảm bảo guest_user_id trong localStorage khớp
                localStorage.setItem('guest_user_id', currentUserId)
            }

            const roomData = {
                maxPlayers,
                availableRoles, // Danh sách role IDs được chọn
                isPrivate: false,
                username, // Gửi username cho cả guest lẫn user đăng nhập
                userId: currentUserId // Gửi userId trong body để đảm bảo backend nhận đúng
            }

            const result = await roomApi.create(roomData)
            const newRoomId = result.room?.id || result.roomId || `room-${Date.now()}`

            console.log(`🏗️ Room created: ${newRoomId}, hostId from API: ${result.room?.hostId}, currentUserId: ${currentUserId}`)

            // Lưu room settings và hostId vào localStorage
            localStorage.setItem(`room_${newRoomId}_settings`, JSON.stringify({
                maxPlayers,
                availableRoles
            }))

            // Lưu hostId (ưu tiên từ API, sau đó từ currentUserId đã lấy ở trên)
            const hostId = result.room?.hostId || currentUserId
            if (hostId) {
                localStorage.setItem(`room_${newRoomId}_host`, hostId)
                console.log(`💾 Saved hostId to localStorage: ${hostId}`)
            }

            // QUAN TRỌNG: Lưu userId đã dùng khi tạo phòng để đảm bảo nhất quán
            // Khi vào RoomPage, sẽ dùng userId này thay vì lấy từ token/guest mới
            if (currentUserId) {
                localStorage.setItem(`room_${newRoomId}_creator_userId`, currentUserId)
                console.log(`💾 Saved creator userId to localStorage: ${currentUserId}`)
            }

            // Navigate to room
            navigate(`/room/${newRoomId}`)
            onClose()
        } catch (err) {
            console.warn('API không khả dụng, tạo phòng với localStorage:', err.message || err)
            // Nếu API chưa có, vẫn tạo phòng với localStorage (fallback)
            const newRoomId = `room-${Date.now()}`

            // Lấy userId hiện tại
            let currentUserId = null
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    currentUserId = payload.userId || payload.id
                }
            } catch (tokenErr) {
                console.warn('Could not get userId from token:', tokenErr)
            }

            // Lưu room settings và hostId vào localStorage
            localStorage.setItem(`room_${newRoomId}_settings`, JSON.stringify({
                maxPlayers,
                availableRoles
            }))

            // Lưu hostId (người tạo phòng)
            if (currentUserId) {
                localStorage.setItem(`room_${newRoomId}_host`, currentUserId)
            } else {
                // Nếu không có userId, tạo một ID tạm thời
                const tempUserId = `temp-user-${Date.now()}`
                localStorage.setItem(`room_${newRoomId}_host`, tempUserId)
            }

            // Navigate to room
            navigate(`/room/${newRoomId}`)
            onClose()
        } finally {
            setLoading(false)
        }
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
