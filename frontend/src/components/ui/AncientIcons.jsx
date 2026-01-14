/**
 * Ancient Icons - Hand-crafted SVG icons for dark medieval fantasy theme
 * 
 * Replaces all modern/generic icons with mystical, ritualistic symbols
 * that feel etched in stone or infused with dark magic.
 */

// ============================================
// AUTH & IDENTITY ICONS
// ============================================

export function RuneUser({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Hooded figure silhouette */}
      <path d="M12 3 L8 8 L8 12 L10 14 L10 18 L8 21 L16 21 L14 18 L14 14 L16 12 L16 8 Z" />
      {/* Face area */}
      <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.3" />
      {/* Mystical mark on forehead */}
      <path d="M12 6 L12 8" strokeWidth="2" />
    </svg>
  )
}

export function RuneLock({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Ancient padlock shape */}
      <path d="M6 11 L6 8 Q6 3 12 3 Q18 3 18 8 L18 11" />
      {/* Lock body with rune */}
      <rect x="4" y="11" width="16" height="10" rx="1" />
      {/* Keyhole as mystical symbol */}
      <circle cx="12" cy="15" r="2" />
      <path d="M12 17 L12 19" strokeWidth="2" />
      {/* Corner marks */}
      <path d="M6 13 L8 13 M16 13 L18 13" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function RuneMail({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Sealed scroll/letter */}
      <path d="M3 7 L12 13 L21 7" />
      <rect x="3" y="5" width="18" height="14" rx="1" />
      {/* Wax seal */}
      <circle cx="12" cy="14" r="3" fill="currentColor" opacity="0.2" />
      <path d="M10 14 L14 14 M12 12 L12 16" strokeWidth="1" />
    </svg>
  )
}

export function RuneShield({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Shield shape */}
      <path d="M12 2 L4 6 L4 12 Q4 18 12 22 Q20 18 20 12 L20 6 Z" />
      {/* Inner cross mark */}
      <path d="M12 8 L12 16 M8 12 L16 12" strokeWidth="1" opacity="0.6" />
      {/* Corner runes */}
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

// ============================================
// NAVIGATION ICONS
// ============================================

export function RuneArrowLeft({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Arrow with runic styling */}
      <path d="M10 6 L4 12 L10 18" />
      <path d="M4 12 L20 12" />
      {/* Decorative marks */}
      <path d="M14 10 L14 14" strokeWidth="1" opacity="0.4" />
      <path d="M17 10 L17 14" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export function RuneExit({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Doorway */}
      <path d="M9 3 L9 21 L4 21 L4 3 Z" />
      {/* Arrow leaving */}
      <path d="M14 12 L20 12" />
      <path d="M17 9 L20 12 L17 15" />
      {/* Threshold mark */}
      <path d="M9 10 L12 10 M9 14 L12 14" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function RuneDoor({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Ancient door frame */}
      <path d="M6 3 L6 21 L18 21 L18 3 Z" />
      {/* Door arch */}
      <path d="M8 3 Q12 1 16 3" />
      {/* Handle/knocker */}
      <circle cx="15" cy="12" r="1.5" />
      {/* Mystical symbols on door */}
      <path d="M12 8 L12 16" strokeWidth="1" opacity="0.4" />
      <path d="M10 12 L14 12" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

// ============================================
// GAME & ACTION ICONS
// ============================================

export function RuneScroll({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Scroll shape */}
      <path d="M6 4 Q4 4 4 6 L4 18 Q4 20 6 20 L18 20 Q20 20 20 18 L20 6 Q20 4 18 4 Z" />
      {/* Rolled edges */}
      <path d="M4 6 Q6 6 6 4" />
      <path d="M20 18 Q18 18 18 20" />
      {/* Text lines */}
      <path d="M8 9 L16 9 M8 12 L14 12 M8 15 L12 15" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function RuneQuill({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Feather quill */}
      <path d="M20 4 Q16 4 12 8 L4 16 L4 20 L8 20 L16 12 Q20 8 20 4 Z" />
      {/* Feather details */}
      <path d="M14 10 L18 6" strokeWidth="1" opacity="0.5" />
      <path d="M12 12 L16 8" strokeWidth="1" opacity="0.5" />
      {/* Ink drop */}
      <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function RuneSeal({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Wax seal circle */}
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="5" strokeDasharray="2 1" />
      {/* Seal mark */}
      <path d="M9 9 L15 15 M15 9 L9 15" strokeWidth="2" />
      {/* Drip */}
      <path d="M12 20 Q14 22 12 24 Q10 22 12 20" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ============================================
// STATUS & INFO ICONS
// ============================================

export function RuneEye({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* All-seeing eye */}
      <ellipse cx="12" cy="12" rx="9" ry="5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      {/* Mystical rays */}
      <path d="M12 5 L12 3" strokeWidth="1" opacity="0.5" />
      <path d="M12 21 L12 19" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function RuneEyeClosed({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Closed eye */}
      <path d="M3 12 Q12 18 21 12" />
      {/* Eyelashes */}
      <path d="M6 14 L5 16" strokeWidth="1" />
      <path d="M12 16 L12 18" strokeWidth="1" />
      <path d="M18 14 L19 16" strokeWidth="1" />
      {/* Strike through */}
      <path d="M4 4 L20 20" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function RuneWarning({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Triangle */}
      <path d="M12 3 L22 20 L2 20 Z" />
      {/* Exclamation */}
      <path d="M12 9 L12 14" strokeWidth="2" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}

export function RuneCheck({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Circle seal */}
      <circle cx="12" cy="12" r="9" />
      {/* Check mark as rune */}
      <path d="M8 12 L11 15 L16 9" strokeWidth="2" />
    </svg>
  )
}

export function RuneClose({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* X mark */}
      <path d="M6 6 L18 18 M18 6 L6 18" strokeWidth="2" />
      {/* Corner marks */}
      <path d="M4 4 L6 4 L6 6" strokeWidth="1" opacity="0.4" />
      <path d="M20 4 L18 4 L18 6" strokeWidth="1" opacity="0.4" />
      <path d="M4 20 L6 20 L6 18" strokeWidth="1" opacity="0.4" />
      <path d="M20 20 L18 20 L18 18" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

// ============================================
// GAME-SPECIFIC ICONS
// ============================================

export function RuneWolf({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Wolf head silhouette */}
      <path d="M16 4 L12 10 L8 8 L10 14 L6 16 L10 18 L8 24 L12 22 L16 28 L20 22 L24 24 L22 18 L26 16 L22 14 L24 8 L20 10 Z" />
      {/* Eyes */}
      <circle cx="13" cy="15" r="1.5" fill="currentColor" />
      <circle cx="19" cy="15" r="1.5" fill="currentColor" />
      {/* Snout */}
      <path d="M14 19 L16 21 L18 19" />
    </svg>
  )
}

export function RuneMoon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Crescent moon */}
      <path d="M20 12 Q20 6 14 4 Q18 8 18 12 Q18 16 14 20 Q20 18 20 12 Z" fill="currentColor" opacity="0.2" />
      <path d="M20 12 Q20 6 14 4 Q18 8 18 12 Q18 16 14 20 Q20 18 20 12 Z" />
      {/* Stars */}
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="5" cy="14" r="0.5" fill="currentColor" />
      <circle cx="10" cy="18" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function RuneSkull({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Skull shape */}
      <path d="M12 2 Q4 4 4 12 L4 16 L8 16 L8 20 L10 20 L10 16 L14 16 L14 20 L16 20 L16 16 L20 16 L20 12 Q20 4 12 2 Z" />
      {/* Eye sockets */}
      <circle cx="9" cy="10" r="2" />
      <circle cx="15" cy="10" r="2" />
      {/* Nose */}
      <path d="M12 12 L11 15 L13 15 Z" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function RuneForest({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Trees */}
      <path d="M12 2 L8 10 L10 10 L6 18 L18 18 L14 10 L16 10 Z" />
      <path d="M12 18 L12 22" strokeWidth="2" />
      {/* Small tree */}
      <path d="M4 12 L2 18 L6 18 Z" opacity="0.5" />
      <path d="M20 12 L18 18 L22 18 Z" opacity="0.5" />
    </svg>
  )
}

export function RuneChat({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Speech scroll */}
      <path d="M4 4 L20 4 L20 16 L12 16 L8 20 L8 16 L4 16 Z" />
      {/* Text lines */}
      <path d="M8 8 L16 8" strokeWidth="1" opacity="0.5" />
      <path d="M8 11 L14 11" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function RuneSend({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Arrow/raven */}
      <path d="M4 12 L20 4 L16 12 L20 20 Z" />
      <path d="M4 12 L16 12" />
    </svg>
  )
}

export function RuneCopy({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Two scrolls */}
      <rect x="8" y="8" width="12" height="14" rx="1" />
      <path d="M6 16 L6 4 L16 4" />
      {/* Seal mark */}
      <circle cx="14" cy="15" r="2" strokeDasharray="1 1" />
    </svg>
  )
}

export function RuneShare({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Connected nodes */}
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="18" r="3" />
      {/* Connections */}
      <path d="M9 10.5 L15 7.5" />
      <path d="M9 13.5 L15 16.5" />
    </svg>
  )
}

export function CharacterIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Hooded figure - mysterious character */}
      <path d="M12 2 Q6 4 6 10 L6 14 Q6 18 12 20 Q18 18 18 14 L18 10 Q18 4 12 2 Z" />
      {/* Hood shadow */}
      <path d="M8 8 Q12 6 16 8" opacity="0.5" />
      {/* Face area - shadowed */}
      <ellipse cx="12" cy="12" rx="4" ry="5" fill="currentColor" opacity="0.15" />
      {/* Eyes glowing in shadow */}
      <circle cx="10" cy="11" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="14" cy="11" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// ============================================
// LOADING & SPINNER
// ============================================

export function RuneSpinner({ className = "w-5 h-5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Mystical spinning circle */}
      <circle cx="12" cy="12" r="9" strokeDasharray="20 40" />
      {/* Inner rune */}
      <path d="M12 6 L12 10 M12 14 L12 18 M6 12 L10 12 M14 12 L18 12" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

// ============================================
// DECORATIVE ELEMENTS
// ============================================

export function RuneDividerLine({ className = "w-full h-4" }) {
  return (
    <svg className={className} viewBox="0 0 200 16" fill="none" stroke="currentColor" strokeWidth="1" preserveAspectRatio="none">
      <path d="M0 8 L70 8" opacity="0.3" />
      <path d="M130 8 L200 8" opacity="0.3" />
      {/* Center ornament */}
      <circle cx="100" cy="8" r="4" strokeDasharray="2 1" />
      <path d="M100 4 L100 12 M96 8 L104 8" />
      {/* Side diamonds */}
      <path d="M80 8 L85 5 L90 8 L85 11 Z" fill="currentColor" opacity="0.2" />
      <path d="M110 8 L115 5 L120 8 L115 11 Z" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

export function CornerAccent({ className = "w-4 h-4", position = "top-left" }) {
  const transforms = {
    'top-left': '',
    'top-right': 'scale(-1, 1)',
    'bottom-left': 'scale(1, -1)',
    'bottom-right': 'scale(-1, -1)',
  }
  
  return (
    <svg 
      className={className} 
      viewBox="0 0 16 16" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1"
      style={{ transform: transforms[position] }}
    >
      <path d="M2 2 L2 8 L4 8 L4 4 L8 4 L8 2 Z" />
      <circle cx="3" cy="3" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
