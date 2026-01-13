/**
 * Profile Stats - Game statistics display
 * 
 * Dark medieval fantasy theme - Ancient battle chronicles
 * Shows battle record in cursed tome style:
 * - Total Matches
 * - Victories
 * - Defeats
 * - Total Points
 * - Win Rate
 */

import { CornerAccent } from '@/components/ui/AncientIcons'

export default function ProfileStats({ profile }) {
  const winRate = profile?.totalMatch > 0 
    ? Math.round((profile.winMatch / profile.totalMatch) * 100) 
    : 0

  return (
    <div className="mt-6">
      {/* Stats grid - Ancient battle chronicles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<RuneSwordsIcon />}
          label="Tổng Trận"
          value={profile?.totalMatch || 0}
          color="default"
        />
        <StatCard
          icon={<RuneTrophyIcon />}
          label="Chiến Thắng"
          value={profile?.winMatch || 0}
          color="gold"
        />
        <StatCard
          icon={<RuneSkullIcon />}
          label="Thất Bại"
          value={profile?.loseMatch || 0}
          color="red"
        />
        <StatCard
          icon={<RuneStarIcon />}
          label="Tổng Điểm"
          value={profile?.totalPoint || 0}
          color="gold"
        />
      </div>

      {/* Win Rate Bar - Cursed progress meter */}
      <div 
        className="mt-4 p-5 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(10,8,6,0.95) 0%, rgba(5,5,8,0.98) 100%)',
          border: '1px solid rgba(139,115,85,0.3)',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Corner accents */}
        <CornerAccent className="absolute top-1 left-1 w-3 h-3 text-[#8b7355]/40" position="top-left" />
        <CornerAccent className="absolute top-1 right-1 w-3 h-3 text-[#8b7355]/40" position="top-right" />
        <CornerAccent className="absolute bottom-1 left-1 w-3 h-3 text-[#8b7355]/40" position="bottom-left" />
        <CornerAccent className="absolute bottom-1 right-1 w-3 h-3 text-[#8b7355]/40" position="bottom-right" />

        <div className="flex justify-between items-center mb-3">
          <span className="font-fantasy text-[#8b7355]/80 text-sm uppercase tracking-[0.2em]">
            Tỷ Lệ Thắng
          </span>
          <span 
            className="font-medieval text-2xl"
            style={{ 
              color: getWinRateColor(winRate),
              textShadow: `0 0 10px ${getWinRateColor(winRate)}40`
            }}
          >
            {winRate}%
          </span>
        </div>
        
        {/* Progress bar - Ancient meter */}
        <div 
          className="h-5 relative overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(139,115,85,0.2)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
          }}
        >
          {/* Fill with mystical glow */}
          <div 
            className="h-full transition-all duration-1000 ease-out relative"
            style={{ 
              width: `${winRate}%`,
              background: `linear-gradient(90deg, ${getWinRateColor(winRate)}60 0%, ${getWinRateColor(winRate)} 100%)`,
              boxShadow: `0 0 15px ${getWinRateColor(winRate)}40`,
            }}
          >
            {/* Shine effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
              }}
            />
          </div>

          {/* Rune markers */}
          <div className="absolute inset-0 flex">
            {[25, 50, 75].map(mark => (
              <div 
                key={mark}
                className="absolute top-0 bottom-0 w-px"
                style={{ 
                  left: `${mark}%`,
                  background: 'linear-gradient(180deg, rgba(139,115,85,0.4) 0%, rgba(139,115,85,0.1) 100%)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Labels - Ancient ranks */}
        <div className="flex justify-between mt-2">
          <span className="font-fantasy text-xs text-[#6a5a4a]/60 tracking-wider">Tân Binh</span>
          <span className="font-fantasy text-xs text-[#6a5a4a]/60 tracking-wider">Kỳ Cựu</span>
          <span className="font-fantasy text-xs text-[#c9a227]/60 tracking-wider">Huyền Thoại</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual stat card - Ancient stone tablet style
 */
function StatCard({ icon, label, value, color = 'default' }) {
  const colorStyles = {
    default: {
      border: 'rgba(139,115,85,0.3)',
      iconColor: 'text-[#8b7355]/70',
      valueColor: 'text-[#d4c4a8]',
      glowColor: 'rgba(139,115,85,0.1)',
    },
    gold: {
      border: 'rgba(201,162,39,0.4)',
      iconColor: 'text-[#c9a227]',
      valueColor: 'text-[#c9a227]',
      glowColor: 'rgba(201,162,39,0.15)',
    },
    red: {
      border: 'rgba(139,0,0,0.4)',
      iconColor: 'text-[#8b0000]/80',
      valueColor: 'text-[#d4c4a8]',
      glowColor: 'rgba(139,0,0,0.1)',
    },
  }

  const style = colorStyles[color]

  return (
    <div 
      className="relative p-4 text-center group hover:scale-105 transition-all duration-500"
      style={{
        background: 'linear-gradient(180deg, rgba(10,8,6,0.95) 0%, rgba(5,5,8,0.98) 100%)',
        border: `1px solid ${style.border}`,
        boxShadow: `inset 0 0 20px rgba(0,0,0,0.4), 0 4px 15px rgba(0,0,0,0.4), 0 0 20px ${style.glowColor}`,
      }}
    >
      {/* Icon */}
      <div className={`flex justify-center mb-3 ${style.iconColor}`}>
        {icon}
      </div>

      {/* Value */}
      <p 
        className="font-medieval text-3xl"
        style={{ 
          color: style.valueColor === 'text-[#c9a227]' ? '#c9a227' : '#d4c4a8',
          textShadow: color === 'gold' ? '0 0 10px rgba(201,162,39,0.3)' : 'none'
        }}
      >
        {formatNumber(value)}
      </p>

      {/* Label */}
      <p className="font-fantasy text-xs text-[#6a5a4a] uppercase tracking-[0.15em] mt-2">
        {label}
      </p>

      {/* Corner accents */}
      <CornerAccent className="absolute top-1 left-1 w-3 h-3 text-[#8b7355]/30" position="top-left" />
      <CornerAccent className="absolute top-1 right-1 w-3 h-3 text-[#8b7355]/30" position="top-right" />
      <CornerAccent className="absolute bottom-1 left-1 w-3 h-3 text-[#8b7355]/30" position="bottom-left" />
      <CornerAccent className="absolute bottom-1 right-1 w-3 h-3 text-[#8b7355]/30" position="bottom-right" />
    </div>
  )
}

// Utilities
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function getWinRateColor(rate) {
  if (rate >= 70) return '#c9a227' // Gold - Legend
  if (rate >= 50) return '#6b8e6b' // Muted green - Good
  if (rate >= 30) return '#a89060' // Amber - Average
  return '#8b4444' // Muted red - Needs improvement
}

// Ancient Rune Icons - Hand-crafted mystical symbols
function RuneSwordsIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Crossed swords with runic styling */}
      <path d="M6 6 L26 26 M6 26 L26 6" strokeWidth="2" />
      {/* Sword hilts */}
      <path d="M4 4 L8 8 M4 8 L8 4" />
      <path d="M24 4 L28 8 M24 8 L28 4" />
      <path d="M4 24 L8 28 M4 28 L8 24" />
      <path d="M24 24 L28 28 M24 28 L28 24" />
      {/* Center rune */}
      <circle cx="16" cy="16" r="3" strokeDasharray="2 1" />
    </svg>
  )
}

function RuneTrophyIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Chalice/trophy shape */}
      <path d="M10 4 L22 4 L20 16 Q16 20 12 16 L10 4 Z" />
      {/* Handles */}
      <path d="M10 6 Q4 8 6 14 Q8 16 10 14" />
      <path d="M22 6 Q28 8 26 14 Q24 16 22 14" />
      {/* Base */}
      <path d="M12 20 L12 24 L8 28 L24 28 L20 24 L20 20" />
      {/* Mystical symbol inside */}
      <circle cx="16" cy="10" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function RuneSkullIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Skull shape */}
      <path d="M16 4 Q6 6 6 16 L6 20 L10 20 L10 26 L12 26 L12 20 L20 20 L20 26 L22 26 L22 20 L26 20 L26 16 Q26 6 16 4 Z" />
      {/* Eye sockets */}
      <circle cx="11" cy="13" r="2.5" />
      <circle cx="21" cy="13" r="2.5" />
      {/* Nose */}
      <path d="M16 15 L14 18 L18 18 Z" fill="currentColor" opacity="0.3" />
      {/* Teeth marks */}
      <path d="M12 22 L12 24 M16 22 L16 24 M20 22 L20 24" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function RuneStarIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Five-pointed star with runic styling */}
      <path d="M16 2 L19 12 L30 12 L21 18 L24 28 L16 22 L8 28 L11 18 L2 12 L13 12 Z" />
      {/* Inner circle */}
      <circle cx="16" cy="15" r="4" strokeDasharray="2 1" />
      {/* Center dot */}
      <circle cx="16" cy="15" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  )
}
