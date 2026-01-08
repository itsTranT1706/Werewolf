/**
 * Game HUD - Ancient Ritual Interface
 * 
 * Positioned overlay with mystical game controls.
 * Feels like an arcane interface, not a web navbar.
 */

import { useNavigate } from 'react-router-dom'
import { CharacterIcon, CornerAccent } from '@/components/ui/AncientIcons'

export default function GameHUD({ username, avatar }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top bar - Profile */}
      <div className="absolute top-4 right-4 flex items-center gap-3 pointer-events-auto">
        <ProfileButton username={username} avatar={avatar} />
      </div>
    </div>
  )
}

/**
 * Profile button - Ancient portrait frame style
 */
function ProfileButton({ username, avatar }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/profile')}
      className="group relative flex items-center gap-3 transition-transform duration-300 hover:scale-105 active:scale-95"
      title="Xem Hồ Sơ"
    >
      {/* Username tag (shows on hover) */}
      <div className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div 
          className="px-4 py-2 whitespace-nowrap font-fantasy text-sm"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(15,12,10,0.95) 20%, rgba(15,12,10,0.95) 100%)',
            borderRight: '2px solid rgba(139,115,85,0.4)',
            color: '#a89070',
          }}
        >
          {username || 'Lữ Khách'}
        </div>
      </div>

      {/* Avatar frame */}
      <div className="relative">
        {/* Glow effect on hover */}
        <div 
          className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(139,115,85,0.3) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />

        {/* Outer frame */}
        <div 
          className="relative w-14 h-14 p-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(139,115,85,0.8) 0%, rgba(60,40,20,0.9) 50%, rgba(139,115,85,0.8) 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Inner border */}
          <div 
            className="w-full h-full p-0.5"
            style={{ background: 'rgba(20,16,12,0.95)' }}
          >
            {/* Avatar container */}
            <div 
              className="w-full h-full flex items-center justify-center overflow-hidden"
              style={{ 
                background: 'rgba(10,8,6,0.9)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <CharacterIcon className="w-7 h-7 text-[#6a5a4a]" />
              )}
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 text-[#8b7355] opacity-50 group-hover:opacity-80 transition-opacity">
          <CornerAccent className="w-3 h-3" position="top-left" />
        </div>
        <div className="absolute -top-1 -right-1 text-[#8b7355] opacity-50 group-hover:opacity-80 transition-opacity">
          <CornerAccent className="w-3 h-3" position="top-right" />
        </div>
        <div className="absolute -bottom-1 -left-1 text-[#8b7355] opacity-50 group-hover:opacity-80 transition-opacity">
          <CornerAccent className="w-3 h-3" position="bottom-left" />
        </div>
        <div className="absolute -bottom-1 -right-1 text-[#8b7355] opacity-50 group-hover:opacity-80 transition-opacity">
          <CornerAccent className="w-3 h-3" position="bottom-right" />
        </div>
      </div>
    </button>
  )
}

/**
 * Reusable HUD icon button for future expansion
 */
export function HUDButton({ icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-12 h-12 transition-transform duration-300 hover:scale-110 active:scale-95"
      title={label}
    >
      {/* Button frame */}
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, rgba(30,25,20,0.95) 0%, rgba(20,16,12,0.98) 100%)',
          border: '2px solid rgba(60,50,40,0.5)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="text-[#6a5a4a] group-hover:text-[#8b7355] transition-colors duration-300">
          {icon}
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div 
          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, rgba(139,0,0,0.9) 0%, rgba(100,0,0,0.95) 100%)',
            border: '1px solid rgba(180,0,0,0.5)',
          }}
        >
          <span className="text-xs font-bold text-white">{badge}</span>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div 
          className="px-3 py-1.5 whitespace-nowrap font-fantasy text-xs"
          style={{
            background: 'rgba(15,12,10,0.95)',
            border: '1px solid rgba(139,115,85,0.3)',
            color: '#a89070',
          }}
        >
          {label}
        </div>
      </div>
    </button>
  )
}
