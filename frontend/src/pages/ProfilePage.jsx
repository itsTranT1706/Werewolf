/**
 * Profile Page - Ancient Hero's Chronicle
 * 
 * Full-screen dark medieval fantasy profile view.
 * Feels like reading an ancient warrior's legend.
 */

import { useNavigate } from 'react-router-dom'
import { ProfileTab } from '@/components/profile'
import { BackButton } from '@/components/ui'
import { CornerAccent } from '@/components/ui/AncientIcons'

export default function ProfilePage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#050508' }}
    >
      {/* Dark fantasy background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.15) saturate(0.5)',
        }}
      />
      
      {/* Gradient overlays */}
      <div 
        className="fixed inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.85) 0%, transparent 30%, transparent 70%, rgba(5,5,8,0.9) 100%)',
        }}
      />
      
      {/* Vignette */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <BackButton to="/game" label="Quay Lại Làng" />
        </div>

        {/* Page header */}
        <div className="text-center mb-10 pt-4">
          <h1 
            className="font-medieval text-4xl md:text-5xl tracking-wider"
            style={{
              color: '#8b7355',
              textShadow: '0 0 30px rgba(139,115,85,0.3), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            Hồ Sơ Nhân Vật
          </h1>
          <p 
            className="font-fantasy text-sm tracking-[0.3em] uppercase mt-3"
            style={{ color: '#5a4a3a' }}
          >
            Huyền Thoại Của Bạn
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

        {/* Profile Tab */}
        <ProfileTab onLogout={handleLogout} />
      </div>

      {/* Corner ornaments */}
      <div className="fixed top-6 left-6 text-[#8b7355] opacity-15 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="top-left" />
      </div>
      <div className="fixed top-6 right-6 text-[#8b7355] opacity-15 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="top-right" />
      </div>
      <div className="fixed bottom-6 left-6 text-[#8b7355] opacity-15 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="bottom-left" />
      </div>
      <div className="fixed bottom-6 right-6 text-[#8b7355] opacity-15 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="bottom-right" />
      </div>
    </div>
  )
}
