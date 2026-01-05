/**
 * Create Room Modal
 * Component để tạo phòng với maxPlayers và chọn các role có trong phòng
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, FACTION } from '@/constants/roles'
import { roomApi } from '@/api'

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
    const [roomName, setRoomName] = useState('')
    const [zoomId, setZoomId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const villagerRoles = Object.values(ROLES).filter(r => r.faction === FACTION.VILLAGER)
    const werewolfRoles = Object.values(ROLES).filter(r => r.faction === FACTION.WEREWOLF)

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
            const roomData = {
                name: roomName || `Phòng ${Date.now()}`,
                maxPlayers,
                availableRoles, // Danh sách role IDs được chọn
                zoomId: zoomId || null,
                isPrivate: false
            }

            const result = await roomApi.create(roomData)
            const newRoomId = result.room?.id || result.roomId || `room-${Date.now()}`

            // Lưu room settings vào localStorage (tạm thời, sẽ thay bằng API sau)
            localStorage.setItem(`room_${newRoomId}_settings`, JSON.stringify({
                maxPlayers,
                availableRoles
            }))

            // Navigate to room
            navigate(`/room/${newRoomId}`)
            onClose()
        } catch (err) {
            console.error('Error creating room:', err)
            // Nếu API chưa có, vẫn tạo phòng với localStorage
            const newRoomId = `room-${Date.now()}`
            localStorage.setItem(`room_${newRoomId}_settings`, JSON.stringify({
                maxPlayers,
                availableRoles
            }))
            navigate(`/room/${newRoomId}`)
            onClose()
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
                    {/* Room Name */}
                    <div>
                        <label className="block text-parchment-text font-heading mb-2">
                            Tên Phòng (Tùy chọn)
                        </label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Nhập tên phòng..."
                            className="w-full px-4 py-3 bg-wood-light border border-wood-dark rounded text-parchment-text focus:outline-none focus:border-gold"
                        />
                    </div>

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

                    {/* Zoom ID */}
                    <div>
                        <label className="block text-parchment-text font-heading mb-2">
                            Zoom ID (Tùy chọn)
                        </label>
                        <input
                            type="text"
                            value={zoomId}
                            onChange={(e) => setZoomId(e.target.value)}
                            placeholder="Nhập Zoom ID..."
                            className="w-full px-4 py-3 bg-wood-light border border-wood-dark rounded text-parchment-text focus:outline-none focus:border-gold"
                        />
                    </div>

                    {/* Available Roles */}
                    <div>
                        <label className="block text-parchment-text font-heading mb-4">
                            Chọn Các Role Có Trong Phòng
                        </label>

                        {/* Phe Dân Làng */}
                        <div className="mb-4">
                            <h3 className="font-heading text-lg text-green-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">shield</span>
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
                                <span className="material-symbols-outlined">pets</span>
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

