/**
 * Post-login landing page
 * Full-screen immersive entry into the game world
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import GameHUD from '@/components/game/GameHUD'
import { profileApi, roomApi, getCurrentUserId } from '@/api'
import { MedievalButton, MedievalPanel, notify } from '@/components/ui'

export default function GamePage() {
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [roomState, setRoomState] = useState({ status: 'idle', room: null, error: null })
  const [shareOpen, setShareOpen] = useState(false)
  const actionRef = useRef(false)
  const roomCodeParam = searchParams.get('room')
  const isCreate = searchParams.get('create') === 'true'

  useEffect(() => {
    // Load user info for HUD
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const data = await profileApi.getMe()
      setUser(data.result)
    } catch {
      // Silently fail - HUD will show defaults
    } finally {
      setProfileLoaded(true)
    }
  }

  useEffect(() => {
    if (!profileLoaded || actionRef.current) return
    if (!roomCodeParam && !isCreate) return

    actionRef.current = true
    const run = async () => {
      if (isCreate) {
        await handleCreateRoom()
      } else {
        await handleJoinRoom(roomCodeParam)
      }
    }

    run()
  }, [profileLoaded, roomCodeParam, isCreate])

  const getGuestName = () => {
    const stored = localStorage.getItem('guestName')
    if (stored) return stored
    const suffix = Math.floor(1000 + Math.random() * 9000)
    const guestName = `Guest${suffix}`
    localStorage.setItem('guestName', guestName)
    return guestName
  }

  const getDisplayName = () => {
    return user?.displayName || user?.username || getGuestName()
  }

  const handleCreateRoom = async () => {
    setRoomState({ status: 'loading', room: null, error: null })
    try {
      const created = await roomApi.create({
        name: `Room ${Math.floor(1000 + Math.random() * 9000)}`,
      })
      const code = created?.code || created?.room?.code
      if (!code) {
        throw new Error('Room code missing')
      }
      const displayname = getDisplayName()
      const userId = getCurrentUserId()
      const joined = await roomApi.join(code, { displayname, userId })
      setRoomState({ status: 'ready', room: joined?.room || created, error: null })
      notify.success(`Room ${code} is ready`, 'Room')
    } catch (error) {
      const message = error?.message || 'Failed to create room'
      setRoomState({ status: 'error', room: null, error: message })
      notify.error(message, 'Room')
    }
  }

  const handleJoinRoom = async (roomCode) => {
    if (!roomCode) return
    setRoomState({ status: 'loading', room: null, error: null })
    try {
      const displayname = getDisplayName()
      const userId = getCurrentUserId()
      const joined = await roomApi.join(roomCode, { displayname, userId })
      setRoomState({ status: 'ready', room: joined?.room || null, error: null })
      notify.success(`Joined room ${roomCode}`, 'Room')
    } catch (error) {
      const message = error?.message || 'Failed to join room'
      setRoomState({ status: 'error', room: null, error: message })
      notify.error(message, 'Room')
    }
  }

  const joinLink = useMemo(() => {
    if (!roomState.room?.code) return ''
    return `${window.location.origin}/game?room=${roomState.room.code}`
  }, [roomState.room?.code])

  const qrUrl = useMemo(() => {
    if (!joinLink) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(joinLink)}`
  }, [joinLink])

  const handleCopyLink = async () => {
    if (!joinLink) return
    try {
      await navigator.clipboard.writeText(joinLink)
      notify.success('Link copied', 'Share')
    } catch {
      notify.error('Failed to copy link', 'Share')
    }
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

        {(roomCodeParam || isCreate) && (
          <div className="mt-10 flex justify-center">
            <MedievalPanel className="w-full max-w-lg text-left">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-fantasy text-parchment/70 text-xs uppercase tracking-[0.3em]">
                    Room
                  </p>
                  <p className="font-medieval text-2xl text-gold-glow tracking-wide">
                    {roomState.room?.code || '----'}
                  </p>
                </div>
                <MedievalButton
                  onClick={() => setShareOpen((prev) => !prev)}
                  className="px-4"
                >
                  {shareOpen ? 'Hide Share' : 'Share'}
                </MedievalButton>
              </div>

              {roomState.status === 'loading' && (
                <p className="font-fantasy text-parchment/70 text-sm">
                  Setting up your room...
                </p>
              )}

              {roomState.status === 'error' && (
                <p className="font-fantasy text-red-300 text-sm">
                  {roomState.error}
                </p>
              )}

              {roomState.status === 'ready' && shareOpen && (
                <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr] items-center">
                  <div className="flex items-center justify-center">
                    {qrUrl && (
                      <img
                        src={qrUrl}
                        alt="Room QR"
                        className="w-48 h-48 rounded-lg border border-gold/40 bg-black/40 p-2"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-fantasy text-parchment/70 text-sm mb-2">
                      Share this link to join instantly:
                    </p>
                    <a
                      href={joinLink}
                      className="block font-fantasy text-gold/90 text-sm break-all underline"
                    >
                      {joinLink}
                    </a>
                    <div className="mt-3 flex gap-2">
                      <MedievalButton onClick={handleCopyLink} className="px-4">
                        Copy Link
                      </MedievalButton>
                    </div>
                  </div>
                </div>
              )}
            </MedievalPanel>
          </div>
        )}
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
    </div>
  )
}
