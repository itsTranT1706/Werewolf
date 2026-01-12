/**
 * Auth Layout - Dark Ritual Gateway
 * 
 * Immersive dark medieval fantasy background for auth pages.
 * Feels like entering a forbidden sanctuary.
 */

import { Outlet } from 'react-router-dom'
import { MysticBackdrop } from '@/components/ui'
import { CornerAccent } from '@/components/ui/AncientIcons'

export default function AuthLayout() {
  return (
    <MysticBackdrop showMoon>
      {/* Main content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Game title */}
        <div className="mb-10 text-center">
          <h1 className="font-medieval text-6xl md:text-7xl tracking-wider theme-title">
            MA SÓI
          </h1>
          <p className="font-fantasy text-sm tracking-[0.4em] mt-3 uppercase theme-subtitle">
            Ngôi Làng Đang Chờ Đợi
          </p>
          
          {/* Decorative divider */}
          <div className="flex justify-center mt-6">
            <div className="w-48 h-px theme-divider" />
          </div>
        </div>

        {/* Auth form container */}
        <Outlet />

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="font-fantasy text-xs tracking-wider text-[#4a4035]">
            Ác Hội Sói Cổ Đại
          </p>
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
    </MysticBackdrop>
  )
}
