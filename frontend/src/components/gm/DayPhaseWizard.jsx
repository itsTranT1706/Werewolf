/**
 * Day Phase Wizard - Dawn Narrative & Voting
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * Handles day phase: death announcements, discussion, voting, execution.
 */

import React, { useState, useMemo } from 'react'
import { GAME_PHASE, PHASE_META, generateDawnNarrative } from '@/constants/gamePhases'
import { ROLES } from '@/constants/roles'
import { getRuneIcon, RuneSun, RuneSkull, RuneVote, RuneGallows, RuneArrow } from '@/components/ui/RuneIcons'

// ═══════════════════════════════════════════════════════════════
// DAWN ANNOUNCEMENT - Narrative Script
// ═══════════════════════════════════════════════════════════════

function DawnStep({ nightResult, onContinue }) {
  const narrative = useMemo(() => generateDawnNarrative(nightResult), [nightResult])
  
  return (
    <PhaseContainer 
      phase={GAME_PHASE.DAY_DAWN}
      onConfirm={onContinue}
      confirmText="Bắt đầu thảo luận"
    >
      <div className="space-y-6">
        {/* Narrative Script Box */}
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-amber-900/40 via-stone-900/60 to-amber-900/40 border-2 border-amber-600/40">
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-amber-500/50" />
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-amber-500/50" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-amber-500/50" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-amber-500/50" />
          
          <div className="text-center mb-4">
            <RuneSun size={48} className="mx-auto text-amber-400 mb-2" />
            <h3 className="font-medieval text-2xl text-amber-200">{narrative.title}</h3>
          </div>
          
          {/* Script to read aloud */}
          <div className="bg-stone-900/50 rounded-lg p-4 border border-amber-700/30">
            <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-2">
              📜 Đọc cho người chơi:
            </div>
            <p className="text-lg text-amber-100 font-medieval leading-relaxed italic">
              "{narrative.script}"
            </p>
          </div>
        </div>
        
        {/* Death Summary */}
        {narrative.deaths.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-stone-400 text-sm font-medieval flex items-center gap-2">
              <RuneSkull size={16} />
              Người đã khuất đêm qua
            </h4>
            <div className="grid gap-2">
              {narrative.deaths.map((death, idx) => (
                <DeathCard key={idx} death={death} />
              ))}
            </div>
          </div>
        )}
        
        {/* Peaceful Night */}
        {narrative.deaths.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌅</div>
            <p className="text-emerald-400 font-medieval text-xl">Một đêm bình yên</p>
            <p className="text-stone-400 text-sm mt-2">Không ai bị hại đêm qua</p>
          </div>
        )}
      </div>
    </PhaseContainer>
  )
}


function DeathCard({ death }) {
  const roleInfo = ROLES[death.role] || {}
  const causeText = {
    'WEREWOLF_KILL': 'Bị Ma Sói giết',
    'POISONED': 'Bị đầu độc',
    'LOVER_DEATH': 'Chết vì mất người yêu',
    'HUNTER_SHOT': 'Bị Thợ Săn bắn',
    'EXECUTED': 'Bị treo cổ'
  }
  
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
      <RuneSkull size={32} className="text-red-400 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medieval text-red-200 text-lg">{death.username}</div>
        <div className="text-sm text-stone-400">
          {roleInfo.name || death.role} • {causeText[death.cause] || death.cause}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DISCUSSION PHASE
// ═══════════════════════════════════════════════════════════════

function DiscussionStep({ onStartVote }) {
  const [timer, setTimer] = useState(null)
  
  return (
    <PhaseContainer 
      phase={GAME_PHASE.DAY_DISCUSSION}
      onConfirm={onStartVote}
      confirmText="Bắt đầu bỏ phiếu"
    >
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="font-medieval text-2xl text-amber-200 mb-2">Thời Gian Thảo Luận</h3>
          <p className="text-stone-400">
            Dân làng đang thảo luận để tìm ra kẻ đáng ngờ...
          </p>
        </div>
        
        {/* Discussion Tips */}
        <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-600/30">
          <h4 className="text-amber-400 font-medieval mb-3">📜 Gợi ý cho Quản Trò:</h4>
          <ul className="space-y-2 text-sm text-stone-300">
            <li>• Để người chơi tự do thảo luận và đưa ra nghi ngờ</li>
            <li>• Nhắc nhở không được tiết lộ vai trò trực tiếp</li>
            <li>• Khi thảo luận đủ, bắt đầu bỏ phiếu</li>
          </ul>
        </div>
      </div>
    </PhaseContainer>
  )
}

// ═══════════════════════════════════════════════════════════════
// VOTING PHASE
// ═══════════════════════════════════════════════════════════════

function VoteStep({ players, onEndVote }) {
  const [votes, setVotes] = useState({}) // { voterId: targetId }
  const alivePlayers = players.filter(p => p.isAlive)
  
  const handleVote = (voterId, targetId) => {
    setVotes(prev => ({
      ...prev,
      [voterId]: targetId
    }))
  }
  
  // Calculate vote results
  const voteResults = useMemo(() => {
    const counts = {}
    Object.values(votes).forEach(targetId => {
      if (targetId) {
        // Check if voter is Mayor (double vote)
        const voter = players.find(p => Object.keys(votes).find(vid => votes[vid] === targetId && vid === p.userId))
        const voteWeight = voter?.role === 'MAYOR' ? 2 : 1
        counts[targetId] = (counts[targetId] || 0) + voteWeight
      }
    })
    return counts
  }, [votes, players])
  
  const maxVotes = Math.max(0, ...Object.values(voteResults))
  const topVoted = Object.entries(voteResults)
    .filter(([_, count]) => count === maxVotes)
    .map(([userId]) => userId)
  
  const isTie = topVoted.length > 1
  const votedPlayer = !isTie && topVoted[0] ? players.find(p => p.userId === topVoted[0]) : null

  return (
    <PhaseContainer 
      phase={GAME_PHASE.DAY_VOTE}
      onConfirm={() => onEndVote(votes, votedPlayer)}
      confirmText={isTie ? 'Hòa - Không ai bị treo' : 'Xác nhận kết quả'}
      canConfirm={Object.keys(votes).length > 0}
    >
      <div className="space-y-4">
        <div className="bg-stone-800/50 rounded-lg p-4 border border-amber-600/30">
          <div className="flex items-center gap-2 mb-2">
            <RuneVote size={20} className="text-amber-400" />
            <span className="text-amber-200 font-medieval">Bỏ Phiếu Treo Cổ</span>
          </div>
          <p className="text-sm text-stone-400">
            Nhập phiếu bầu của từng người chơi. Thị Trưởng có 2 phiếu.
          </p>
        </div>
        
        {/* Vote Input Grid */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {alivePlayers.map(voter => (
            <div key={voter.userId} className="flex items-center gap-3 p-2 rounded bg-stone-800/30">
              <div className="w-32 truncate text-sm text-amber-100">
                {voter.displayname || voter.username}
                {voter.role === 'MAYOR' && <span className="text-amber-400 ml-1">👑</span>}
              </div>
              <span className="text-stone-500">→</span>
              <select
                value={votes[voter.userId] || ''}
                onChange={(e) => handleVote(voter.userId, e.target.value)}
                className="flex-1 bg-stone-700 border border-stone-600 rounded px-2 py-1 text-sm text-stone-200"
              >
                <option value="">Không bỏ phiếu</option>
                {alivePlayers.filter(p => p.userId !== voter.userId).map(target => (
                  <option key={target.userId} value={target.userId}>
                    {target.displayname || target.username}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        {/* Vote Results */}
        {Object.keys(voteResults).length > 0 && (
          <div className="bg-stone-900/50 rounded-lg p-4 border border-stone-600/30">
            <h4 className="text-stone-400 text-sm mb-3">Kết quả:</h4>
            <div className="space-y-2">
              {Object.entries(voteResults)
                .sort(([,a], [,b]) => b - a)
                .map(([userId, count]) => {
                  const player = players.find(p => p.userId === userId)
                  const isTop = count === maxVotes
                  return (
                    <div 
                      key={userId}
                      className={`flex items-center justify-between p-2 rounded ${isTop ? 'bg-red-900/30 border border-red-500/30' : 'bg-stone-800/30'}`}
                    >
                      <span className={isTop ? 'text-red-200' : 'text-stone-300'}>
                        {player?.displayname || player?.username}
                      </span>
                      <span className={`font-bold ${isTop ? 'text-red-400' : 'text-stone-400'}`}>
                        {count} phiếu
                      </span>
                    </div>
                  )
                })}
            </div>
            
            {isTie && (
              <div className="mt-3 p-2 rounded bg-amber-900/30 border border-amber-500/30 text-center">
                <span className="text-amber-300">⚖️ Hòa phiếu - Không ai bị treo cổ</span>
              </div>
            )}
          </div>
        )}
      </div>
    </PhaseContainer>
  )
}


// ═══════════════════════════════════════════════════════════════
// EXECUTION PHASE
// ═══════════════════════════════════════════════════════════════

function ExecutionStep({ executedPlayer, onConfirm }) {
  const roleInfo = ROLES[executedPlayer?.role] || {}
  const isHunter = executedPlayer?.role === 'MONSTER_HUNTER'
  
  return (
    <PhaseContainer 
      phase={GAME_PHASE.DAY_EXECUTION}
      onConfirm={onConfirm}
      confirmText={isHunter ? 'Thợ Săn bắn' : 'Tiếp tục'}
    >
      <div className="space-y-6">
        {/* Execution Announcement */}
        <div className="relative p-8 rounded-xl bg-gradient-to-br from-red-900/40 via-stone-900/60 to-red-900/40 border-2 border-red-600/40 text-center">
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-red-500/50" />
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-red-500/50" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-red-500/50" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-red-500/50" />
          
          <RuneGallows size={64} className="mx-auto text-red-400 mb-4" />
          
          <h3 className="font-medieval text-3xl text-red-200 mb-2">
            {executedPlayer?.displayname || executedPlayer?.username}
          </h3>
          
          <p className="text-red-400 text-xl font-medieval mb-4">
            Đã bị treo cổ
          </p>
          
          {/* Role Reveal */}
          <div className="inline-block px-4 py-2 rounded-lg bg-stone-900/50 border border-stone-600/30">
            <span className="text-stone-400 text-sm">Vai trò: </span>
            <span className="text-amber-200 font-medieval">{roleInfo.name || executedPlayer?.role}</span>
          </div>
        </div>
        
        {/* Narrative Script */}
        <div className="bg-stone-900/50 rounded-lg p-4 border border-amber-700/30">
          <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-2">
            📜 Đọc cho người chơi:
          </div>
          <p className="text-lg text-amber-100 font-medieval leading-relaxed italic">
            "Dân làng đã quyết định. {executedPlayer?.displayname || executedPlayer?.username} bị kết tội và bị treo cổ. 
            Khi linh hồn rời khỏi thể xác, sự thật được phơi bày - 
            {roleInfo.faction === 'WEREWOLF' 
              ? ' đây là một Ma Sói! Dân làng đã trừ được một mối họa.' 
              : roleInfo.faction === 'NEUTRAL'
                ? ' đây là một kẻ Độc Lập...'
                : ' đây chỉ là một dân làng vô tội... Một sai lầm đáng tiếc.'
            }"
          </p>
        </div>
        
        {/* Hunter Warning */}
        {isHunter && (
          <div className="p-4 rounded-lg bg-orange-900/30 border border-orange-500/30">
            <div className="flex items-center gap-3">
              <RuneArrow size={32} className="text-orange-400" />
              <div>
                <div className="text-orange-200 font-medieval text-lg">Thợ Săn Báo Thù!</div>
                <div className="text-orange-300/70 text-sm">
                  Thợ Săn có thể bắn một người trước khi chết
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PhaseContainer>
  )
}

// ═══════════════════════════════════════════════════════════════
// HUNTER REVENGE PHASE
// ═══════════════════════════════════════════════════════════════

function HunterStep({ players, hunter, onShoot }) {
  const [target, setTarget] = useState(null)
  const alivePlayers = players.filter(p => p.isAlive && p.userId !== hunter?.userId)
  
  return (
    <PhaseContainer 
      phase={GAME_PHASE.DAY_HUNTER}
      onConfirm={() => onShoot(target)}
      confirmText="Bắn"
      canConfirm={!!target}
    >
      <div className="space-y-6">
        <div className="text-center">
          <RuneArrow size={64} className="mx-auto text-orange-400 mb-4" />
          <h3 className="font-medieval text-2xl text-orange-200 mb-2">
            Thợ Săn Báo Thù
          </h3>
          <p className="text-stone-400">
            {hunter?.displayname || hunter?.username} chọn một người để bắn
          </p>
        </div>
        
        {/* Target Selection */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {alivePlayers.map(player => (
            <button
              key={player.userId}
              onClick={() => setTarget(player.userId)}
              className={`
                p-3 rounded-lg border transition-all text-center
                ${target === player.userId
                  ? 'border-orange-400 bg-orange-900/40 ring-2 ring-orange-400/50'
                  : 'border-stone-600/50 bg-stone-800/30 hover:border-orange-500/50'
                }
              `}
            >
              <div className="font-medium text-amber-100 truncate">
                {player.displayname || player.username}
              </div>
            </button>
          ))}
        </div>
        
        {target && (
          <div className="p-4 rounded-lg bg-orange-900/30 border border-orange-500/30 text-center">
            <RuneArrow size={24} className="mx-auto text-orange-400 mb-2" />
            <div className="text-orange-200 font-medieval">
              {players.find(p => p.userId === target)?.displayname} sẽ bị bắn
            </div>
          </div>
        )}
      </div>
    </PhaseContainer>
  )
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function PhaseContainer({ phase, children, onConfirm, canConfirm = true, confirmText = 'Tiếp tục' }) {
  const meta = PHASE_META[phase]
  const Icon = getRuneIcon(meta?.icon)
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-amber-900/30 bg-gradient-to-r from-amber-900/30 via-stone-800 to-amber-900/30">
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
      
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
      
      <div className="px-6 py-4 border-t border-amber-900/30 bg-stone-900/80 flex justify-end">
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
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

export default function DayPhaseWizard({
  currentPhase,
  players,
  nightResult,
  executedPlayer,
  hunter,
  onPhaseAction
}) {
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case GAME_PHASE.DAY_DAWN:
        return (
          <DawnStep
            nightResult={nightResult}
            onContinue={() => onPhaseAction('START_DISCUSSION')}
          />
        )
      
      case GAME_PHASE.DAY_DISCUSSION:
        return (
          <DiscussionStep
            onStartVote={() => onPhaseAction('START_VOTE')}
          />
        )
      
      case GAME_PHASE.DAY_VOTE:
        return (
          <VoteStep
            players={players}
            onEndVote={(votes, votedPlayer) => onPhaseAction('END_VOTE', { votes, votedPlayer })}
          />
        )
      
      case GAME_PHASE.DAY_EXECUTION:
        return (
          <ExecutionStep
            executedPlayer={executedPlayer}
            onConfirm={() => onPhaseAction('CONFIRM_EXECUTION')}
          />
        )
      
      case GAME_PHASE.DAY_HUNTER:
        return (
          <HunterStep
            players={players}
            hunter={hunter}
            onShoot={(targetUserId) => onPhaseAction('HUNTER_SHOOT', { targetUserId })}
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

export { DawnStep, DiscussionStep, VoteStep, ExecutionStep, HunterStep }
