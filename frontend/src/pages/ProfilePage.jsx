/**
 * Profile Page - Container for Profile Tab
 * 
 * Full-screen fantasy background with ProfileTab component.
 * The ProfileTab handles all profile logic and inline editing.
 */

import { useNavigate } from 'react-router-dom'
import { ProfileTab } from '@/components/profile'
import { BackButton } from '@/components/ui'

export default function ProfilePage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark fantasy background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.25) saturate(0.6)'
        }}
      />
      
      {/* Gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-night-blue/50 via-transparent to-night-blue/70" />
      
      {/* Vignette */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        {/* Back button - Top left */}
        <div className="absolute top-6 left-6 z-20">
          <BackButton to="/game" label="Quay lại Làng" />
        </div>

        {/* Page header */}
        <div className="text-center mb-8 pt-4">
          <h1 
            className="font-medieval text-4xl md:text-5xl tracking-wider"
            style={{
              color: '#c9a227',
              textShadow: '0 0 20px rgba(201,162,39,0.4), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            Hồ Sơ Nhân Vật
          </h1>
          <p className="font-fantasy text-parchment/40 text-sm tracking-[0.3em] uppercase mt-2">
            Huyền Thoại Của Bạn
          </p>
        </div>

        {/* Profile Tab */}
        <ProfileTab onLogout={handleLogout} />
      </div>

      {/* Corner ornaments */}
      <CornerOrnaments />
    </div>
  )
}

/**
 * Corner decorations
 */
function CornerOrnaments() {
  return (
    <>
      <div className="fixed top-4 left-4 w-16 h-16 opacity-20 pointer-events-none z-20">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="fixed top-4 right-4 w-16 h-16 opacity-20 pointer-events-none z-20 transform scale-x-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="fixed bottom-4 left-4 w-16 h-16 opacity-20 pointer-events-none z-20 transform scale-y-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="fixed bottom-4 right-4 w-16 h-16 opacity-20 pointer-events-none z-20 transform scale-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
    </>
  )
}
