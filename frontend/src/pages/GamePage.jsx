/**
 * Game Page - The Cursed Village Square
 * 
 * Post-login landing page with dark medieval fantasy aesthetic.
 * Feels like standing in a moonlit village square.
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import GameHUD from '@/components/game/GameHUD'
import RolesModal from '@/components/game/RolesModal'
import CreateRoomModal from '@/components/game/CreateRoomModal'
import { profileApi, authApi } from '@/api'
import { MedievalButton, MedievalPanel, MedievalInput, notify } from '@/components/ui'
import { RuneDoor, RuneWolf, RuneScroll, CornerAccent, RuneCopy, RuneShare } from '@/components/ui/AncientIcons'

export default function GamePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [roomError, setRoomError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [shareRoomCode, setShareRoomCode] = useState('')
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    loadUser()

    const create = searchParams.get('create')
    const room = searchParams.get('room')
    const errorMsg = searchParams.get('error')

    if (create === 'true') {
      setShowCreateRoom(true)
      navigate('/game', { replace: true })
    }

    if (room) {
      navigate(`/room/${room}`, { replace: true })
    }

    if (errorMsg) {
      setGlobalError(errorMsg)
      navigate('/game', { replace: true })
    }
  }, [searchParams, navigate])

  const loadUser = async () => {
    try {
      const data = await profileApi.getMe()
      setUser(data.result || data)
    } catch (err) {
      if (err.message?.includes('not found') || err.message?.includes('User not found')) {
        try {
          await initProfile()
          const data = await profileApi.getMe()
          setUser(data.result || data)
        } catch (initErr) {
          console.warn('Could not initialize profile:', initErr)
        }
      } else {
        console.warn('Could not load user profile:', err)
      }
    }
  }

  const initProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId || payload.id
      const username = payload.username || 'User'
      const email = payload.email || `${username}@example.com`

      const response = await fetch('/api/v1/user-profile/internal/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId, username, email })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.message?.includes('already exists')) return { success: true }
        throw new Error(errorData.message || 'Failed to initialize profile')
      }

      return await response.json()
    } catch (err) {
      if (err.message?.includes('already exists')) return { success: true }
      throw err
    }
  }

  const handleRoomIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setRoomId(value)
    if (roomError) setRoomError('')
  }

  const handleFindRoom = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/room/${roomId.trim()}`)}`)
      return
    }

    if (!roomId.trim()) {
      setRoomError('Vui lòng nhập mã phòng')
      return
    }
    if (roomId.length !== 4) {
      setRoomError('Mã phòng phải có đúng 4 chữ số')
      return
    }
    setRoomError('')
    navigate(`/room/${roomId.trim()}`)
  }

  const handleRoomCreated = (roomCode) => {
    if (!roomCode) return
    setShareRoomCode(roomCode)
    setShareOpen(true)
  }

  const joinLink = useMemo(() => {
    if (!shareRoomCode) return ''
    return `${window.location.origin}/game?room=${shareRoomCode}`
  }, [shareRoomCode])

  const qrUrl = useMemo(() => {
    if (!joinLink) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(joinLink)}`
  }, [joinLink])

  const handleCopyLink = async () => {
    if (!joinLink) return
    try {
      await navigator.clipboard.writeText(joinLink)
      notify.success('Đã sao chép liên kết', 'Chia Sẻ')
    } catch {
      notify.error('Không thể sao chép', 'Lỗi')
    }
  }

  const handleEnterRoom = () => {
    if (!shareRoomCode) return
    navigate(`/room/${shareRoomCode}`)
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: '#050508' }}
    >
      {/* Dark forest background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.2) saturate(0.6)',
        }}
      />

      {/* Gradient overlays */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.85) 0%, transparent 30%, transparent 70%, rgba(5,5,8,0.9) 100%)',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(5,5,8,0.5) 0%, transparent 30%, transparent 70%, rgba(5,5,8,0.5) 100%)',
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Fog */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/effects/fog.png')`,
          backgroundSize: 'cover',
          animation: 'slowDrift 30s ease-in-out infinite',
        }}
      />

      {/* Game HUD */}
      <GameHUD username={user?.username} avatar={user?.avatarUrl} />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Global error */}
        {globalError && (
          <div 
            className="mb-6 px-6 py-4 max-w-md mx-auto"
            style={{
              background: 'linear-gradient(180deg, rgba(139,0,0,0.2) 0%, rgba(80,0,0,0.25) 100%)',
              border: '1px solid rgba(139,0,0,0.5)',
            }}
          >
            <p className="font-fantasy text-sm" style={{ color: '#a05050' }}>
              {globalError}
            </p>
          </div>
        )}

        {/* Decorative top flourish */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-48 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,115,85,0.4) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Main title */}
        <h1
          className="font-medieval text-7xl md:text-8xl lg:text-9xl tracking-wider"
          style={{
            color: '#8b7355',
            textShadow: `
              0 0 30px rgba(139,115,85,0.4),
              0 0 60px rgba(139,115,85,0.2),
              0 4px 8px rgba(0,0,0,0.9),
              2px 2px 0 #3d2914
            `,
            letterSpacing: '0.15em',
          }}
        >
          Ma Sói
        </h1>

        {/* Subtitle */}
        <p
          className="font-fantasy text-lg md:text-xl tracking-[0.4em] uppercase mt-4"
          style={{
            color: '#6b5a4a',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          Cuộc Săn Bắt Đầu
        </p>

        {/* Decorative bottom flourish */}
        <div className="flex justify-center mt-8 mb-10">
          <div 
            className="w-48 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,115,85,0.4) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-5 max-w-md mx-auto">
          {/* Create Room */}
          <MedievalButton
            onClick={() => {
              const token = localStorage.getItem('token')
              if (!token) {
                navigate(`/login?redirect=${encodeURIComponent('/game?create=true')}`)
                return
              }
              setShowCreateRoom(true)
            }}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-3">
              <RuneWolf className="w-5 h-5" />
              Tạo Phòng
            </span>
          </MedievalButton>

          {/* Find Room */}
          <div className="w-full space-y-2">
            <div className="flex gap-3">
              <div className="flex-1">
                <MedievalInput
                  type="text"
                  value={roomId}
                  onChange={handleRoomIdChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleFindRoom()}
                  placeholder="Mã phòng (4 chữ số)"
                  maxLength={4}
                  inputMode="numeric"
                  icon={<RuneDoor className="w-5 h-5" />}
                  error={roomError}
                />
              </div>
              <MedievalButton onClick={handleFindRoom} className="px-6">
                Tìm
              </MedievalButton>
            </div>
          </div>

          {/* View Roles */}
          <MedievalButton
            onClick={() => setShowRolesModal(true)}
            className="w-full"
            variant="secondary"
          >
            <span className="flex items-center justify-center gap-3">
              <RuneScroll className="w-5 h-5" />
              Xem Vai Trò
            </span>
          </MedievalButton>
        </div>

        {/* Share Room Panel */}
        {shareRoomCode && (
          <div className="mt-10 flex justify-center">
            <MedievalPanel className="w-full max-w-lg text-left">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p 
                    className="font-fantasy text-xs uppercase tracking-[0.3em]"
                    style={{ color: '#6a5a4a' }}
                  >
                    Mã Phòng
                  </p>
                  <p 
                    className="font-medieval text-3xl tracking-wider"
                    style={{ color: '#8b7355' }}
                  >
                    {shareRoomCode || '----'}
                  </p>
                </div>
                <MedievalButton
                  onClick={() => setShareOpen((prev) => !prev)}
                  className="px-4"
                  variant="secondary"
                >
                  <span className="flex items-center gap-2">
                    <RuneShare className="w-4 h-4" />
                    {shareOpen ? 'Ẩn' : 'Chia Sẻ'}
                  </span>
                </MedievalButton>
              </div>

              {shareOpen && (
                <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr] items-center">
                  <div className="flex items-center justify-center">
                    {qrUrl && (
                      <img
                        src={qrUrl}
                        alt="Room QR"
                        className="w-40 h-40 p-2"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(139,115,85,0.3)',
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <p 
                      className="font-fantasy text-sm mb-2"
                      style={{ color: '#6a5a4a' }}
                    >
                      Chia sẻ liên kết để tham gia:
                    </p>
                    <a
                      href={joinLink}
                      className="block font-fantasy text-sm break-all underline"
                      style={{ color: '#8b7355' }}
                    >
                      {joinLink}
                    </a>
                    <div className="mt-4 flex gap-3">
                      <MedievalButton onClick={handleCopyLink} className="px-4" variant="secondary">
                        <span className="flex items-center gap-2">
                          <RuneCopy className="w-4 h-4" />
                          Sao Chép
                        </span>
                      </MedievalButton>
                      <MedievalButton onClick={handleEnterRoom} className="px-4">
                        Vào Phòng
                      </MedievalButton>
                    </div>
                  </div>
                </div>
              )}
            </MedievalPanel>
          </div>
        )}
      </div>

      {/* Corner ornaments */}
      <div className="absolute top-6 left-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-16 h-16" position="top-left" />
      </div>
      <div className="absolute top-6 right-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-16 h-16" position="top-right" />
      </div>
      <div className="absolute bottom-6 left-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-16 h-16" position="bottom-left" />
      </div>
      <div className="absolute bottom-6 right-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-16 h-16" position="bottom-right" />
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
        onRoomCreated={handleRoomCreated}
      />
    </div>
  )
}
