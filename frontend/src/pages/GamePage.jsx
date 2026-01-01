/**
 * Post-login landing page
 * Full-screen immersive entry into the game world
 */

import { useState, useEffect } from 'react'
import GameHUD from '@/components/game/GameHUD'
import { profileApi, authApi } from '@/api'

export default function GamePage() {
  const [user, setUser] = useState(null)

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
      <GameHUD username={user?.username} avatar={user?.avatar} />

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
