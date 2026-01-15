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
import { profileApi } from '@/api'
import { MedievalButton, MedievalPanel, MedievalInput, Divider, notify, MysticBackdrop } from '@/components/ui'
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
      setRoomError('Mã phòng phải có 4 chữ số')
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
      notify.success('Sao chép liên kết', 'Chia sẻ')
    } catch {
      notify.error('Không thể sao chép', 'Lỗi')
    }
  }

  const handleEnterRoom = () => {
    if (!shareRoomCode) return
    navigate(`/room/${shareRoomCode}`)
  }

  return (
    <MysticBackdrop className="flex items-center justify-center" showHorizontalOverlay>
      <GameHUD username={user?.username} avatar={user?.avatarUrl} />

      <div className="relative z-10 w-full px-4 flex flex-col items-center">
        {globalError && (
          <div
            className="mb-6 px-6 py-4 max-w-md mx-auto"
            style={{
              background: 'linear-gradient(180deg, rgba(139,0,0,0.2) 0%, rgba(80,0,0,0.25) 100%)',
              border: '1px solid rgba(139,0,0,0.5)',
            }}
          >
            <p className="font-fantasy text-sm" style={{ color: '#f2c3c3' }}>
              {globalError}
            </p>
          </div>
        )}

        <div className="w-full max-w-5xl flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="w-full max-w-md">
            <MedievalPanel className="w-full home-panel-frame" variant="altar">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div
                  className="w-20 h-20 flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(139,115,85,0.15) 0%, transparent 70%)',
                  }}
                >
                  <RuneWolf className="w-16 h-16 text-[#8b7355] opacity-70" />
                </div>
              </div>

              <h1 className="font-medieval text-4xl tracking-wider home-panel-header">
                Ma Sói
              </h1>
              <p className="font-fantasy text-sm mt-2 tracking-[0.22em] uppercase home-panel-subtitle">
                Sự thật bắt đầu thì thầm trong bóng tối
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
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

              <Divider text="hoặc" className="my-2" />

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

              <Divider text="hoặc" className="my-2" />

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
            </MedievalPanel>
          </div>

        {shareRoomCode && (
          <div className="w-full max-w-2xl">
            <MedievalPanel className="w-full text-left">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-fantasy text-xs uppercase tracking-[0.24em] text-[#f1d37c]">
                    Mã phòng
                  </p>
                  <p className="font-medieval text-4xl tracking-[0.22em] text-[#fff2d9]">
                    {shareRoomCode || '----'}
                  </p>
                </div>
              </div>

              {shareOpen && (
                <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr] items-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className="absolute -inset-2 rounded-xl"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(201,162,39,0.2) 0%, rgba(0,0,0,0) 70%)',
                      }}
                    />
                    <div
                      className="relative p-3 rounded-xl"
                      style={{
                        background: 'linear-gradient(180deg, rgba(10,8,8,0.9), rgba(5,4,4,0.9))',
                        border: '1px solid rgba(201,162,39,0.35)',
                        boxShadow: '0 0 20px rgba(0,0,0,0.6)',
                      }}
                    >
                      {qrUrl && (
                        <img
                          src={qrUrl}
                          alt="Room QR"
                          className="w-40 h-40"
                          style={{ background: '#0b0a0a', border: '1px solid rgba(139,115,85,0.4)' }}
                        />
                      )}
                      <p className="mt-3 text-xs text-center font-fantasy tracking-[0.18em] uppercase text-[#c9a227]">
                        Scan to join
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-fantasy text-sm mb-2 text-[#f1d37c]">
                        Chia sẻ liên kết:
                      </p>
                      <div
                        className="px-4 py-3 rounded-lg"
                        style={{
                          background: 'rgba(0,0,0,0.35)',
                          border: '1px solid rgba(139,115,85,0.25)',
                        }}
                      >
                        <a
                          href={joinLink}
                          className="block font-fantasy text-sm break-all underline theme-link"
                        >
                          {joinLink}
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <MedievalButton onClick={handleCopyLink} className="px-4" variant="secondary">
                        <span className="flex items-center gap-2">
                          <RuneCopy className="w-4 h-4" />
                          Sao chép
                        </span>
                      </MedievalButton>
                      <MedievalButton onClick={handleEnterRoom} className="px-4">
                        Vào phòng
                      </MedievalButton>
                    </div>
                  </div>
                </div>
              )}
            </MedievalPanel>
          </div>
        )}

        </div>
      </div>

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

      <RolesModal
        isOpen={showRolesModal}
        onClose={() => setShowRolesModal(false)}
      />

      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onRoomCreated={handleRoomCreated}
      />
    </MysticBackdrop>
  )
}
