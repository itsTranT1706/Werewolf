/**
 * Rank Panel - Right sidebar displaying player rank
 * 
 * Dark medieval fantasy theme - Cursed rank emblem
 * Ancient stone tablet style with:
 * - Dark weathered texture background
 * - Mystical rank emblem with glow
 * - Rank tier and LP display
 */

import { CornerAccent } from '@/components/ui/AncientIcons'

export default function RankPanel({ rank }) {
  // Default rank data if not provided
  const rankData = rank || {
    mode: 'Xếp Hạng Đơn/Đôi',
    tier: 'Chưa Xếp Hạng',
    division: '',
    lp: 0,
    wins: 0,
    losses: 0,
  }

  const tierConfig = getTierConfig(rankData.tier)

  return (
    <div className="relative w-full">
      {/* Dark stone tablet background */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(10,8,6,0.98) 0%, 
              rgba(5,5,8,0.99) 50%,
              rgba(8,6,4,0.98) 100%
            )
          `,
          border: '1px solid rgba(139,115,85,0.3)',
          boxShadow: `
            0 4px 30px rgba(0,0,0,0.6),
            inset 0 0 60px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(139,115,85,0.1)
          `,
        }}
      >
        {/* Weathered texture overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Mystical glow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at center, ${tierConfig.glowColor}15 0%, transparent 60%)
            `,
          }}
        />

        {/* Corner accents */}
        <CornerAccent className="absolute top-3 left-3 w-5 h-5 text-[#8b7355]/40" position="top-left" />
        <CornerAccent className="absolute top-3 right-3 w-5 h-5 text-[#8b7355]/40" position="top-right" />
        <CornerAccent className="absolute bottom-3 left-3 w-5 h-5 text-[#8b7355]/40" position="bottom-left" />
        <CornerAccent className="absolute bottom-3 right-3 w-5 h-5 text-[#8b7355]/40" position="bottom-right" />

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h3 
              className="font-medieval text-2xl tracking-wider"
              style={{
                color: '#c9a227',
                textShadow: '0 0 20px rgba(201,162,39,0.3), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              Xếp Hạng
            </h3>
            {/* Decorative rune line */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#8b7355]/40" />
              <RuneDiamondIcon className="w-3 h-3 text-[#8b7355]/60" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#8b7355]/40" />
            </div>
          </div>

          {/* Rank Emblem */}
          <div className="flex justify-center mb-6">
            <RankEmblem tier={rankData.tier} config={tierConfig} />
          </div>

          {/* Rank Information */}
          <div className="text-center space-y-2">
            {/* Mode */}
            <p 
              className="font-fantasy text-xs uppercase tracking-[0.2em]"
              style={{ color: '#6a5a4a' }}
            >
              {rankData.mode}
            </p>

            {/* Tier */}
            <p 
              className="font-medieval text-xl tracking-wide"
              style={{ 
                color: tierConfig.textColor,
                textShadow: `0 0 15px ${tierConfig.glowColor}`,
              }}
            >
              {rankData.tier} {rankData.division}
            </p>

            {/* LP */}
            {rankData.tier !== 'Unranked' && (
              <div className="flex items-center justify-center gap-1">
                <span 
                  className="font-fantasy text-lg font-semibold"
                  style={{ color: '#d4c4a8' }}
                >
                  {rankData.lp}
                </span>
                <span 
                  className="font-fantasy text-sm"
                  style={{ color: '#6a5a4a' }}
                >
                  LP
                </span>
                <RuneArrowUpIcon className="w-3 h-3 text-[#6b8e6b] ml-1" />
              </div>
            )}
          </div>

          {/* Win/Loss Stats */}
          {rankData.tier !== 'Unranked' && (rankData.wins > 0 || rankData.losses > 0) && (
            <>
              <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#8b7355]/30 to-transparent" />
              
              <div className="flex justify-center gap-6 text-center">
                <div>
                  <p className="font-medieval text-lg" style={{ color: '#6b8e6b' }}>
                    {rankData.wins}
                  </p>
                  <p className="font-fantasy text-xs uppercase tracking-wider" style={{ color: '#6a5a4a' }}>
                    Thắng
                  </p>
                </div>
                <div className="w-px bg-[#8b7355]/20" />
                <div>
                  <p className="font-medieval text-lg" style={{ color: '#8b4444' }}>
                    {rankData.losses}
                  </p>
                  <p className="font-fantasy text-xs uppercase tracking-wider" style={{ color: '#6a5a4a' }}>
                    Thua
                  </p>
                </div>
                <div className="w-px bg-[#8b7355]/20" />
                <div>
                  <p className="font-medieval text-lg" style={{ color: '#d4c4a8' }}>
                    {calculateWinRate(rankData.wins, rankData.losses)}%
                  </p>
                  <p className="font-fantasy text-xs uppercase tracking-wider" style={{ color: '#6a5a4a' }}>
                    Tỉ Lệ Thắng
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Medieval rune pattern decoration */}
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none"
          >
            <MedievalRunePattern />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Rank Emblem - Mystical badge with tier-based styling
 */
function RankEmblem({ tier, config }) {
  return (
    <div className="relative">
      {/* Outer mystical glow */}
      <div 
        className="absolute -inset-6 rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          filter: 'blur(12px)',
        }}
      />

      {/* Emblem container - Dark stone style */}
      <div 
        className="relative w-28 h-28 rounded-full flex items-center justify-center"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              ${config.highlightColor}40 0%, 
              ${config.primaryColor} 40%, 
              ${config.shadowColor} 100%
            )
          `,
          boxShadow: `
            0 4px 25px ${config.glowColor},
            inset 0 2px 4px rgba(255,255,255,0.15),
            inset 0 -2px 4px rgba(0,0,0,0.4)
          `,
          border: `2px solid ${config.borderColor}`,
        }}
      >
        {/* Inner ring - Runic circle */}
        <div 
          className="absolute inset-3 rounded-full"
          style={{
            border: `1px solid ${config.innerBorderColor}`,
            boxShadow: `inset 0 0 25px ${config.innerGlowColor}`,
          }}
        />

        {/* Tier icon */}
        <div className="relative z-10">
          <TierIcon tier={tier} config={config} />
        </div>

        {/* Mystical shine effect */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Decorative rune marks */}
      <div 
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${config.gemHighlight}, ${config.gemColor})`,
          boxShadow: `0 0 8px ${config.gemColor}`,
        }}
      />
      <div 
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${config.gemHighlight}, ${config.gemColor})`,
          boxShadow: `0 0 8px ${config.gemColor}`,
        }}
      />
    </div>
  )
}

/**
 * Tier-specific icon
 */
function TierIcon({ tier, config }) {
  const iconClass = "w-12 h-12"
  
  switch (tier.toLowerCase()) {
    case 'iron':
      return <IronIcon className={iconClass} color={config.iconColor} />
    case 'bronze':
      return <BronzeIcon className={iconClass} color={config.iconColor} />
    case 'silver':
      return <SilverIcon className={iconClass} color={config.iconColor} />
    case 'gold':
      return <GoldIcon className={iconClass} color={config.iconColor} />
    case 'platinum':
      return <PlatinumIcon className={iconClass} color={config.iconColor} />
    case 'diamond':
      return <DiamondRankIcon className={iconClass} color={config.iconColor} />
    case 'master':
      return <MasterIcon className={iconClass} color={config.iconColor} />
    case 'grandmaster':
      return <GrandmasterIcon className={iconClass} color={config.iconColor} />
    case 'challenger':
      return <ChallengerIcon className={iconClass} color={config.iconColor} />
    default:
      return <UnrankedIcon className={iconClass} color={config.iconColor} />
  }
}

/**
 * Medieval rune decorative pattern
 */
function MedievalRunePattern() {
  return (
    <svg width="120" height="30" viewBox="0 0 120 30" fill="none" stroke="#8b7355">
      <path
        d="M0 15 Q15 5 30 15 T60 15 T90 15 T120 15"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="60" cy="15" r="3" fill="#8b7355" opacity="0.5" />
      <circle cx="30" cy="15" r="2" fill="#8b7355" opacity="0.3" />
      <circle cx="90" cy="15" r="2" fill="#8b7355" opacity="0.3" />
      {/* Rune marks */}
      <path d="M60 10 L60 20" strokeWidth="1" opacity="0.4" />
      <path d="M55 15 L65 15" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

// Ancient Rune Icons
function RuneDiamondIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  )
}

function RuneArrowUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19 L12 5 M7 10 L12 5 L17 10" />
    </svg>
  )
}

// Utility functions
function getTierConfig(tier) {
  const configs = {
    iron: {
      primaryColor: '#5c5c5c',
      highlightColor: '#8a8a8a',
      shadowColor: '#3a3a3a',
      borderColor: '#6b6b6b',
      innerBorderColor: 'rgba(255,255,255,0.2)',
      glowColor: 'rgba(100,100,100,0.3)',
      innerGlowColor: 'rgba(100,100,100,0.2)',
      textColor: '#5c5c5c',
      iconColor: '#d4d4d4',
      gemColor: '#6b6b6b',
      gemHighlight: '#a0a0a0',
    },
    bronze: {
      primaryColor: '#8b5a2b',
      highlightColor: '#cd853f',
      shadowColor: '#5c3d1e',
      borderColor: '#a0522d',
      innerBorderColor: 'rgba(255,200,150,0.3)',
      glowColor: 'rgba(205,133,63,0.4)',
      innerGlowColor: 'rgba(205,133,63,0.2)',
      textColor: '#8b5a2b',
      iconColor: '#ffd4a8',
      gemColor: '#cd853f',
      gemHighlight: '#ffe4c4',
    },
    silver: {
      primaryColor: '#8a9a9a',
      highlightColor: '#c0c0c0',
      shadowColor: '#5a6a6a',
      borderColor: '#a8b8b8',
      innerBorderColor: 'rgba(255,255,255,0.4)',
      glowColor: 'rgba(192,192,192,0.4)',
      innerGlowColor: 'rgba(255,255,255,0.2)',
      textColor: '#6a7a7a',
      iconColor: '#f0f0f0',
      gemColor: '#c0c0c0',
      gemHighlight: '#ffffff',
    },
    gold: {
      primaryColor: '#b8860b',
      highlightColor: '#ffd700',
      shadowColor: '#8b6914',
      borderColor: '#daa520',
      innerBorderColor: 'rgba(255,215,0,0.4)',
      glowColor: 'rgba(255,215,0,0.5)',
      innerGlowColor: 'rgba(255,215,0,0.3)',
      textColor: '#b8860b',
      iconColor: '#fff8dc',
      gemColor: '#ffd700',
      gemHighlight: '#fffacd',
    },
    platinum: {
      primaryColor: '#3d8b8b',
      highlightColor: '#5fd4d4',
      shadowColor: '#2a6060',
      borderColor: '#4aa8a8',
      innerBorderColor: 'rgba(95,212,212,0.4)',
      glowColor: 'rgba(95,212,212,0.5)',
      innerGlowColor: 'rgba(95,212,212,0.3)',
      textColor: '#3d8b8b',
      iconColor: '#e0ffff',
      gemColor: '#5fd4d4',
      gemHighlight: '#f0ffff',
    },
    diamond: {
      primaryColor: '#4169e1',
      highlightColor: '#87ceeb',
      shadowColor: '#2a4a9a',
      borderColor: '#6495ed',
      innerBorderColor: 'rgba(135,206,235,0.5)',
      glowColor: 'rgba(135,206,235,0.6)',
      innerGlowColor: 'rgba(135,206,235,0.4)',
      textColor: '#4169e1',
      iconColor: '#e6f3ff',
      gemColor: '#87ceeb',
      gemHighlight: '#f0f8ff',
    },
    master: {
      primaryColor: '#9932cc',
      highlightColor: '#da70d6',
      shadowColor: '#6a1b9a',
      borderColor: '#ba55d3',
      innerBorderColor: 'rgba(218,112,214,0.5)',
      glowColor: 'rgba(218,112,214,0.6)',
      innerGlowColor: 'rgba(218,112,214,0.4)',
      textColor: '#9932cc',
      iconColor: '#f8e8ff',
      gemColor: '#da70d6',
      gemHighlight: '#fff0ff',
    },
    grandmaster: {
      primaryColor: '#dc143c',
      highlightColor: '#ff6b6b',
      shadowColor: '#8b0000',
      borderColor: '#ff4444',
      innerBorderColor: 'rgba(255,107,107,0.5)',
      glowColor: 'rgba(255,107,107,0.6)',
      innerGlowColor: 'rgba(255,107,107,0.4)',
      textColor: '#dc143c',
      iconColor: '#ffe8e8',
      gemColor: '#ff6b6b',
      gemHighlight: '#fff0f0',
    },
    challenger: {
      primaryColor: '#ffd700',
      highlightColor: '#fff8dc',
      shadowColor: '#b8860b',
      borderColor: '#ffec8b',
      innerBorderColor: 'rgba(255,248,220,0.6)',
      glowColor: 'rgba(255,215,0,0.7)',
      innerGlowColor: 'rgba(255,215,0,0.5)',
      textColor: '#b8860b',
      iconColor: '#fffef0',
      gemColor: '#ffd700',
      gemHighlight: '#fffff0',
    },
    unranked: {
      primaryColor: '#6b5344',
      highlightColor: '#8b7355',
      shadowColor: '#4a3728',
      borderColor: '#7b6354',
      innerBorderColor: 'rgba(139,115,85,0.3)',
      glowColor: 'rgba(107,83,68,0.2)',
      innerGlowColor: 'rgba(107,83,68,0.1)',
      textColor: '#6b5344',
      iconColor: '#d4c4b4',
      gemColor: '#8b7355',
      gemHighlight: '#c4b4a4',
    },
  }

  return configs[tier.toLowerCase()] || configs.unranked
}

function calculateWinRate(wins, losses) {
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

// Icons - Dark theme versions
function DiamondIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  )
}

function ArrowUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19 L12 5 M7 10 L12 5 L17 10" />
    </svg>
  )
}

// Tier Icons
function UnrankedIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 8L8 24l16 16 16-16L24 8zm0 6l10 10-10 10-10-10 10-10z" />
    </svg>
  )
}

function IronIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 4L4 24l20 20 20-20L24 4zm0 8l12 12-12 12-12-12 12-12z" />
      <circle cx="24" cy="24" r="4" />
    </svg>
  )
}

function BronzeIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 2L6 20l18 18 18-18L24 2z" />
      <path d="M24 10l10 10-10 10-10-10 10-10z" opacity="0.6" />
    </svg>
  )
}

function SilverIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 2L4 22l20 20 20-20L24 2z" />
      <path d="M24 8l14 14-14 14-14-14 14-14z" opacity="0.5" />
      <circle cx="24" cy="22" r="5" />
    </svg>
  )
}

function GoldIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 2L2 24l22 22 22-22L24 2z" />
      <path d="M24 10l12 12-12 12-12-12 12-12z" opacity="0.6" />
      <circle cx="24" cy="22" r="4" />
      <path d="M24 16l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" opacity="0.8" />
    </svg>
  )
}

function PlatinumIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 2L2 24l22 22 22-22L24 2z" />
      <path d="M24 8l14 14-14 14-14-14 14-14z" opacity="0.5" />
      <path d="M24 14l8 8-8 8-8-8 8-8z" opacity="0.7" />
    </svg>
  )
}

function DiamondRankIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 0L0 24l24 24 24-24L24 0z" />
      <path d="M24 6l16 16-16 16-16-16 16-16z" opacity="0.4" />
      <path d="M24 12l10 10-10 10-10-10 10-10z" opacity="0.6" />
      <path d="M24 18l4 4-4 4-4-4 4-4z" />
    </svg>
  )
}

function MasterIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 2L4 22l20 24 20-24L24 2z" />
      <path d="M24 8l14 14-14 18-14-18 14-14z" opacity="0.5" />
      <circle cx="24" cy="20" r="6" />
      <path d="M24 12l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" />
    </svg>
  )
}

function GrandmasterIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 0L2 22l22 26 22-26L24 0z" />
      <path d="M24 6l16 16-16 20-16-20 16-16z" opacity="0.4" />
      <path d="M24 10l4 8 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2z" />
    </svg>
  )
}

function ChallengerIcon({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill={color}>
      <path d="M24 0L0 24l24 24 24-24L24 0z" />
      <path d="M24 4l18 18-18 18-18-18 18-18z" opacity="0.3" />
      <path d="M24 8l14 14-14 14-14-14 14-14z" opacity="0.5" />
      <path d="M24 10l5 10 10 2-7 7 2 10-10-5-10 5 2-10-7-7 10-2z" />
      <circle cx="24" cy="22" r="3" />
    </svg>
  )
}
