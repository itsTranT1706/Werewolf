/**
 * Phase Timeline - Step-by-Step Wizard
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * Guides the moderator through Night and Day phases
 * in the correct ritual order.
 */

import React from 'react'
import { 
  GAME_PHASE, 
  PHASE_META, 
  NIGHT_PHASE_ORDER, 
  DAY_PHASE_ORDER,
  isNightPhase,
  isDayPhase 
} from '@/constants/gamePhases'
import { getRuneIcon } from '@/components/ui/RuneIcons'

// Phase step component
function PhaseStep({ phase, isActive, isCompleted, isSkipped, onClick }) {
  const meta = PHASE_META[phase]
  if (!meta) return null
  
  const Icon = getRuneIcon(meta.icon)
  
  return (
    <button
      onClick={onClick}
      disabled={!isCompleted && !isActive}
      className={`
        relative flex items-center gap-3 w-full p-3 rounded-lg
        transition-all duration-300 text-left
        ${isActive 
          ? 'bg-amber-900/40 border-2 border-amber-500/60 shadow-lg shadow-amber-500/20' 
          : isCompleted
            ? 'bg-stone-800/40 border border-stone-600/30 hover:bg-stone-700/40'
            : isSkipped
              ? 'bg-stone-900/20 border border-stone-700/20 opacity-40'
              : 'bg-stone-900/40 border border-stone-700/30 opacity-60'
        }
        ${!isCompleted && !isActive ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Step Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        border-2 transition-all
        ${isActive 
          ? 'border-amber-400 bg-amber-900/50 text-amber-300' 
          : isCompleted
            ? 'border-emerald-500/50 bg-emerald-900/30 text-emerald-400'
            : 'border-stone-600 bg-stone-800/50 text-stone-500'
        }
      `}>
        {isCompleted ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <Icon size={20} />
        )}
      </div>
      
      {/* Step Info */}
      <div className="flex-1 min-w-0">
        <div className={`
          font-medieval text-sm
          ${isActive ? 'text-amber-200' : isCompleted ? 'text-stone-300' : 'text-stone-500'}
        `}>
          {meta.name}
        </div>
        {isActive && (
          <div className="text-xs text-amber-400/70 mt-0.5 truncate">
            {meta.description}
          </div>
        )}
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
      )}
    </button>
  )
}

export default function PhaseTimeline({
  currentPhase,
  completedPhases = [],
  skippedPhases = [],
  activeRoles = [],      // Roles present in game (to filter phases)
  dayNumber = 1,
  onPhaseClick
}) {
  const isNight = isNightPhase(currentPhase)
  const isDay = isDayPhase(currentPhase)
  
  // Filter phases based on active roles
  const filterPhases = (phases) => {
    return phases.filter(phase => {
      const meta = PHASE_META[phase]
      if (!meta?.roleRequired) return true
      
      const required = Array.isArray(meta.roleRequired) 
        ? meta.roleRequired 
        : [meta.roleRequired]
      
      return required.some(role => activeRoles.includes(role))
    })
  }
  
  // Get relevant phases for current cycle
  const nightPhases = filterPhases(NIGHT_PHASE_ORDER)
  const dayPhases = filterPhases(DAY_PHASE_ORDER)
  
  // Check if Cupid phase should show (only night 1)
  const showCupid = dayNumber === 1 && activeRoles.includes('CUPID')
  const filteredNightPhases = nightPhases.filter(p => {
    if (p === GAME_PHASE.NIGHT_CUPID && !showCupid) return false
    return true
  })

  return (
    <div className="h-full flex flex-col bg-stone-900/50 border border-amber-900/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-amber-900/30 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900">
        <div className="flex items-center justify-between">
          <h2 className="font-medieval text-amber-200 text-lg tracking-wide">
            Nghi Lễ Đêm {dayNumber}
          </h2>
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${isNight 
              ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30' 
              : 'bg-amber-900/50 text-amber-300 border border-amber-500/30'
            }
          `}>
            {isNight ? '🌙 Đêm' : '☀️ Ngày'}
          </div>
        </div>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Night Phase Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-xs">🌙</span>
            </div>
            <span className="text-indigo-300 text-sm font-medieval">Pha Đêm</span>
            <div className="flex-1 h-px bg-indigo-900/50" />
          </div>
          
          <div className="space-y-2 pl-3 border-l-2 border-indigo-900/30">
            {filteredNightPhases.map((phase) => (
              <PhaseStep
                key={phase}
                phase={phase}
                isActive={currentPhase === phase}
                isCompleted={completedPhases.includes(phase)}
                isSkipped={skippedPhases.includes(phase)}
                onClick={() => onPhaseClick?.(phase)}
              />
            ))}
          </div>
        </div>
        
        {/* Day Phase Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-amber-900/50 border border-amber-500/30 flex items-center justify-center">
              <span className="text-xs">☀️</span>
            </div>
            <span className="text-amber-300 text-sm font-medieval">Pha Ngày</span>
            <div className="flex-1 h-px bg-amber-900/50" />
          </div>
          
          <div className="space-y-2 pl-3 border-l-2 border-amber-900/30">
            {dayPhases.map((phase) => (
              <PhaseStep
                key={phase}
                phase={phase}
                isActive={currentPhase === phase}
                isCompleted={completedPhases.includes(phase)}
                isSkipped={skippedPhases.includes(phase)}
                onClick={() => onPhaseClick?.(phase)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer - Current Phase Info */}
      <div className="px-4 py-3 border-t border-amber-900/30 bg-stone-900/80">
        <div className="text-center">
          <div className="text-xs text-stone-500 mb-1">Đang thực hiện</div>
          <div className="font-medieval text-amber-200">
            {PHASE_META[currentPhase]?.name || 'Chờ...'}
          </div>
        </div>
      </div>
    </div>
  )
}
