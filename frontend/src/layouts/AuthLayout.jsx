/**
 * Auth Layout - Dark Ritual Gateway
 * 
 * Immersive dark medieval fantasy background for auth pages.
 * Feels like entering a forbidden sanctuary.
 */

import { Outlet } from 'react-router-dom'
import { CornerAccent } from '@/components/ui/AncientIcons'

export default function AuthLayout() {
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#050508' }}
    >
      {/* Dark forest background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.15) saturate(0.5)',
        }}
      />
      
      {/* Gradient overlays for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.9) 0%, transparent 30%, transparent 70%, rgba(5,5,8,0.95) 100%)',
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Ambient fog layers */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/effects/fog.png')`,
          backgroundSize: '200% 200%',
          animation: 'slowDrift 40s ease-in-out infinite',
        }}
      />

      {/* Dim moonlight glow */}
      <div 
        className="absolute top-10 right-1/4 w-32 h-32 rounded-full opacity-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,200,220,0.8) 0%, transparent 70%)',
          filter: 'blur(20px)',
          animation: 'moonPulse 8s ease-in-out infinite',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Game title */}
        <div className="mb-10 text-center">
          <h1 
            className="font-medieval text-6xl md:text-7xl tracking-wider"
            style={{
              color: '#8b7355',
              textShadow: `
                0 0 30px rgba(139,115,85,0.3),
                0 0 60px rgba(139,115,85,0.15),
                0 4px 8px rgba(0,0,0,0.9),
                2px 2px 0 #3d2914
              `,
              letterSpacing: '0.15em',
            }}
          >
            MA SÓI
          </h1>
          <p 
            className="font-fantasy text-sm tracking-[0.4em] mt-3 uppercase"
            style={{ 
              color: '#6b5a4a',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            Ngôi Làng Đang Chờ Đợi
          </p>
          
          {/* Decorative divider */}
          <div className="flex justify-center mt-6">
            <div 
              className="w-48 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(139,115,85,0.4) 50%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {/* Auth form container */}
        <Outlet />

        {/* Footer */}
        <div className="mt-10 text-center">
          <p 
            className="font-fantasy text-xs tracking-wider"
            style={{ color: '#4a4035' }}
          >
            © Hội Sói Cổ Đại
          </p>
        </div>
      </div>

      {/* Corner ornaments */}
      <div className="absolute top-6 left-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="top-left" />
      </div>
      <div className="absolute top-6 right-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="top-right" />
      </div>
      <div className="absolute bottom-6 left-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="bottom-left" />
      </div>
      <div className="absolute bottom-6 right-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="bottom-right" />
      </div>
    </div>
  )
}
