/**
 * Night Phase Wizard - Sequential Role Actions
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * Guides GM through each role's night action in correct order.
 */

import React, { useState, useEffect } from 'react'
import { GAME_PHASE, PHASE_META } from '@/constants/gamePhases'
import { ROLES, FACTION_NAMES } from '@/constants/roles'
import { getRuneIcon, RuneShield, RuneWolfClaw, RuneAllSeeingEye, RunePotion, RuneHeal, RunePoison, RuneLovers } from '@/components/ui/RuneIcons'
import PlayerPanel from './PlayerPanel'

// ═══════════════════════════════════════════════════════════════
// BODYGUARD STEP
// ═══════════════════════════════════════════════════════════════

function BodyguardStep({ players, lastProtected, onSelect, onSkip }) {
  const [selected, setSelected] = useState(null)
  const bodyguard = players.find(p => p.role === 'BODYGUARD' && p.isAlive)
  
  // Players that can be protected (not self, not last protected)
  const selectablePlayers = players
    .filter(p => p.isAlive && p.userId !== bodyguard?.userId && p.userId !== lastProtected)
    .map(p => p.userId)

  if (!bodyguard) {
    return (
      <PhaseContainer phase={GAME_PHASE.NIGHT_BODYGUARD} onSkip={onSkip} skipReason="Không có Bảo Vệ">
        <div className="text-center text-stone-400 py-8">
          <RuneShield size={48} className="mx-auto mb-4 opacity-30" />
          <p>Không có Bảo Vệ trong game này</p>
        </div>
      </PhaseContainer>
    )
  }


  return (
    <PhaseContainer 
      phase={GAME_PHASE.NIGHT_BODYGUARD}
      onConfirm={() => onSelect(selected)}
      canConfirm={!!selected}
    >
      <div className="space-y-4">
        <NarrativeBox>
          <p className="text-amber-200 font-medieval text-lg mb-2">
            "Bảo Vệ, hãy mở mắt..."
          </p>
          <p className="text-stone-300 text-sm">
            Bảo Vệ <span className="text-emerald-400 font-medium">{bodyguard.displayname || bodyguard.username}</span> chọn người để bảo vệ đêm nay.
          </p>
          {lastProtected && (
            <p className="text-amber-500/70 text-xs mt-2">
              ⚠ Không thể bảo vệ cùng một người 2 đêm liên tiếp
            </p>
          )}
        </NarrativeBox>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {players.filter(p => p.isAlive).map(player => {
            const canSelect = selectablePlayers.includes(player.userId)
            const isSelected = selected === player.userId
            return (
              <SelectableCard
                key={player.userId}
                player={player}
                isSelected={isSelected}
                canSelect={canSelect}
                onClick={() => canSelect && setSelected(player.userId)}
                disabledReason={!canSelect ? (player.userId === lastProtected ? 'Đã bảo vệ đêm trước' : 'Không thể chọn') : null}
              />
            )
          })}
        </div>
        
        {selected && (
          <SelectedDisplay 
            player={players.find(p => p.userId === selected)}
            action="sẽ được bảo vệ"
            icon={RuneShield}
            color="blue"
          />
        )}
      </div>
    </PhaseContainer>
  )
}

// ═══════════════════════════════════════════════════════════════
// WEREWOLF STEP
// ═══════════════════════════════════════════════════════════════

function WerewolfStep({ players, onSelect }) {
  const [selected, setSelected] = useState(null)
  const werewolves = players.filter(p => 
    ['ALPHA_WOLF', 'YOUNG_WOLF', 'DARK_WOLF', 'PROPHET_WOLF'].includes(p.role) && p.isAlive
  )
  
  // Werewolves can attack any non-werewolf alive player
  const selectablePlayers = players
    .filter(p => p.isAlive && !['ALPHA_WOLF', 'YOUNG_WOLF', 'DARK_WOLF', 'PROPHET_WOLF'].includes(p.role))
    .map(p => p.userId)

  return (
    <PhaseContainer 
      phase={GAME_PHASE.NIGHT_WEREWOLF}
      onConfirm={() => onSelect(selected)}
      canConfirm={!!selected}
    >
      <div className="space-y-4">
        <NarrativeBox variant="danger">
          <p className="text-red-200 font-medieval text-lg mb-2">
            "Ma Sói, hãy thức dậy và chọn con mồi..."
          </p>
          <p className="text-stone-300 text-sm">
            Bầy sói ({werewolves.map(w => w.displayname || w.username).join(', ')}) thống nhất chọn nạn nhân.
          </p>
        </NarrativeBox>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {players.filter(p => p.isAlive).map(player => {
            const canSelect = selectablePlayers.includes(player.userId)
            const isWolf = ['ALPHA_WOLF', 'YOUNG_WOLF', 'DARK_WOLF', 'PROPHET_WOLF'].includes(player.role)
            const isSelected = selected === player.userId
            return (
              <SelectableCard
                key={player.userId}
                player={player}
                isSelected={isSelected}
                canSelect={canSelect}
                onClick={() => canSelect && setSelected(player.userId)}
                highlight={isWolf ? 'wolf' : null}
                disabledReason={isWolf ? 'Đồng đội' : null}
              />
            )
          })}
        </div>
        
        {selected && (
          <SelectedDisplay 
            player={players.find(p => p.userId === selected)}
            action="sẽ bị tấn công"
            icon={RuneWolfClaw}
            color="red"
          />
        )}
      </div>
    </PhaseContainer>
  )
}


// ═══════════════════════════════════════════════════════════════
// SEER STEP
// ═══════════════════════════════════════════════════════════════

function SeerStep({ players, onSelect, onSkip }) {
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const seer = players.find(p => p.role === 'SEER' && p.isAlive)
  
  const selectablePlayers = players
    .filter(p => p.isAlive && p.userId !== seer?.userId)
    .map(p => p.userId)

  if (!seer) {
    return (
      <PhaseContainer phase={GAME_PHASE.NIGHT_SEER} onSkip={onSkip} skipReason="Thầy Bói đã chết">
        <div className="text-center text-stone-400 py-8">
          <RuneAllSeeingEye size={48} className="mx-auto mb-4 opacity-30" />
          <p>Thầy Bói không còn trong game</p>
        </div>
      </PhaseContainer>
    )
  }

  const selectedPlayer = players.find(p => p.userId === selected)
  const selectedFaction = selectedPlayer ? ROLES[selectedPlayer.role]?.faction : null

  const handleConfirm = () => {
    if (!showResult) {
      setShowResult(true)
    } else {
      onSelect(selected)
    }
  }

  return (
    <PhaseContainer 
      phase={GAME_PHASE.NIGHT_SEER}
      onConfirm={handleConfirm}
      canConfirm={!!selected}
      confirmText={showResult ? 'Tiếp tục' : 'Xem kết quả'}
    >
      <div className="space-y-4">
        <NarrativeBox variant="mystic">
          <p className="text-amber-200 font-medieval text-lg mb-2">
            "Thầy Bói, hãy mở mắt và chọn người để soi..."
          </p>
          <p className="text-stone-300 text-sm">
            Thầy Bói <span className="text-amber-400 font-medium">{seer.displayname || seer.username}</span> chọn một người để xem phe.
          </p>
        </NarrativeBox>
        
        {!showResult ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {players.filter(p => p.isAlive).map(player => {
              const canSelect = selectablePlayers.includes(player.userId)
              const isSelected = selected === player.userId
              return (
                <SelectableCard
                  key={player.userId}
                  player={player}
                  isSelected={isSelected}
                  canSelect={canSelect}
                  onClick={() => canSelect && setSelected(player.userId)}
                  showRole={false}
                />
              )
            })}
          </div>
        ) : (
          /* LARGE FACTION RESULT DISPLAY */
          <SeerResultDisplay 
            player={selectedPlayer}
            faction={selectedFaction}
          />
        )}
      </div>
    </PhaseContainer>
  )
}

// Large Seer Result Component
function SeerResultDisplay({ player, faction }) {
  const factionConfig = {
    VILLAGER: {
      name: 'Phe Dân Làng',
      color: 'emerald',
      bgGradient: 'from-emerald-900/80 via-emerald-800/60 to-emerald-900/80',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-300',
      icon: '🏠',
      message: 'Người này thuộc phe Dân Làng'
    },
    WEREWOLF: {
      name: 'Phe Ma Sói',
      color: 'red',
      bgGradient: 'from-red-900/80 via-red-800/60 to-red-900/80',
      borderColor: 'border-red-500',
      textColor: 'text-red-300',
      icon: '🐺',
      message: 'CẢNH BÁO! Đây là Ma Sói!'
    },
    NEUTRAL: {
      name: 'Phe Độc Lập',
      color: 'amber',
      bgGradient: 'from-amber-900/80 via-amber-800/60 to-amber-900/80',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-300',
      icon: '⚖️',
      message: 'Người này thuộc phe Độc Lập'
    }
  }
  
  const config = factionConfig[faction] || factionConfig.VILLAGER

  return (
    <div className={`
      relative p-8 rounded-xl border-4 ${config.borderColor}
      bg-gradient-to-br ${config.bgGradient}
      shadow-2xl animate-pulse-slow
    `}>
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-400/50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-400/50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-400/50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-400/50" />
      
      <div className="text-center">
        {/* Large Icon */}
        <div className="text-6xl mb-4">{config.icon}</div>
        
        {/* Player Name */}
        <div className="text-2xl font-medieval text-amber-100 mb-2">
          {player?.displayname || player?.username}
        </div>
        
        {/* Faction Name */}
        <div className={`text-3xl font-bold ${config.textColor} mb-4`}>
          {config.name}
        </div>
        
        {/* Message */}
        <div className="text-lg text-stone-300 font-medieval">
          {config.message}
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════
// WITCH STEP
// ═══════════════════════════════════════════════════════════════

function WitchStep({ players, werewolfTarget, witchSkills, onAction, onSkip }) {
  const [action, setAction] = useState('none') // 'save' | 'poison' | 'none'
  const [poisonTarget, setPoisonTarget] = useState(null)
  const witch = players.find(p => p.role === 'WITCH' && p.isAlive)
  const victim = players.find(p => p.userId === werewolfTarget)
  
  const canSave = !witchSkills?.saveUsed && werewolfTarget
  const canPoison = !witchSkills?.poisonUsed
  
  const selectablePlayers = players
    .filter(p => p.isAlive && p.userId !== witch?.userId)
    .map(p => p.userId)

  if (!witch) {
    return (
      <PhaseContainer phase={GAME_PHASE.NIGHT_WITCH} onSkip={onSkip} skipReason="Phù Thủy đã chết">
        <div className="text-center text-stone-400 py-8">
          <RunePotion size={48} className="mx-auto mb-4 opacity-30" />
          <p>Phù Thủy không còn trong game</p>
        </div>
      </PhaseContainer>
    )
  }

  const handleConfirm = () => {
    onAction({
      save: action === 'save',
      poisonTarget: action === 'poison' ? poisonTarget : null
    })
  }

  return (
    <PhaseContainer 
      phase={GAME_PHASE.NIGHT_WITCH}
      onConfirm={handleConfirm}
      canConfirm={action === 'none' || action === 'save' || (action === 'poison' && poisonTarget)}
      confirmText="Xác nhận"
    >
      <div className="space-y-4">
        <NarrativeBox variant="mystic">
          <p className="text-purple-200 font-medieval text-lg mb-2">
            "Phù Thủy, hãy mở mắt..."
          </p>
          <p className="text-stone-300 text-sm">
            Phù Thủy <span className="text-purple-400 font-medium">{witch.displayname || witch.username}</span> quyết định hành động.
          </p>
        </NarrativeBox>
        
        {/* Victim Info */}
        {victim && (
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/30">
            <div className="flex items-center gap-3">
              <RuneWolfClaw size={24} className="text-red-400" />
              <div>
                <div className="text-red-300 font-medium">Nạn nhân đêm nay</div>
                <div className="text-red-100 text-lg font-medieval">
                  {victim.displayname || victim.username}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Skill Status */}
        <div className="flex gap-4">
          <div className={`flex-1 p-3 rounded-lg border ${canSave ? 'border-green-500/30 bg-green-900/20' : 'border-stone-700/30 bg-stone-900/20 opacity-50'}`}>
            <div className="flex items-center gap-2">
              <RuneHeal size={20} className={canSave ? 'text-green-400' : 'text-stone-500'} />
              <span className={canSave ? 'text-green-300' : 'text-stone-500'}>Thuốc Cứu</span>
            </div>
            <div className="text-xs mt-1 text-stone-400">
              {witchSkills?.saveUsed ? 'Đã sử dụng' : 'Còn 1 lần'}
            </div>
          </div>
          <div className={`flex-1 p-3 rounded-lg border ${canPoison ? 'border-purple-500/30 bg-purple-900/20' : 'border-stone-700/30 bg-stone-900/20 opacity-50'}`}>
            <div className="flex items-center gap-2">
              <RunePoison size={20} className={canPoison ? 'text-purple-400' : 'text-stone-500'} />
              <span className={canPoison ? 'text-purple-300' : 'text-stone-500'}>Thuốc Độc</span>
            </div>
            <div className="text-xs mt-1 text-stone-400">
              {witchSkills?.poisonUsed ? 'Đã sử dụng' : 'Còn 1 lần'}
            </div>
          </div>
        </div>
        
        {/* Action Selection */}
        <div className="space-y-2">
          <label className="text-stone-400 text-sm">Chọn hành động:</label>
          <div className="grid grid-cols-3 gap-2">
            <ActionButton
              active={action === 'none'}
              onClick={() => { setAction('none'); setPoisonTarget(null) }}
              disabled={false}
            >
              Không làm gì
            </ActionButton>
            <ActionButton
              active={action === 'save'}
              onClick={() => { setAction('save'); setPoisonTarget(null) }}
              disabled={!canSave}
              variant="success"
            >
              <RuneHeal size={16} className="mr-1" />
              Cứu
            </ActionButton>
            <ActionButton
              active={action === 'poison'}
              onClick={() => setAction('poison')}
              disabled={!canPoison}
              variant="danger"
            >
              <RunePoison size={16} className="mr-1" />
              Đầu độc
            </ActionButton>
          </div>
        </div>
        
        {/* Poison Target Selection */}
        {action === 'poison' && (
          <div className="space-y-2">
            <label className="text-stone-400 text-sm">Chọn mục tiêu đầu độc:</label>
            <div className="grid grid-cols-4 gap-2">
              {players.filter(p => p.isAlive && p.userId !== witch.userId).map(player => (
                <SelectableCard
                  key={player.userId}
                  player={player}
                  isSelected={poisonTarget === player.userId}
                  canSelect={true}
                  onClick={() => setPoisonTarget(player.userId)}
                  size="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PhaseContainer>
  )
}


// ═══════════════════════════════════════════════════════════════
// CUPID STEP (Night 1 only)
// ═══════════════════════════════════════════════════════════════

function CupidStep({ players, onSelect, onSkip }) {
  const [selected, setSelected] = useState([])
  const cupid = players.find(p => p.role === 'CUPID' && p.isAlive)
  
  if (!cupid) {
    return (
      <PhaseContainer phase={GAME_PHASE.NIGHT_CUPID} onSkip={onSkip} skipReason="Không có Cupid">
        <div className="text-center text-stone-400 py-8">
          <RuneLovers size={48} className="mx-auto mb-4 opacity-30" />
          <p>Không có Cupid trong game này</p>
        </div>
      </PhaseContainer>
    )
  }

  const toggleSelect = (userId) => {
    if (selected.includes(userId)) {
      setSelected(selected.filter(id => id !== userId))
    } else if (selected.length < 2) {
      setSelected([...selected, userId])
    }
  }

  return (
    <PhaseContainer 
      phase={GAME_PHASE.NIGHT_CUPID}
      onConfirm={() => onSelect(selected)}
      canConfirm={selected.length === 2}
      confirmText="Ràng buộc"
    >
      <div className="space-y-4">
        <NarrativeBox variant="love">
          <p className="text-pink-200 font-medieval text-lg mb-2">
            "Cupid, hãy mở mắt và chọn hai người yêu..."
          </p>
          <p className="text-stone-300 text-sm">
            Cupid <span className="text-pink-400 font-medium">{cupid.displayname || cupid.username}</span> chọn 2 người để ràng buộc tình yêu.
          </p>
          <p className="text-pink-400/70 text-xs mt-2">
            ⚠ Nếu một người chết, người kia cũng sẽ chết theo
          </p>
        </NarrativeBox>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {players.filter(p => p.isAlive).map(player => {
            const isSelected = selected.includes(player.userId)
            const canSelect = selected.length < 2 || isSelected
            return (
              <SelectableCard
                key={player.userId}
                player={player}
                isSelected={isSelected}
                canSelect={canSelect}
                onClick={() => toggleSelect(player.userId)}
                showRole={false}
              />
            )
          })}
        </div>
        
        {selected.length === 2 && (
          <div className="p-4 rounded-lg bg-pink-900/30 border border-pink-500/30 text-center">
            <RuneLovers size={32} className="mx-auto text-pink-400 mb-2" />
            <div className="text-pink-200 font-medieval">
              {players.find(p => p.userId === selected[0])?.displayname} 
              <span className="text-pink-400 mx-2">♥</span>
              {players.find(p => p.userId === selected[1])?.displayname}
            </div>
            <div className="text-xs text-pink-400/70 mt-1">Sẽ được ràng buộc bởi tình yêu</div>
          </div>
        )}
      </div>
    </PhaseContainer>
  )
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function PhaseContainer({ phase, children, onConfirm, onSkip, canConfirm = true, confirmText = 'Xác nhận', skipReason }) {
  const meta = PHASE_META[phase]
  const Icon = getRuneIcon(meta?.icon)
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-amber-900/30 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-900/50 border-2 border-amber-500/50 flex items-center justify-center">
            <Icon size={24} className="text-amber-300" />
          </div>
          <div>
            <h2 className="font-medieval text-amber-200 text-xl">{meta?.name}</h2>
            <p className="text-stone-400 text-sm">{meta?.description}</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
      
      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-amber-900/30 bg-stone-900/80 flex justify-between">
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-lg border border-stone-600 text-stone-400 hover:bg-stone-800 transition-colors"
          >
            Bỏ qua {skipReason && `(${skipReason})`}
          </button>
        )}
        {onConfirm && (
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`
              px-6 py-2 rounded-lg font-medieval transition-all
              ${canConfirm 
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20' 
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
              }
            `}
          >
            {confirmText}
          </button>
        )}
      </div>
    </div>
  )
}

function NarrativeBox({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-stone-800/50 border-stone-600/30',
    danger: 'bg-red-900/30 border-red-500/30',
    mystic: 'bg-purple-900/30 border-purple-500/30',
    love: 'bg-pink-900/30 border-pink-500/30'
  }
  
  return (
    <div className={`p-4 rounded-lg border ${variants[variant]}`}>
      {children}
    </div>
  )
}


function SelectableCard({ player, isSelected, canSelect, onClick, showRole = true, highlight, disabledReason, size = 'normal' }) {
  const roleInfo = ROLES[player.role] || {}
  
  const highlightClasses = {
    wolf: 'ring-2 ring-red-500/50 bg-red-900/20'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={!canSelect}
      className={`
        relative p-2 rounded-lg border transition-all text-left
        ${isSelected 
          ? 'border-amber-400 bg-amber-900/40 ring-2 ring-amber-400/50' 
          : canSelect
            ? 'border-stone-600/50 bg-stone-800/30 hover:border-amber-500/50 hover:bg-stone-700/30'
            : 'border-stone-700/30 bg-stone-900/30 opacity-50 cursor-not-allowed'
        }
        ${highlight ? highlightClasses[highlight] : ''}
      `}
      title={disabledReason}
    >
      <div className={`font-medium ${size === 'compact' ? 'text-xs' : 'text-sm'} text-amber-100 truncate`}>
        {player.displayname || player.username}
      </div>
      {showRole && (
        <div className="text-xs text-stone-400 truncate">
          {roleInfo.name || player.role}
        </div>
      )}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
          <svg className="w-3 h-3 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}

function SelectedDisplay({ player, action, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-900/30 border-blue-500/30 text-blue-300',
    red: 'bg-red-900/30 border-red-500/30 text-red-300',
    green: 'bg-green-900/30 border-green-500/30 text-green-300',
    purple: 'bg-purple-900/30 border-purple-500/30 text-purple-300'
  }
  
  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} flex items-center gap-3`}>
      <Icon size={24} />
      <div>
        <div className="font-medieval text-lg">{player?.displayname || player?.username}</div>
        <div className="text-sm opacity-70">{action}</div>
      </div>
    </div>
  )
}

function ActionButton({ children, active, onClick, disabled, variant = 'default' }) {
  const variants = {
    default: active ? 'bg-stone-600 border-stone-400' : 'bg-stone-800 border-stone-600 hover:bg-stone-700',
    success: active ? 'bg-green-700 border-green-400' : 'bg-green-900/30 border-green-600/50 hover:bg-green-800/50',
    danger: active ? 'bg-red-700 border-red-400' : 'bg-red-900/30 border-red-600/50 hover:bg-red-800/50'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center px-3 py-2 rounded-lg border transition-all
        ${disabled ? 'opacity-40 cursor-not-allowed' : variants[variant]}
        text-sm font-medium
      `}
    >
      {children}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

export default function NightPhaseWizard({
  currentPhase,
  players,
  nightActions,
  witchSkills,
  dayNumber,
  onPhaseAction
}) {
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case GAME_PHASE.NIGHT_CUPID:
        return (
          <CupidStep
            players={players}
            onSelect={(lovers) => onPhaseAction('CUPID_SELECT', { lovers })}
            onSkip={() => onPhaseAction('SKIP_CUPID')}
          />
        )
      
      case GAME_PHASE.NIGHT_BODYGUARD:
        return (
          <BodyguardStep
            players={players}
            lastProtected={nightActions.lastProtected}
            onSelect={(targetUserId) => onPhaseAction('BODYGUARD_PROTECT', { targetUserId })}
            onSkip={() => onPhaseAction('SKIP_BODYGUARD')}
          />
        )
      
      case GAME_PHASE.NIGHT_WEREWOLF:
        return (
          <WerewolfStep
            players={players}
            onSelect={(targetUserId) => onPhaseAction('WEREWOLF_KILL', { targetUserId })}
          />
        )
      
      case GAME_PHASE.NIGHT_SEER:
        return (
          <SeerStep
            players={players}
            onSelect={(targetUserId) => onPhaseAction('SEER_CHECK', { targetUserId })}
            onSkip={() => onPhaseAction('SKIP_SEER')}
          />
        )
      
      case GAME_PHASE.NIGHT_WITCH:
        return (
          <WitchStep
            players={players}
            werewolfTarget={nightActions.werewolfTarget}
            witchSkills={witchSkills}
            onAction={(action) => onPhaseAction('WITCH_ACTION', action)}
            onSkip={() => onPhaseAction('SKIP_WITCH')}
          />
        )
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-stone-500">
            <p>Phase không xác định: {currentPhase}</p>
          </div>
        )
    }
  }

  return (
    <div className="h-full bg-stone-900/50 border border-amber-900/30 rounded-lg overflow-hidden">
      {renderPhaseContent()}
    </div>
  )
}

export { BodyguardStep, WerewolfStep, SeerStep, WitchStep, CupidStep }
