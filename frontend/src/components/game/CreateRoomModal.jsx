/**
 * Create Room Modal - Ritual Chamber Setup
 * 
 * Dark medieval fantasy styled room creation.
 * Feels like preparing a forbidden ritual.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, FACTION } from '@/constants/roles'
import { getRoomSocket } from '@/api/roomSocket'
import { getOrCreateGuestUsername, getOrCreateGuestUserId } from '@/utils/guestUtils'
import { MedievalButton, MedievalInput } from '@/components/ui'
import { RuneClose, RuneUser, CornerAccent } from '@/components/ui/AncientIcons'

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }) {
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
  const [displayName, setDisplayName] = useState('')
  const [roomSocket, setRoomSocket] = useState(null)

  const villagerRoles = Object.values(ROLES).filter(r => r.faction === FACTION.VILLAGER)
  const werewolfRoles = Object.values(ROLES).filter(r => r.faction === FACTION.WEREWOLF)
  const neutralRoles = Object.values(ROLES).filter(r => r.faction === FACTION.NEUTRAL)

  useEffect(() => {
    const socket = getRoomSocket()
    setRoomSocket(socket)

    const handleConnect = () => {
      console.log('✅ Room socket connected')
    }

    const handleRoomCreated = (data) => {
      const room = data.room
      const newRoomId = room.id
      const roomCode = room.code

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

      if (!roomCode) {
        console.error('⚠️ Room code is missing!')
        return
      }

      localStorage.setItem(`room_${roomCode}_settings`, JSON.stringify({
        maxPlayers: room.maxPlayers,
        availableRoles: Object.keys(selectedRoles).filter(roleId => selectedRoles[roleId])
      }))

      const hostPlayer = room.players?.find(p => p.isHost)
      if (hostPlayer) {
        localStorage.setItem(`room_${roomCode}_hostPlayerId`, hostPlayer.id)
      }
      if (currentUserId) {
        localStorage.setItem(`room_${roomCode}_host`, currentUserId)
        localStorage.setItem(`room_${roomCode}_creator_userId`, currentUserId)
      }

      if (onRoomCreated) {
        onRoomCreated(roomCode)
        onClose()
        setLoading(false)
        return
      }
      navigate(`/room/${roomCode}`)
      onClose()
      setLoading(false)
    }

    const handleError = (error) => {
      console.error('Room creation error:', error)
      setError(error.message || 'Không thể tạo phòng')
      setLoading(false)
    }

    socket.on('connect', handleConnect)
    socket.on('ROOM_CREATED', handleRoomCreated)
    socket.on('ERROR', handleError)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('ROOM_CREATED', handleRoomCreated)
      socket.off('ERROR', handleError)
    }
  }, [navigate, onClose, onRoomCreated, selectedRoles])

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }))
  }

  const sendCreateRoomEvent = () => {
    if (!roomSocket || !roomSocket.connected) {
      setError('Socket chưa kết nối')
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    let displayname = null

    if (!token) {
      displayname = displayName.trim() || getOrCreateGuestUsername()
      if (displayName.trim()) {
        localStorage.setItem('guest_username', displayName.trim())
      }
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        displayname = payload.username || payload.displayname || null
      } catch (err) {
        console.warn('Could not get username from token:', err)
      }
    }

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
      name: `Phòng ${Date.now()}`,
      maxPlayers,
      settings: {
        availableRoles: Object.keys(selectedRoles).filter(roleId => selectedRoles[roleId])
      },
      displayname: displayname || 'Anonymous Host',
      userId: userId
    }

    roomSocket.emit('CREATE_ROOM', roomData)
  }

  const handleCreate = async () => {
    if (maxPlayers < 3 || maxPlayers > 75) {
      setError('Số người chơi phải từ 3-75')
      return
    }

    const availableRoles = Object.keys(selectedRoles).filter(roleId => selectedRoles[roleId])
    if (availableRoles.length === 0) {
      setError('Phải chọn ít nhất 1 role')
      return
    }

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

    if (!roomSocket) {
      setError('Chưa khởi tạo socket')
      setLoading(false)
      return
    }

    if (!roomSocket.connected) {
      setError('Đang kết nối...')
      const timeout = setTimeout(() => {
        if (!roomSocket.connected) {
          setError('Không thể kết nối với server')
          setLoading(false)
        }
      }, 5000)

      roomSocket.once('connect', () => {
        clearTimeout(timeout)
        sendCreateRoomEvent()
      })
      return
    }

    sendCreateRoomEvent()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.9)' }}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(20,16,12,0.98) 0%, rgba(15,12,10,0.99) 100%)',
          border: '2px solid rgba(139,115,85,0.4)',
          boxShadow: '0 0 40px rgba(139,115,85,0.15), 0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-2 left-2 text-[#8b7355] opacity-40">
          <CornerAccent className="w-6 h-6" position="top-left" />
        </div>
        <div className="absolute top-2 right-2 text-[#8b7355] opacity-40">
          <CornerAccent className="w-6 h-6" position="top-right" />
        </div>

        {/* Header */}
        <div 
          className="p-6 flex justify-between items-center"
          style={{ borderBottom: '1px solid rgba(139,115,85,0.2)' }}
        >
          <div>
            <h2 
              className="font-medieval text-2xl tracking-wider"
              style={{ color: '#8b7355' }}
            >
              Tạo Phòng Mới
            </h2>
            <p className="font-fantasy text-sm mt-1" style={{ color: '#6a5a4a' }}>
              Thiết lập nghi lễ săn đêm
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6a5a4a] hover:text-[#8b7355] transition-colors"
          >
            <RuneClose className="w-6 h-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div 
            className="mx-6 mt-4 p-4"
            style={{
              background: 'rgba(139,0,0,0.15)',
              border: '1px solid rgba(139,0,0,0.4)',
            }}
          >
            <p className="font-fantasy text-sm" style={{ color: '#a05050' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Display Name */}
          {!localStorage.getItem('token') && (
            <div>
              <label 
                className="block font-medieval text-sm tracking-wide mb-2"
                style={{ color: '#8b7355' }}
              >
                Tên Hiển Thị
              </label>
              <MedievalInput
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị"
                maxLength={30}
                icon={<RuneUser className="w-5 h-5" />}
              />
            </div>
          )}

          {/* Max Players */}
          <div>
            <label 
              className="block font-medieval text-sm tracking-wide mb-3"
              style={{ color: '#8b7355' }}
            >
              Số Người Chơi: <span style={{ color: '#a89070' }}>{maxPlayers}</span>
            </label>
            <input
              type="range"
              min="3"
              max="75"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full h-2 rounded-none appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, rgba(139,115,85,0.3) 0%, rgba(139,115,85,0.5) 100%)',
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="font-fantasy text-xs" style={{ color: '#5a4a3a' }}>3</span>
              <span className="font-fantasy text-xs" style={{ color: '#5a4a3a' }}>75</span>
            </div>
          </div>

          {/* Roles Selection */}
          <div>
            <label 
              className="block font-medieval text-sm tracking-wide mb-4"
              style={{ color: '#8b7355' }}
            >
              Chọn Vai Trò
            </label>

            {/* Villager Roles */}
            <div className="mb-6">
              <h3 
                className="font-medieval text-sm mb-3 flex items-center gap-2"
                style={{ color: '#4a8a5a' }}
              >
                Phe Dân Làng
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {villagerRoles.map(role => (
                  <RoleCheckbox
                    key={role.id}
                    role={role}
                    checked={selectedRoles[role.id] || false}
                    onChange={() => toggleRole(role.id)}
                    color="#4a8a5a"
                  />
                ))}
              </div>
            </div>

            {/* Werewolf Roles */}
            <div className="mb-6">
              <h3 
                className="font-medieval text-sm mb-3 flex items-center gap-2"
                style={{ color: '#8b4040' }}
              >
                Phe Ma Sói
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {werewolfRoles.map(role => (
                  <RoleCheckbox
                    key={role.id}
                    role={role}
                    checked={selectedRoles[role.id] || false}
                    onChange={() => toggleRole(role.id)}
                    color="#8b4040"
                  />
                ))}
              </div>
            </div>

            {/* Neutral Roles */}
            {neutralRoles.length > 0 && (
              <div>
                <h3 
                  className="font-medieval text-sm mb-3 flex items-center gap-2"
                  style={{ color: '#8b7355' }}
                >
                  Phe Độc Lập
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {neutralRoles.map(role => (
                    <RoleCheckbox
                      key={role.id}
                      role={role}
                      checked={selectedRoles[role.id] || false}
                      onChange={() => toggleRole(role.id)}
                      color="#8b7355"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div 
          className="p-6 flex justify-end gap-4"
          style={{ borderTop: '1px solid rgba(139,115,85,0.2)' }}
        >
          <MedievalButton onClick={onClose} variant="secondary">
            Hủy
          </MedievalButton>
          <MedievalButton onClick={handleCreate} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo Phòng'}
          </MedievalButton>
        </div>
      </div>
    </div>
  )
}

function RoleCheckbox({ role, checked, onChange, color }) {
  return (
    <label
      className="flex items-center gap-2 p-3 cursor-pointer transition-all duration-300"
      style={{
        background: checked ? `${color}15` : 'rgba(15,12,10,0.6)',
        border: `1px solid ${checked ? `${color}50` : 'rgba(60,50,40,0.4)'}`,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-current"
        style={{ accentColor: color }}
      />
      <span 
        className="font-fantasy text-sm"
        style={{ color: checked ? color : '#8a7a6a' }}
      >
        {role.name}
      </span>
    </label>
  )
}
