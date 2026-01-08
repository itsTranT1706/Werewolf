/**
 * Ancient Symbols & Glyphs
 * 
 * Hand-crafted SVG symbols for the dark ritual theme.
 * No modern icons, no emojis - only ancient, cursed markings.
 */

// ============================================
// ROLE SIGILS - Occult symbols for each role
// ============================================

export function WerewolfSigil({ className = "w-16 h-16", glow = false }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <defs>
        {glow && (
          <filter id="bloodGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>
      <g stroke="currentColor" strokeWidth="1.5" fill="none" filter={glow ? "url(#bloodGlow)" : undefined}>
        {/* Wolf head silhouette */}
        <path d="M32 8 L24 20 L16 16 L20 28 L12 32 L20 36 L16 48 L24 44 L32 56 L40 44 L48 48 L44 36 L52 32 L44 28 L48 16 L40 20 Z"/>
        {/* Eyes */}
        <circle cx="26" cy="30" r="2" fill="currentColor"/>
        <circle cx="38" cy="30" r="2" fill="currentColor"/>
        {/* Snout */}
        <path d="M28 38 L32 42 L36 38"/>
        {/* Inner circle */}
        <circle cx="32" cy="32" r="18" strokeDasharray="4 2"/>
      </g>
    </svg>
  )
}

export function SeerSigil({ className = "w-16 h-16", glow = false }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <defs>
        {glow && (
          <filter id="seerGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>
      <g stroke="currentColor" strokeWidth="1.5" fill="none" filter={glow ? "url(#seerGlow)" : undefined}>
        {/* All-seeing eye */}
        <ellipse cx="32" cy="32" rx="20" ry="12"/>
        <circle cx="32" cy="32" r="8"/>
        <circle cx="32" cy="32" r="3" fill="currentColor"/>
        {/* Rays */}
        <path d="M32 12 L32 6"/>
        <path d="M32 52 L32 58"/>
        <path d="M12 32 L6 32"/>
        <path d="M52 32 L58 32"/>
        {/* Diagonal rays */}
        <path d="M18 18 L14 14"/>
        <path d="M46 18 L50 14"/>
        <path d="M18 46 L14 50"/>
        <path d="M46 46 L50 50"/>
        {/* Tears */}
        <path d="M32 44 Q34 50 32 54 Q30 50 32 44" fill="currentColor" opacity="0.5"/>
      </g>
    </svg>
  )
}

export function WitchSigil({ className = "w-16 h-16", glow = false }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <defs>
        {glow && (
          <filter id="witchGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>
      <g stroke="currentColor" strokeWidth="1.5" fill="none" filter={glow ? "url(#witchGlow)" : undefined}>
        {/* Potion bottle */}
        <path d="M26 8 L26 20 L18 32 L18 52 Q18 56 22 56 L42 56 Q46 56 46 52 L46 32 L38 20 L38 8"/>
        <path d="M24 8 L40 8"/>
        {/* Liquid */}
        <path d="M20 40 Q32 36 44 40 L44 52 Q44 54 42 54 L22 54 Q20 54 20 52 Z" fill="currentColor" opacity="0.3"/>
        {/* Bubbles */}
        <circle cx="28" cy="46" r="2"/>
        <circle cx="36" cy="42" r="1.5"/>
        <circle cx="32" cy="50" r="1"/>
        {/* Steam/smoke */}
        <path d="M28 4 Q30 0 32 4 Q34 8 36 4"/>
      </g>
    </svg>
  )
}

export function VillagerSigil({ className = "w-16 h-16", glow = false }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <defs>
        {glow && (
          <filter id="villagerGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>
      <g stroke="currentColor" strokeWidth="1.5" fill="none" filter={glow ? "url(#villagerGlow)" : undefined}>
        {/* House */}
        <path d="M32 8 L12 28 L12 56 L52 56 L52 28 Z"/>
        {/* Door */}
        <path d="M26 56 L26 40 L38 40 L38 56"/>
        {/* Window */}
        <rect x="18" y="34" width="8" height="8"/>
        <path d="M22 34 L22 42 M18 38 L26 38"/>
        {/* Chimney */}
        <path d="M42 20 L42 12 L48 12 L48 24"/>
        {/* Smoke */}
        <path d="M45 8 Q47 4 45 2" opacity="0.5"/>
        {/* Cross mark on door - ominous */}
        <path d="M30 44 L34 48 M34 44 L30 48" opacity="0.4"/>
      </g>
    </svg>
  )
}

// ============================================
// RITUAL RUNES - Ancient markings
// ============================================

export function RuneWhisper({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Whisper rune - mouth with sound waves */}
      <ellipse cx="24" cy="24" rx="8" ry="4"/>
      <path d="M16 24 Q12 20 8 24 Q12 28 16 24"/>
      <path d="M32 24 Q36 20 40 24 Q36 28 32 24"/>
      <path d="M24 16 L24 8"/>
      <path d="M24 32 L24 40"/>
      <circle cx="24" cy="24" r="20" strokeDasharray="3 3"/>
    </svg>
  )
}

export function RuneBloodMoon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Blood moon rune */}
      <circle cx="24" cy="24" r="16"/>
      <circle cx="24" cy="24" r="10" fill="currentColor" opacity="0.2"/>
      {/* Dripping blood */}
      <path d="M18 40 Q18 44 20 44 Q22 44 22 40"/>
      <path d="M26 40 Q26 46 28 46 Q30 46 30 40"/>
      <path d="M34 38 Q34 42 36 42 Q38 42 38 38"/>
      {/* Rays */}
      <path d="M24 4 L24 8"/>
      <path d="M40 24 L44 24"/>
      <path d="M4 24 L8 24"/>
    </svg>
  )
}

export function RuneCouncil({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Council rune - three figures in circle */}
      <circle cx="24" cy="24" r="20"/>
      {/* Three hooded figures */}
      <path d="M24 8 L20 18 L28 18 Z"/>
      <path d="M10 34 L14 24 L18 34 Z"/>
      <path d="M30 34 L34 24 L38 34 Z"/>
      {/* Connecting lines */}
      <path d="M24 18 L14 28"/>
      <path d="M24 18 L34 28"/>
      <path d="M18 32 L30 32"/>
      {/* Center eye */}
      <circle cx="24" cy="26" r="3"/>
    </svg>
  )
}

// ============================================
// DECORATIVE ELEMENTS
// ============================================

export function ClawMarks({ className = "w-24 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 96 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 4 L24 28" opacity="0.6"/>
      <path d="M36 2 L38 30" opacity="0.8"/>
      <path d="M52 1 L52 31"/>
      <path d="M68 2 L66 30" opacity="0.8"/>
      <path d="M84 4 L80 28" opacity="0.6"/>
    </svg>
  )
}

export function AncientSeal({ className = "w-32 h-32" }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" stroke="currentColor" strokeWidth="1">
      {/* Outer circles */}
      <circle cx="64" cy="64" r="60"/>
      <circle cx="64" cy="64" r="52" strokeDasharray="4 2"/>
      <circle cx="64" cy="64" r="44"/>
      {/* Pentagram */}
      <path d="M64 14 L82 54 L118 54 L90 80 L100 118 L64 94 L28 118 L38 80 L10 54 L46 54 Z"/>
      {/* Inner circle */}
      <circle cx="64" cy="64" r="20"/>
      {/* Center symbol */}
      <circle cx="64" cy="64" r="6" fill="currentColor" opacity="0.5"/>
      {/* Corner rune marks (SVG paths instead of text) */}
      <path d="M64 6 L64 12 M60 9 L68 9" strokeWidth="1.5"/>
      <path d="M122 64 L116 64 M119 60 L119 68" strokeWidth="1.5"/>
      <path d="M64 122 L64 116 M60 119 L68 119" strokeWidth="1.5"/>
      <path d="M6 64 L12 64 M9 60 L9 68" strokeWidth="1.5"/>
    </svg>
  )
}

export function RuneDivider({ className = "w-48 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 192 16" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 8 L60 8"/>
      <path d="M132 8 L192 8"/>
      {/* Center rune */}
      <circle cx="96" cy="8" r="6"/>
      <path d="M96 2 L96 14"/>
      <path d="M90 8 L102 8"/>
      {/* Side diamonds */}
      <path d="M70 8 L76 4 L82 8 L76 12 Z" fill="currentColor" opacity="0.3"/>
      <path d="M110 8 L116 4 L122 8 L116 12 Z" fill="currentColor" opacity="0.3"/>
    </svg>
  )
}

export function CornerRune({ className = "w-8 h-8", position = "top-left" }) {
  const rotation = {
    'top-left': 0,
    'top-right': 90,
    'bottom-right': 180,
    'bottom-left': 270,
  }[position]

  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path d="M4 4 L4 16 L8 16 L8 8 L16 8 L16 4 Z"/>
      <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
      <path d="M12 12 L20 12 L20 20" strokeDasharray="2 2"/>
    </svg>
  )
}

// ============================================
// LOCK/SEAL SYMBOL (replaces emoji)
// ============================================

export function SealedMark({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Wax seal shape */}
      <circle cx="16" cy="16" r="12"/>
      <circle cx="16" cy="16" r="8" strokeDasharray="2 1"/>
      {/* X mark */}
      <path d="M11 11 L21 21"/>
      <path d="M21 11 L11 21"/>
      {/* Drip */}
      <path d="M16 28 Q18 30 16 32 Q14 30 16 28" fill="currentColor" opacity="0.5"/>
    </svg>
  )
}
