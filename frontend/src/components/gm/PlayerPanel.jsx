/**
 * Player Panel - Persistent Player Grid
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * Displays all players as a grid of mystical cards.
 * Replaces manual note-taking for the Game Master.
 */

import React, { useMemo } from 'react'
import PlayerCard from './PlayerCard'
import { PLAYER_STATUS } from '@/constants/gamePhases'
import { FACTION } from '@/constants/roles'
import { RuneSkull, RuneVillager, RuneWerewolfFaction, RuneNeutral } from '@/components/ui/RuneIcons'

export default function PlayerPanel({
  players = [],
  selectedPlayerId = null,
  selectablePlayers = [],  // Array of userIds that can be selected
  onSelectPlayer,
  nightActions = {},       // Current night's actions for status display
  showRoles = true,        // GM mode - show all roles
  title = 'Các Linh Hồn',
  compact = false
}) {
  // Calculate player statuses based on night actions
  const getPlayerStatuses = (player) => {
    const statuses = []
    const { userId } = player
    
    if (nightActions.protectedPlayer === userId) {
      statuses.push(PLAYER_STATUS.PROTECTED)
    }
    if (nightActions.werewolfTarget === userId) {
      statuses.push(PLAYER_STATUS.ATTACKED)
    }
    if (nightActions.poisonedTarget === userId) {
      statuses.push(PLAYER_STATUS.POISONED)
    }
    if (nightActions.witchSaved && nightActions.werewolfTarget === userId) {
      statuses.push(PLAYER_STATUS.SAVED)
    }
    if (nightActions.seerChecked === userId) {
      statuses.push(PLAYER_STATUS.INVESTIGATED)
    }
    if (nightActions.lovers?.includes(userId)) {
      statuses.push(PLAYER_STATUS.LOVER)
    }
    if (nightActions.hunterTarget === userId) {
      statuses.push(PLAYER_STATUS.MARKED)
    }
    
    return statuses
  }
  
  // Group players by status
  const { alivePlayers, deadPlayers } = useMemo(() => {
    const alive = players.filter(p => p.isAlive !== false)
    const dead = players.filter(p => p.isAlive === false)
    return { alivePlayers: alive, deadPlayers: dead }
  }, [players])
  
  // Count by faction (for GM stats)
  const factionCounts = useMemo(() => {
    const counts = { VILLAGER: 0, WEREWOLF: 0, NEUTRAL: 0 }
    alivePlayers.forEach(p => {
      const role = p.role
      if (['ALPHA_WOLF', 'YOUNG_WOLF', 'DARK_WOLF', 'PROPHET_WOLF', 'TRAITOR'].includes(role)) {
        counts.WEREWOLF++
      } else if (['FOOL', 'SERIAL_KILLER'].includes(role)) {
        counts.NEUTRAL++
      } else {
        counts.VILLAGER++
      }
    })
    return counts
  }, [alivePlayers])

  return (
    <div className="h-full flex flex-col bg-stone-900/50 border border-amber-900/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-amber-900/30 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900">
        <div className="flex items-center justify-between">
          <h2 className="font-medieval text-amber-200 text-lg tracking-wide">
            {title}
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-stone-400">
              {alivePlayers.length} sống / {players.length} tổng
            </span>
          </div>
        </div>
        
        {/* Faction Stats (GM only) */}
        {showRoles && (
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1 text-emerald-400">
              <RuneVillager size={14} />
              <span>{factionCounts.VILLAGER}</span>
            </div>
            <div className="flex items-center gap-1 text-red-400">
              <RuneWerewolfFaction size={14} />
              <span>{factionCounts.WEREWOLF}</span>
            </div>
            {factionCounts.NEUTRAL > 0 && (
              <div className="flex items-center gap-1 text-amber-400">
                <RuneNeutral size={14} />
                <span>{factionCounts.NEUTRAL}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Player Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Alive Players */}
        <div className={`
          grid gap-3
          ${compact 
            ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5' 
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }
        `}>
          {alivePlayers.map((player) => (
            <PlayerCard
              key={player.userId || player.id}
              player={player}
              isSelected={selectedPlayerId === (player.userId || player.id)}
              isSelectable={selectablePlayers.includes(player.userId || player.id)}
              showRole={showRoles}
              statuses={getPlayerStatuses(player)}
              onClick={() => onSelectPlayer?.(player.userId || player.id)}
              size={compact ? 'compact' : 'normal'}
            />
          ))}
        </div>
        
        {/* Dead Players Section */}
        {deadPlayers.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <RuneSkull size={16} className="text-stone-500" />
              <span className="text-stone-500 text-sm font-medieval">
                Đã Khuất ({deadPlayers.length})
              </span>
              <div className="flex-1 h-px bg-stone-700/50" />
            </div>
            
            <div className={`
              grid gap-2
              ${compact 
                ? 'grid-cols-4 sm:grid-cols-5 lg:grid-cols-6' 
                : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'
              }
            `}>
              {deadPlayers.map((player) => (
                <PlayerCard
                  key={player.userId || player.id}
                  player={player}
                  showRole={showRoles}
                  statuses={[]}
                  size="compact"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {players.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-500">
            <RuneSkull size={48} className="mb-4 opacity-30" />
            <p className="font-medieval">Chưa có linh hồn nào...</p>
          </div>
        )}
      </div>
      
      {/* Footer - Selection Hint */}
      {selectablePlayers.length > 0 && (
        <div className="px-4 py-2 border-t border-amber-900/30 bg-stone-900/80">
          <p className="text-xs text-amber-400/70 text-center font-medieval">
            ⚔ Chọn một người chơi để tiếp tục nghi lễ ⚔
          </p>
        </div>
      )}
    </div>
  )
}
