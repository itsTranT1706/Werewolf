/**
 * Player Card - Individual Player Display
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * Displays player info with ancient rune-style status badges.
 * Designed to look like a mystical tarot card or ritual marker.
 */

import React from 'react'
import { ROLES, FACTION_NAMES, getRoleIcon } from '@/constants/roles'
import { PLAYER_STATUS } from '@/constants/gamePhases'
import {
  RuneShield,
  RuneWolfClaw,
  RunePoison,
  RuneHeal,
  RuneAllSeeingEye,
  RuneLovers,
  RuneSkull,
  RuneArrow
} from '@/components/ui/RuneIcons'

// Status badge configurations
const STATUS_BADGES = {
  [PLAYER_STATUS.PROTECTED]: {
    icon: RuneShield,
    label: 'Được Bảo Vệ',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/50',
    borderColor: 'border-blue-500/50'
  },
  [PLAYER_STATUS.ATTACKED]: {
    icon: RuneWolfClaw,
    label: 'Bị Tấn Công',
    color: 'text-red-400',
    bgColor: 'bg-red-900/50',
    borderColor: 'border-red-500/50'
  },
  [PLAYER_STATUS.POISONED]: {
    icon: RunePoison,
    label: 'Bị Đầu Độc',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/50',
    borderColor: 'border-purple-500/50'
  },
  [PLAYER_STATUS.SAVED]: {
    icon: RuneHeal,
    label: 'Được Cứu',
    color: 'text-green-400',
    bgColor: 'bg-green-900/50',
    borderColor: 'border-green-500/50'
  },
  [PLAYER_STATUS.INVESTIGATED]: {
    icon: RuneAllSeeingEye,
    label: 'Đã Soi',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/50',
    borderColor: 'border-amber-500/50'
  },
  [PLAYER_STATUS.LOVER]: {
    icon: RuneLovers,
    label: 'Người Yêu',
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/50',
    borderColor: 'border-pink-500/50'
  },
  [PLAYER_STATUS.MARKED]: {
    icon: RuneArrow,
    label: 'Bị Đánh Dấu',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/50',
    borderColor: 'border-orange-500/50'
  }
}

// Faction colors
const FACTION_COLORS = {
  VILLAGER: {
    border: 'border-emerald-600/60',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-400',
    bg: 'bg-emerald-900/20'
  },
  WEREWOLF: {
    border: 'border-red-600/60',
    glow: 'shadow-red-500/20',
    text: 'text-red-400',
    bg: 'bg-red-900/20'
  },
  NEUTRAL: {
    border: 'border-amber-600/60',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-400',
    bg: 'bg-amber-900/20'
  }
}

export default function PlayerCard({
  player,
  isSelected = false,
  isSelectable = false,
  showRole = true,  // GM can see roles
  statuses = [],    // Array of PLAYER_STATUS values
  onClick,
  size = 'normal'   // 'compact' | 'normal' | 'large'
}) {
  const { username, displayname, role, isAlive, userId } = player
  const roleInfo = ROLES[role] || {}
  const faction = roleInfo.faction || 'VILLAGER'
  const factionColors = FACTION_COLORS[faction]
  
  const isDead = !isAlive
  const name = displayname || username || 'Unknown'
  
  // Size variants
  const sizeClasses = {
    compact: 'p-2 min-w-[100px]',
    normal: 'p-3 min-w-[140px]',
    large: 'p-4 min-w-[180px]'
  }
  
  const iconSizes = {
    compact: 14,
    normal: 18,
    large: 22
  }

  return (
    <div
      onClick={isSelectable && !isDead ? onClick : undefined}
      className={`
        relative rounded-lg border-2 transition-all duration-300
        ${sizeClasses[size]}
        ${isDead 
          ? 'bg-stone-900/80 border-stone-700/50 opacity-60' 
          : `${factionColors.bg} ${factionColors.border}`
        }
        ${isSelected 
          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900 scale-105' 
          : ''
        }
        ${isSelectable && !isDead 
          ? 'cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20' 
          : ''
        }
        ${!isSelectable ? 'cursor-default' : ''}
      `}
      style={{
        backgroundImage: isDead 
          ? 'none'
          : 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Cpath d=\'M10 0v20M0 10h20\' stroke=\'%23ffffff08\' stroke-width=\'0.5\'/%3E%3C/svg%3E")'
      }}
    >
      {/* Corner Runes */}
      <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-amber-600/30" />
      <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-amber-600/30" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-amber-600/30" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-amber-600/30" />
      
      {/* Death Overlay */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <RuneSkull size={size === 'large' ? 48 : 36} className="text-red-800/80" />
        </div>
      )}
      
      {/* Player Name */}
      <div className={`font-medieval text-center mb-1 ${isDead ? 'line-through text-stone-500' : 'text-amber-100'}`}>
        {size === 'compact' ? name.slice(0, 8) : name}
      </div>
      
      {/* Role (GM only) */}
      {showRole && (
        <div className={`text-center text-xs mb-2 ${isDead ? 'text-stone-600' : factionColors.text}`}>
          <span className="mr-1">{getRoleIcon(role)}</span>
          <span className="font-medium">{roleInfo.name || role}</span>
        </div>
      )}
      
      {/* Faction Badge */}
      {showRole && !isDead && (
        <div className={`text-center text-[10px] uppercase tracking-wider ${factionColors.text} opacity-70 mb-2`}>
          {FACTION_NAMES[faction]}
        </div>
      )}
      
      {/* Status Badges */}
      {statuses.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-2">
          {statuses.map((status) => {
            const badge = STATUS_BADGES[status]
            if (!badge) return null
            const Icon = badge.icon
            return (
              <div
                key={status}
                className={`
                  flex items-center gap-1 px-1.5 py-0.5 rounded
                  border ${badge.borderColor} ${badge.bgColor}
                  ${badge.color}
                `}
                title={badge.label}
              >
                <Icon size={iconSizes[size]} />
                {size === 'large' && (
                  <span className="text-[10px]">{badge.label}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
      
      {/* Selection Indicator */}
      {isSelectable && !isDead && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <div className={`
            w-2 h-2 rounded-full transition-all
            ${isSelected ? 'bg-amber-400 shadow-lg shadow-amber-400/50' : 'bg-stone-600'}
          `} />
        </div>
      )}
    </div>
  )
}
