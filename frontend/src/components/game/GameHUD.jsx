/**
 * Game HUD - In-game heads-up display
 * 
 * Positioned overlay with game menu buttons.
 * Feels like an RPG interface, not a web navbar.
 */

import { useNavigate } from 'react-router-dom'

export default function GameHUD({ username, avatar }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top bar - Profile & Settings */}
      <div className="absolute top-4 right-4 flex items-center gap-3 pointer-events-auto">
        <ProfileButton username={username} avatar={avatar} />
      </div>

      {/* Bottom bar - Future: Chat, Inventory, etc. */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
        {/* Placeholder for future HUD elements */}
      </div>

      {/* Left bar - Future: Quest log, Map, etc. */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
        {/* Placeholder for future HUD elements */}
      </div>
    </div>
  )
}

/**
 * Profile button - Character portrait style
 */
function ProfileButton({ username, avatar }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/profile')}
      className="group relative flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
      title="Xem Hồ Sơ"
    >
      {/* Username tag (shows on hover) */}
      <div className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div 
          className="px-3 py-1 whitespace-nowrap font-fantasy text-sm text-parchment"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(20,15,10,0.9) 20%, rgba(20,15,10,0.9) 100%)',
            borderRight: '2px solid rgba(201,162,39,0.5)',
          }}
        >
          {username || 'Lữ Khách'}
        </div>
      </div>

      {/* Avatar frame */}
      <div className="relative">
        {/* Glow effect on hover */}
        <div 
          className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(201,162,39,0.4) 0%, transparent 70%)',
            filter: 'blur(4px)'
          }}
        />

        {/* Frame */}
        <div 
          className="relative w-14 h-14 rounded-full p-0.5"
          style={{
            background: 'linear-gradient(135deg, #c9a227 0%, #6b4c0a 50%, #c9a227 100%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          {/* Inner border */}
          <div className="w-full h-full rounded-full p-0.5 bg-wood-dark">
            {/* Avatar */}
            <div 
              className="w-full h-full rounded-full bg-stone-dark flex items-center justify-center overflow-hidden"
              style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
            >
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <CharacterIcon className="w-7 h-7 text-parchment/50" />
              )}
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-gold/70" />
        <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b border-l border-gold/70" />
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
      className="group relative w-12 h-12 transition-transform hover:scale-110 active:scale-95"
      title={label}
    >
      {/* Button frame */}
      <div 
        className="w-full h-full rounded-lg flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, rgba(60,40,20,0.9) 0%, rgba(30,20,10,0.95) 100%)',
          border: '2px solid #3d2914',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        <div className="text-parchment/70 group-hover:text-gold transition-colors">
          {icon}
        </div>
      </div>

      {/* Badge (for notifications) */}
      {badge && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blood-red flex items-center justify-center">
          <span className="text-xs font-bold text-white">{badge}</span>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="px-2 py-1 bg-night-blue/90 border border-gold/30 text-parchment text-xs whitespace-nowrap font-fantasy">
          {label}
        </div>
      </div>
    </button>
  )
}

// Icons
function CharacterIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )
}
