/**
 * Rune Icons - Ancient Occult Iconography
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * These icons are designed to look like carved runes,
 * ancient symbols, and occult markings.
 */

import React from 'react'

// Base wrapper for consistent styling
const RuneBase = ({ children, className = '', size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`rune-icon ${className}`}
    {...props}
  >
    {children}
  </svg>
)

// ═══════════════════════════════════════════════════════════════
// STATUS RUNES - Player State Badges
// ═══════════════════════════════════════════════════════════════

/** Shield Rune - Protection by Bodyguard */
export const RuneShield = (props) => (
  <RuneBase {...props}>
    <path d="M12 2L4 6v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V6l-8-4z" />
    <path d="M12 6v10" strokeDasharray="2 2" />
    <circle cx="12" cy="10" r="2" fill="currentColor" />
  </RuneBase>
)

/** Wolf Claw Rune - Werewolf Attack */
export const RuneWolfClaw = (props) => (
  <RuneBase {...props}>
    <path d="M5 19L9 12L7 8L10 4" />
    <path d="M12 19L14 12L12 8L14 4" />
    <path d="M19 19L17 12L19 8L17 4" />
    <circle cx="12" cy="20" r="2" fill="currentColor" />
  </RuneBase>
)

/** Poison Vial Rune - Witch's Poison */
export const RunePoison = (props) => (
  <RuneBase {...props}>
    <path d="M9 3h6v4l2 3v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8l2-3V3z" />
    <path d="M9 3h6" strokeWidth="2" />
    <path d="M8 14h8" strokeDasharray="2 1" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    <path d="M10 11l4 2M14 11l-4 2" opacity="0.5" />
  </RuneBase>
)

/** Healing Herb Rune - Witch's Save */
export const RuneHeal = (props) => (
  <RuneBase {...props}>
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <circle cx="12" cy="12" r="4" strokeDasharray="3 2" />
    <path d="M12 6c-2 2-2 4 0 6 2-2 2-4 0-6" fill="currentColor" opacity="0.3" />
  </RuneBase>
)

/** Eye Rune - Seer Investigation */
export const RuneAllSeeingEye = (props) => (
  <RuneBase {...props}>
    <path d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path d="M12 2v3M12 19v3" strokeDasharray="1 1" />
    <path d="M5 5l2 2M17 17l2 2M19 5l-2 2M5 19l2-2" strokeDasharray="1 1" opacity="0.5" />
  </RuneBase>
)

/** Heart Bound Rune - Cupid's Lovers */
export const RuneLovers = (props) => (
  <RuneBase {...props}>
    <path d="M12 6C10 2 4 2 4 8c0 4 8 10 8 10s8-6 8-10c0-6-6-6-8-2z" />
    <path d="M8 8l8 6M16 8l-8 6" strokeDasharray="2 2" opacity="0.5" />
    <circle cx="12" cy="10" r="1.5" fill="currentColor" />
  </RuneBase>
)

/** Skull Rune - Death */
export const RuneSkull = (props) => (
  <RuneBase {...props}>
    <circle cx="12" cy="10" r="7" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    <circle cx="15" cy="9" r="1.5" fill="currentColor" />
    <path d="M10 14h4" />
    <path d="M9 17v4M12 17v4M15 17v4" />
    <path d="M8 21h8" />
  </RuneBase>
)

/** Arrow Rune - Hunter's Mark */
export const RuneArrow = (props) => (
  <RuneBase {...props}>
    <path d="M12 2L12 18" />
    <path d="M5 9l7-7 7 7" />
    <path d="M8 22h8" />
    <circle cx="12" cy="18" r="2" fill="currentColor" />
  </RuneBase>
)

// ═══════════════════════════════════════════════════════════════
// PHASE RUNES - Timeline Icons
// ═══════════════════════════════════════════════════════════════

/** Moon Rune - Night Phase */
export const RuneMoon = (props) => (
  <RuneBase {...props}>
    <path d="M12 3a9 9 0 109 9c0-5-4-9-9-9z" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <circle cx="13" cy="7" r="0.5" fill="currentColor" />
    <circle cx="7" cy="13" r="0.5" fill="currentColor" />
    <path d="M15 12l3 3M18 12l-3 3" strokeDasharray="1 1" opacity="0.5" />
  </RuneBase>
)

/** Sun Rune - Day Phase */
export const RuneSun = (props) => (
  <RuneBase {...props}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </RuneBase>
)

/** Wolf Head Rune - Werewolf */
export const RuneWolf = (props) => (
  <RuneBase {...props}>
    <path d="M4 8l4-4v6l-2 4v6l6 2 6-2v-6l-2-4V4l4 4v10l-8 4-8-4V8z" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <path d="M10 16l2 1 2-1" />
  </RuneBase>
)

/** Scroll Rune - Role Assignment */
export const RuneScroll = (props) => (
  <RuneBase {...props}>
    <path d="M6 3c-1 0-2 1-2 2v14c0 1 1 2 2 2h12c1 0 2-1 2-2V5c0-1-1-2-2-2" />
    <path d="M6 3h12" strokeWidth="2" />
    <path d="M8 8h8M8 12h8M8 16h4" strokeDasharray="2 2" />
    <circle cx="6" cy="3" r="1.5" fill="currentColor" />
    <circle cx="18" cy="3" r="1.5" fill="currentColor" />
  </RuneBase>
)

/** Gallows Rune - Execution */
export const RuneGallows = (props) => (
  <RuneBase {...props}>
    <path d="M4 22V6h12V2" />
    <path d="M16 2v4" />
    <path d="M16 6v3" />
    <circle cx="16" cy="12" r="3" />
    <path d="M16 15v4M14 19h4" />
    <path d="M4 22h6" />
  </RuneBase>
)

/** Hourglass Rune - Time/Phase End */
export const RuneHourglass = (props) => (
  <RuneBase {...props}>
    <path d="M6 2h12M6 22h12" strokeWidth="2" />
    <path d="M7 2v4l5 6-5 6v4M17 2v4l-5 6 5 6v4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M10 18h4" strokeDasharray="1 1" />
  </RuneBase>
)

/** Crown Rune - Victory */
export const RuneCrown = (props) => (
  <RuneBase {...props}>
    <path d="M3 18l3-12 6 6 6-6 3 12H3z" />
    <path d="M3 18h18v3H3z" />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
  </RuneBase>
)

/** Vote Rune - Voting */
export const RuneVote = (props) => (
  <RuneBase {...props}>
    <path d="M4 4h16v16H4z" />
    <path d="M4 4l16 16M20 4L4 20" strokeDasharray="3 2" opacity="0.3" />
    <path d="M8 12l3 3 5-6" strokeWidth="2" />
  </RuneBase>
)

/** Chat Rune - Discussion */
export const RuneChat = (props) => (
  <RuneBase {...props}>
    <path d="M4 4h16v12H8l-4 4V4z" />
    <path d="M8 8h8M8 12h4" strokeDasharray="2 2" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
  </RuneBase>
)

/** Potion Rune - Witch */
export const RunePotion = (props) => (
  <RuneBase {...props}>
    <path d="M9 2h6v3l3 5v10a2 2 0 01-2 2H8a2 2 0 01-2-2V10l3-5V2z" />
    <path d="M9 2h6" strokeWidth="2" />
    <path d="M7 12h10" />
    <circle cx="10" cy="16" r="1.5" fill="currentColor" />
    <circle cx="14" cy="14" r="1" fill="currentColor" />
    <path d="M12 12v-2" strokeDasharray="1 1" />
  </RuneBase>
)

/** Door Rune - Lobby */
export const RuneDoor = (props) => (
  <RuneBase {...props}>
    <path d="M4 2h16v20H4z" />
    <path d="M8 2v20" />
    <circle cx="14" cy="12" r="1.5" fill="currentColor" />
    <path d="M10 6h6M10 18h6" strokeDasharray="2 2" />
  </RuneBase>
)

/** Heart Rune - Cupid */
export const RuneHeart = (props) => (
  <RuneBase {...props}>
    <path d="M12 6C10 2 4 2 4 8c0 4 8 10 8 10s8-6 8-10c0-6-6-6-8-2z" />
    <path d="M12 8v6M9 11h6" strokeDasharray="2 1" />
  </RuneBase>
)

// ═══════════════════════════════════════════════════════════════
// FACTION RUNES - Team Indicators
// ═══════════════════════════════════════════════════════════════

/** Villager Rune */
export const RuneVillager = (props) => (
  <RuneBase {...props}>
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21v-2a8 8 0 0116 0v2" />
    <path d="M12 11v4" strokeDasharray="2 1" />
  </RuneBase>
)

/** Werewolf Faction Rune */
export const RuneWerewolfFaction = (props) => (
  <RuneBase {...props}>
    <path d="M12 2L8 8l-4-2v8l8 8 8-8V6l-4 2-4-6z" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path d="M10 14l2 2 2-2" />
  </RuneBase>
)

/** Neutral Rune */
export const RuneNeutral = (props) => (
  <RuneBase {...props}>
    <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
    <path d="M12 6v12M6 12h12" />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
  </RuneBase>
)

// ═══════════════════════════════════════════════════════════════
// UTILITY - Icon Mapping
// ═══════════════════════════════════════════════════════════════

export const RUNE_ICONS = {
  // Status
  shield: RuneShield,
  wolfClaw: RuneWolfClaw,
  poison: RunePoison,
  heal: RuneHeal,
  eye: RuneAllSeeingEye,
  lovers: RuneLovers,
  skull: RuneSkull,
  arrow: RuneArrow,
  
  // Phases
  moon: RuneMoon,
  sun: RuneSun,
  wolf: RuneWolf,
  scroll: RuneScroll,
  gallows: RuneGallows,
  hourglass: RuneHourglass,
  crown: RuneCrown,
  vote: RuneVote,
  chat: RuneChat,
  potion: RunePotion,
  door: RuneDoor,
  heart: RuneHeart,
  calculate: RuneHourglass,
  
  // Factions
  villager: RuneVillager,
  werewolf: RuneWerewolfFaction,
  neutral: RuneNeutral
}

export const getRuneIcon = (name) => RUNE_ICONS[name] || RuneSkull

export default RUNE_ICONS
