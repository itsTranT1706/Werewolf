/**
 * Post-login landing page
 * Full-screen immersive entry into the game world
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GameHUD from '@/components/game/GameHUD'
import RolesModal from '@/components/game/RolesModal'
import CreateRoomModal from '@/components/game/CreateRoomModal'
import { profileApi, authApi } from '@/api'

export default function GamePage() {
  const [user, setUser] = useState(null)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(false)

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

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => setShowCreateRoom(true)}
            className="px-8 py-4 bg-yellow-600/30 border-2 border-yellow-400 rounded-lg text-yellow-300 font-fantasy hover:bg-yellow-600/50 transition-all shadow-lg hover:shadow-yellow-400/50 text-lg font-semibold"
            style={{
              textShadow: '0 0 10px rgba(255, 255, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)'
            }}
          >
            🏰 Tạo Phòng
          </button>

          <Link
            to="/room/test-room-123"
            className="px-8 py-4 bg-blue-600/30 border-2 border-blue-400 rounded-lg text-blue-300 font-fantasy hover:bg-blue-600/50 transition-all shadow-lg hover:shadow-blue-400/50 text-lg font-semibold"
            style={{
              textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}
          >
            🎮 Vào Phòng Test
          </Link>

          <button
            onClick={() => setShowRolesModal(true)}
            className="px-8 py-4 bg-purple-600/30 border-2 border-purple-400 rounded-lg text-purple-300 font-fantasy hover:bg-purple-600/50 transition-all shadow-lg hover:shadow-purple-400/50 text-lg font-semibold"
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
