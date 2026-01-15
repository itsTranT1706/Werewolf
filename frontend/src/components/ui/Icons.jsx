/**
 * Shared Icons - Ancient Mystical SVG Icons
 * 
 * Hand-crafted icons for the dark medieval fantasy theme.
 * Every icon feels etched in stone or infused with dark magic.
 * 
 * Import: import { WolfIcon, RuneUser, ... } from '@/components/ui/Icons'
 */

// Re-export all ancient icons
export * from './AncientIcons'

// ============================================
// CHARACTER & PROFILE ICONS
// ============================================

export function WolfIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Wolf head silhouette */}
      <path d="M32 8 L24 18 L16 14 L20 26 L12 32 L20 38 L16 50 L24 46 L32 56 L40 46 L48 50 L44 38 L52 32 L44 26 L48 14 L40 18 Z" />
      {/* Eyes */}
      <circle cx="26" cy="30" r="3" fill="currentColor" />
      <circle cx="38" cy="30" r="3" fill="currentColor" />
      {/* Snout */}
      <path d="M28 40 L32 44 L36 40" />
      {/* Inner mystical circle */}
      <circle cx="32" cy="32" r="16" strokeDasharray="4 3" opacity="0.3" />
    </svg>
  )
}

export function CharacterIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Hooded figure */}
      <path d="M12 3 L8 8 L8 12 L10 14 L10 18 L8 21 L16 21 L14 18 L14 14 L16 12 L16 8 Z" />
      <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.4" />
      <path d="M12 6 L12 8" strokeWidth="2" />
    </svg>
  )
}

export function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3 L8 8 L8 12 L10 14 L10 18 L8 21 L16 21 L14 18 L14 14 L16 12 L16 8 Z" />
      <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.3" />
      <path d="M12 6 L12 8" strokeWidth="2" />
    </svg>
  )
}

// ============================================
// AUTH & SECURITY ICONS
// ============================================

export function LockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 11 L6 8 Q6 3 12 3 Q18 3 18 8 L18 11" />
      <rect x="4" y="11" width="16" height="10" rx="1" />
      <circle cx="12" cy="15" r="2" />
      <path d="M12 17 L12 19" strokeWidth="2" />
    </svg>
  )
}

export function ShieldIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2 L4 6 L4 12 Q4 18 12 22 Q20 18 20 12 L20 6 Z" />
      <path d="M12 8 L12 16 M8 12 L16 12" strokeWidth="1" opacity="0.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

// ============================================
// COMMUNICATION ICONS
// ============================================

export function MailIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7 L12 13 L21 7" />
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <circle cx="12" cy="14" r="3" fill="currentColor" opacity="0.2" />
      <path d="M10 14 L14 14 M12 12 L12 16" strokeWidth="1" />
    </svg>
  )
}

// ============================================
// DOCUMENT & UI ICONS
// ============================================

export function ScrollIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4 Q4 4 4 6 L4 18 Q4 20 6 20 L18 20 Q20 20 20 18 L20 6 Q20 4 18 4 Z" />
      <path d="M4 6 Q6 6 6 4" />
      <path d="M20 18 Q18 18 18 20" />
      <path d="M8 9 L16 9 M8 12 L14 12 M8 15 L12 15" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function QuillIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 4 Q16 4 12 8 L4 16 L4 20 L8 20 L16 12 Q20 8 20 4 Z" />
      <path d="M14 10 L18 6" strokeWidth="1" opacity="0.5" />
      <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function ImageIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <circle cx="8" cy="8" r="2" />
      <path d="M21 15 L16 10 L8 18" />
      <path d="M14 18 L11 15 L3 21" opacity="0.5" />
    </svg>
  )
}

// ============================================
// ACTION ICONS
// ============================================

export function ArrowLeftIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 6 L4 12 L10 18" />
      <path d="M4 12 L20 12" />
      <path d="M14 10 L14 14" strokeWidth="1" opacity="0.4" />
      <path d="M17 10 L17 14" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export function ExitIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 3 L9 21 L4 21 L4 3 Z" />
      <path d="M14 12 L20 12" />
      <path d="M17 9 L20 12 L17 15" />
      <path d="M9 10 L12 10 M9 14 L12 14" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function CheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12 L11 15 L16 9" strokeWidth="2" />
    </svg>
  )
}

// ============================================
// TIME & DATE ICONS
// ============================================

export function CalendarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M8 3 L8 7 M16 3 L16 7" />
      <path d="M3 10 L21 10" />
      <path d="M8 14 L8 14.01 M12 14 L12 14.01 M16 14 L16 14.01" strokeWidth="2" />
    </svg>
  )
}

export function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6 L12 12 L16 14" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

// ============================================
// GAME STATS ICONS
// ============================================

export function SwordsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Crossed swords */}
      <path d="M4 4 L14 14 M14 4 L4 14" strokeWidth="2" />
      <path d="M2 6 L6 2 M18 2 L22 6" />
      <path d="M2 18 L6 22 M18 22 L22 18" />
      {/* Hilts */}
      <path d="M8 8 L6 10 M16 8 L18 10" strokeWidth="1" />
    </svg>
  )
}

export function TrophyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Cup */}
      <path d="M6 4 L6 10 Q6 14 12 14 Q18 14 18 10 L18 4 Z" />
      {/* Handles */}
      <path d="M6 6 Q2 6 2 10 Q2 12 6 12" />
      <path d="M18 6 Q22 6 22 10 Q22 12 18 12" />
      {/* Base */}
      <path d="M12 14 L12 18 M8 18 L16 18 L16 20 L8 20 Z" />
      {/* Star */}
      <path d="M12 7 L13 9 L15 9 L13.5 10.5 L14 12 L12 11 L10 12 L10.5 10.5 L9 9 L11 9 Z" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function SkullIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2 Q4 4 4 12 L4 16 L8 16 L8 20 L10 20 L10 16 L14 16 L14 20 L16 20 L16 16 L20 16 L20 12 Q20 4 12 2 Z" />
      <circle cx="9" cy="10" r="2" />
      <circle cx="15" cy="10" r="2" />
      <path d="M12 12 L11 15 L13 15 Z" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function StarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2 L14.5 9 L22 9 L16 13.5 L18 21 L12 16.5 L6 21 L8 13.5 L2 9 L9.5 9 Z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

// ============================================
// LOADING & STATUS ICONS
// ============================================

export function LoadingSpinner({ className = "w-5 h-5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" strokeDasharray="20 40" />
      <path d="M12 6 L12 9 M12 15 L12 18 M6 12 L9 12 M15 12 L18 12" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}
