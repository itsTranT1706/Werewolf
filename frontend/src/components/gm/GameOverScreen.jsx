/**
 * Game Over Screen - Victory/Defeat Display
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 */

import React from 'react'
import { FACTION_NAMES } from '@/constants/roles'
import { RuneCrown, RuneWerewolfFaction, RuneVillager, RuneNeutral, RuneSkull } from '@/components/ui/RuneIcons'

const FACTION_CONFIG = {
  VILLAGER: {
    title: 'Dân Làng Chiến Thắng!',
    subtitle: 'Ánh sáng đã chiến thắng bóng tối',
    icon: RuneVillager,
    gradient: 'from-emerald-900/80 via-emerald-800/60 to-emerald-900/80',
    border: 'border-emerald-500',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/30'
  },
  WEREWOLF: {
    title: 'Ma Sói Chiến Thắng!',
    subtitle: 'Bóng tối đã nuốt chửng ngôi làng',
    icon: RuneWerewolfFaction,
    gradient: 'from-red-900/80 via-red-800/60 to-red-900/80',
    border: 'border-red-500',
    text: 'text-red-300',
    glow: 'shadow-red-500/30'
  },
  NEUTRAL: {
    title: 'Phe Độc Lập Chiến Thắng!',
    subtitle: 'Kẻ đứng ngoài cuộc đã thắng',
    icon: RuneNeutral,
    gradient: 'from-amber-900/80 via-amber-800/60 to-amber-900/80',
    border: 'border-amber-500',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/30'
  }
}

export default function GameOverScreen({ winner, players, onNewGame, onBackToLobby }) {
  const config = FACTION_CONFIG[winner] || FACTION_CONFIG.VILLAGER
  const Icon = config.icon
  
  // Group players by faction
  const groupedPlayers = {
    VILLAGER: players.filter(p => !['ALPHA_WOLF', 'YOUNG_WOLF', 'DARK_WOLF', 'PROPHET_WOLF', 'TRAITOR', 'FOOL', 'SERIAL_KILLER'].includes(p.role)),
    WEREWOLF: players.filter(p => ['ALPHA_WOLF', 'YOUNG_WOLF', 'DARK_WOLF', 'PROPHET_WOLF', 'TRAITOR'].includes(p.role)),
    NEUTRAL: players.filter(p => ['FOOL', 'SERIAL_KILLER'].includes(p.role))
  }

  return (
    <div className="fixed inset-0 bg-stone-950/95 flex items-center justify-center z-50 p-4">
      <div className={`
        max-w-2xl w-full rounded-2xl border-4 ${config.border}
        bg-gradient-to-br ${config.gradient}
        shadow-2xl ${config.glow} p-8
      `}>
        {/* Decorative corners */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-amber-400/50" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-r-4 border-t-4 border-amber-400/50" />
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-4 border-b-4 border-amber-400/50" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-4 border-b-4 border-amber-400/50" />
        </div>
        
        {/* Victory Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <RuneCrown size={80} className="text-amber-400 mx-auto mb-4" />
            <Icon size={48} className={`absolute -bottom-2 -right-2 ${config.text}`} />
          </div>
          
          <h1 className={`font-medieval text-4xl ${config.text} mb-2`}>
            {config.title}
          </h1>
          <p className="text-stone-300 text-lg">{config.subtitle}</p>
        </div>
        
        {/* Player Summary */}
        <div className="space-y-4 mb-8">
          {Object.entries(groupedPlayers).map(([faction, factionPlayers]) => {
            if (factionPlayers.length === 0) return null
            const isWinner = faction === winner
            return (
              <div 
                key={faction}
                className={`p-4 rounded-lg border ${isWinner ? 'border-amber-500/50 bg-amber-900/20' : 'border-stone-600/30 bg-stone-900/30'}`}
              >
                <h3 className={`font-medieval mb-2 ${isWinner ? 'text-amber-300' : 'text-stone-400'}`}>
                  {FACTION_NAMES[faction]} {isWinner && '👑'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {factionPlayers.map(player => (
                    <div 
                      key={player.userId}
                      className={`
                        px-3 py-1 rounded text-sm
                        ${player.isAlive 
                          ? 'bg-stone-700/50 text-stone-200' 
                          : 'bg-stone-800/50 text-stone-500 line-through'
                        }
                      `}
                    >
                      {player.displayname || player.username}
                      {!player.isAlive && <RuneSkull size={12} className="inline ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onBackToLobby}
            className="px-6 py-3 rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800 transition-colors font-medieval"
          >
            Về Phòng Chờ
          </button>
          <button
            onClick={onNewGame}
            className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-900 font-medieval shadow-lg shadow-amber-500/20 transition-all"
          >
            Chơi Lại
          </button>
        </div>
      </div>
    </div>
  )
}
