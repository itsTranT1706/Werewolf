/**
 * Profile Page - Ancient Hero's Chronicle
 * 
 * Full-screen dark medieval fantasy profile view.
 * Feels like reading an ancient warrior's legend.
 */

import { useNavigate } from 'react-router-dom'
import { ProfileTab } from '@/components/profile'
import { BackButton, MysticBackdrop } from '@/components/ui'
import { CornerAccent } from '@/components/ui/AncientIcons'

export default function ProfilePage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <MysticBackdrop>
      {/* Main content */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <BackButton to="/game" label="Quay Lại Làng" />
        </div>

        {/* Page header */}
        <div className="text-center mb-10 pt-4">
          <h1 className="font-medieval text-4xl md:text-5xl tracking-wider theme-title">
            Hồ Sơ Nhân Vật
          </h1>
          <p className="font-fantasy text-sm tracking-[0.3em] uppercase mt-3 text-[#5a4a3a]">
            Huyền Thoại Của Bạn
          </p>
          
          {/* Decorative divider */}
          <div className="flex justify-center mt-6">
            <div className="w-48 h-px theme-divider" />
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
    </MysticBackdrop>
  )
}
