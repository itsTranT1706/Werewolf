/**
 * Post-login landing page
 * Full-screen immersive entry into the game world
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import GameHUD from '@/components/game/GameHUD'
import RolesModal from '@/components/game/RolesModal'
import CreateRoomModal from '@/components/game/CreateRoomModal'
import { profileApi, authApi } from '@/api'

export default function GamePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [roomError, setRoomError] = useState('')
  const [globalError, setGlobalError] = useState('')

  useEffect(() => {
    // Load user info for HUD
    loadUser()

    // Kiểm tra query params để tự động mở modal / hiển thị thông báo lỗi
    const create = searchParams.get('create')
    const room = searchParams.get('room')
    const errorMsg = searchParams.get('error')

    if (create === 'true') {
      setShowCreateRoom(true)
      // Xóa query param sau khi mở modal
      navigate('/game', { replace: true })
    }

    if (room) {
      // Nếu có room param, navigate đến room
      navigate(`/room/${room}`, { replace: true })
    }

    if (errorMsg) {
      setGlobalError(errorMsg)
      // Xóa error param sau khi hiển thị
      navigate('/game', { replace: true })
    }
  }, [searchParams, navigate])

  const loadUser = async () => {
    try {
      const data = await profileApi.getMe()
      setUser(data.result || data)
    } catch (err) {
      // Nếu lỗi "User not found", thử init profile
      if (err.message?.includes('not found') || err.message?.includes('User not found')) {
        try {
          await initProfile()
          // Sau khi init, load lại profile
          const data = await profileApi.getMe()
          setUser(data.result || data)
        } catch (initErr) {
          // Nếu init cũng lỗi, chỉ log warning
          console.warn('Could not initialize profile:', initErr)
        }
      } else {
        // Các lỗi khác, chỉ log warning
        console.warn('Could not load user profile:', err)
      }
    }
  }

  const initProfile = async () => {
    // Lấy thông tin user từ token
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId || payload.id
      const username = payload.username || 'User'
      const email = payload.email || `${username}@example.com`

      // Gọi API init profile
      const response = await fetch('/api/v1/user-profile/internal/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: userId,
          username: username,
          email: email
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        // Nếu profile đã tồn tại, không coi là lỗi
        if (errorData.message?.includes('already exists')) {
          return { success: true }
        }
        throw new Error(errorData.message || 'Failed to initialize profile')
      }

      return await response.json()
    } catch (err) {
      console.error('Error initializing profile:', err)
      // Nếu lỗi là "already exists", không throw
      if (err.message?.includes('already exists')) {
        return { success: true }
      }
      throw err
    }
  }

  const handleRoomIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4) // Chỉ số, tối đa 4 chữ số
    setRoomId(value)
    if (roomError) setRoomError('')
  }

  const handleFindRoom = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      // Yêu cầu đăng nhập trước, rồi quay lại đúng phòng
      navigate(`/login?redirect=${encodeURIComponent(`/room/${roomId.trim()}`)}`)
      return
    }

    if (!roomId.trim()) {
      setRoomError('Vui lòng nhập ID phòng')
      return
    }
    if (roomId.length !== 4) {
      setRoomError('ID phòng phải có đúng 4 chữ số')
      return
    }
    setRoomError('')
    navigate(`/room/${roomId.trim()}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Dark fantasy background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.35) saturate(0.8)'
        }}
      />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-blue/70 via-transparent to-night-blue/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-night-blue/50 via-transparent to-night-blue/50" />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)'
        }}
      />

      {/* Ambient particles/fog */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: 'url(/assets/effects/fog.png)',
          backgroundSize: 'cover',
          animation: 'fogDrift 25s ease-in-out infinite'
        }}
      />

      {/* Game HUD */}
      <GameHUD username={user?.username} avatar={user?.avatarUrl} />

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Global error from redirect (ví dụ phòng không tồn tại) */}
        {globalError && (
          <div className="mb-4 px-4 py-3 rounded border border-red-500/70 bg-red-900/60 text-red-100 text-sm font-fantasy shadow-lg max-w-md mx-auto">
            {globalError}
          </div>
        )}

        {/* Decorative top flourish */}
        <div className="flex justify-center mb-6 opacity-60">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Main title */}
        <h1
          className="font-medieval text-6xl md:text-8xl lg:text-9xl tracking-wider"
          style={{
            color: '#c9a227',
            textShadow: `
              0 0 20px rgba(201, 162, 39, 0.5),
              0 0 40px rgba(201, 162, 39, 0.3),
              0 0 60px rgba(201, 162, 39, 0.2),
              0 4px 8px rgba(0, 0, 0, 0.8)
            `
          }}
        >
          Ma Sói
        </h1>

        {/* Subtitle */}
        <p
          className="font-fantasy text-parchment/60 text-lg md:text-xl tracking-[0.4em] uppercase mt-4"
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
          }}
        >
          Cuộc Săn Bắt Đầu
        </p>

        {/* Decorative bottom flourish */}
        <div className="flex justify-center mt-6 opacity-60">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => {
              const token = localStorage.getItem('token')
              if (!token) {
                // Bắt đăng nhập trước khi tạo phòng, sau login quay lại /game?create=true
                navigate(`/login?redirect=${encodeURIComponent('/game?create=true')}`)
                return
              }
              setShowCreateRoom(true)
            }}
            className="w-full px-8 py-4 bg-yellow-600/30 border-2 border-yellow-400 rounded-lg text-yellow-300 font-fantasy hover:bg-yellow-600/50 transition-all shadow-lg hover:shadow-yellow-400/50 text-lg font-semibold"
            style={{
              textShadow: '0 0 10px rgba(255, 255, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)'
            }}
          >
            🏰 Tạo Phòng
          </button>

          {/* Tìm Phòng */}
          <div className="w-full space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={handleRoomIdChange}
                onKeyPress={(e) => e.key === 'Enter' && handleFindRoom()}
                placeholder="Nhập ID phòng (4 chữ số)..."
                maxLength={4}
                inputMode="numeric"
                className="flex-1 px-4 py-3 bg-wood-dark/80 border-2 border-wood-light rounded-lg text-parchment-text font-fantasy placeholder-parchment-text/50 focus:outline-none focus:border-blue-400 transition-all"
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              />
              <button
                onClick={handleFindRoom}
                className="px-6 py-3 bg-blue-600/30 border-2 border-blue-400 rounded-lg text-blue-300 font-fantasy hover:bg-blue-600/50 transition-all shadow-lg hover:shadow-blue-400/50 font-semibold whitespace-nowrap"
                style={{
                  textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}
              >
                🔍 Tìm Phòng
              </button>
            </div>
            {roomError && (
              <p className="text-red-400 text-sm font-fantasy text-center" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)' }}>
                {roomError}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowRolesModal(true)}
            className="w-full px-8 py-4 bg-purple-600/30 border-2 border-purple-400 rounded-lg text-purple-300 font-fantasy hover:bg-purple-600/50 transition-all shadow-lg hover:shadow-purple-400/50 text-lg font-semibold"
            style={{
              textShadow: '0 0 10px rgba(192, 132, 252, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 0 20px rgba(192, 132, 252, 0.3)'
            }}
          >
            🎭 Vai Trò
          </button>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-24 h-24 opacity-20 pointer-events-none">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute top-6 right-6 w-24 h-24 opacity-20 pointer-events-none transform scale-x-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-6 left-6 w-24 h-24 opacity-20 pointer-events-none transform scale-y-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-6 right-6 w-24 h-24 opacity-20 pointer-events-none transform scale-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>

      {/* Roles Modal */}
      <RolesModal
        isOpen={showRolesModal}
        onClose={() => setShowRolesModal(false)}
      />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
      />
    </div>
  )
}
