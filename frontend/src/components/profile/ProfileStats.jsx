/**
 * Profile Stats - Game statistics display
 * 
 * Shows battle record in fantasy RPG style:
 * - Total Matches
 * - Victories
 * - Defeats
 * - Total Points
 * - Win Rate
 */

export default function ProfileStats({ profile }) {
  const winRate = profile?.totalMatch > 0 
    ? Math.round((profile.winMatch / profile.totalMatch) * 100) 
    : 0

  return (
    <div className="mt-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<SwordsIcon />}
          label="Tổng Trận"
          value={profile?.totalMatch || 0}
          color="default"
        />
        <StatCard
          icon={<TrophyIcon />}
          label="Chiến Thắng"
          value={profile?.winMatch || 0}
          color="gold"
        />
        <StatCard
          icon={<SkullIcon />}
          label="Thất Bại"
          value={profile?.loseMatch || 0}
          color="red"
        />
        <StatCard
          icon={<StarIcon />}
          label="Tổng Điểm"
          value={profile?.totalPoint || 0}
          color="gold"
        />
      </div>

      {/* Win Rate Bar */}
      <div 
        className="mt-4 p-4 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, rgba(30,22,15,0.9) 0%, rgba(20,15,10,0.95) 100%)',
          border: '2px solid rgba(201,162,39,0.2)',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-fantasy text-parchment/70 text-sm uppercase tracking-wider">
            Tỷ Lệ Thắng
          </span>
          <span 
            className="font-medieval text-2xl"
            style={{ color: getWinRateColor(winRate) }}
          >
            {winRate}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div 
          className="h-4 rounded-sm overflow-hidden relative"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(100,100,100,0.3)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {/* Fill */}
          <div 
            className="h-full transition-all duration-700 ease-out relative"
            style={{ 
              width: `${winRate}%`,
              background: `linear-gradient(90deg, ${getWinRateColor(winRate)}88 0%, ${getWinRateColor(winRate)} 100%)`,
            }}
          >
            {/* Shine effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
              }}
            />
          </div>

          {/* Markers */}
          <div className="absolute inset-0 flex">
            {[25, 50, 75].map(mark => (
              <div 
                key={mark}
                className="absolute top-0 bottom-0 w-px bg-parchment/20"
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-1">
          <span className="font-fantasy text-xs text-parchment/40">Tân Binh</span>
          <span className="font-fantasy text-xs text-parchment/40">Kỳ Cựu</span>
          <span className="font-fantasy text-xs text-parchment/40">Huyền Thoại</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual stat card
 */
function StatCard({ icon, label, value, color = 'default' }) {
  const colorStyles = {
    default: {
      border: 'rgba(201,162,39,0.2)',
      iconColor: 'text-parchment/60',
      valueColor: 'text-parchment',
    },
    gold: {
      border: 'rgba(201,162,39,0.4)',
      iconColor: 'text-gold',
      valueColor: 'text-gold',
    },
    red: {
      border: 'rgba(139,0,0,0.3)',
      iconColor: 'text-blood-red/70',
      valueColor: 'text-parchment',
    },
  }

  const style = colorStyles[color]

  return (
    <div 
      className="relative p-4 rounded-lg text-center group hover:scale-105 transition-transform"
      style={{
        background: 'linear-gradient(180deg, rgba(30,22,15,0.9) 0%, rgba(20,15,10,0.95) 100%)',
        border: `2px solid ${style.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Icon */}
      <div className={`flex justify-center mb-2 ${style.iconColor}`}>
        {icon}
      </div>

      {/* Value */}
      <p className={`font-medieval text-3xl ${style.valueColor}`}>
        {formatNumber(value)}
      </p>

      {/* Label */}
      <p className="font-fantasy text-xs text-parchment/50 uppercase tracking-wider mt-1">
        {label}
      </p>

      {/* Corner accents */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-gold/30" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-gold/30" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-gold/30" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-gold/30" />
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
  if (rate >= 50) return '#4ade80' // Green - Good
  if (rate >= 30) return '#facc15' // Yellow - Average
  return '#ef4444' // Red - Needs improvement
}

// Icons
function SwordsIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.92 5H5L14 14l-1.5 1.5 1.5 1.5 1.5-1.5L17 17l-3 3-1.5-1.5L11 20l-3-3 1.5-1.5L8 14l1.5-1.5L8 11l3-3-1.5-1.5L11 5l3 3-1.5 1.5L14 11l-1.5 1.5L14 14l5-5V5h-1.92l-5 5L6.92 5z"/>
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
  )
}

function SkullIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12v8h4v-2h2v2h8v-2h2v2h4v-8c0-5.52-4.48-10-10-10zM8 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}
