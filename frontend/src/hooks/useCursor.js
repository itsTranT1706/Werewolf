/**
 * Custom Cursor Hook
 * 
 * Manages cursor appearance based on game phase.
 * - Day Phase: Muted, restrained claw
 * - Night Phase: Darker, more threatening claw with blood-red glow
 */

import { useEffect } from 'react'

/**
 * Game phases that affect cursor appearance
 */
export const GAME_PHASE = {
  DAY: 'day',
  NIGHT: 'night',
  VOTING: 'voting',
  LOBBY: 'lobby',
}

/**
 * Apply cursor phase to document body
 * @param {string} phase - Current game phase
 */
export function useCursor(phase = GAME_PHASE.DAY) {
  useEffect(() => {
    const body = document.body

    // Remove all phase classes
    body.classList.remove('phase-day', 'phase-night', 'phase-voting', 'phase-lobby')

    // Apply current phase class
    if (phase === GAME_PHASE.NIGHT) {
      body.classList.add('phase-night')
    } else if (phase === GAME_PHASE.VOTING) {
      body.classList.add('phase-voting')
    } else if (phase === GAME_PHASE.LOBBY) {
      body.classList.add('phase-lobby')
    } else {
      body.classList.add('phase-day')
    }

    // Cleanup on unmount
    return () => {
      body.classList.remove('phase-day', 'phase-night', 'phase-voting', 'phase-lobby')
    }
  }, [phase])
}

/**
 * Manually set cursor phase (for non-React contexts)
 * @param {string} phase - Game phase
 */
export function setCursorPhase(phase) {
  const body = document.body
  body.classList.remove('phase-day', 'phase-night', 'phase-voting', 'phase-lobby')
  
  if (phase === GAME_PHASE.NIGHT) {
    body.classList.add('phase-night')
  } else {
    body.classList.add('phase-day')
  }
}

export default useCursor
