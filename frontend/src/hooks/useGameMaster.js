/**
 * useGameMaster Hook - Game State Management for GM Interface
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * Manages local game state and communicates with backend via socket.
 * Does NOT alter any game logic - only tracks state for UI.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { getSocket } from '@/api/socket'
import { 
  GAME_PHASE, 
  getActiveNightPhases,
  isNightPhase,
  isDayPhase,
  canTransitionTo 
} from '@/constants/gamePhases'

const initialNightActions = {
  protectedPlayer: null,
  werewolfTarget: null,
  seerChecked: null,
  witchSaved: false,
  poisonedTarget: null,
  lovers: [],
  lastProtected: null,
  hunterTarget: null
}

export default function useGameMaster(roomId, players = [], roleAssignments = []) {
  // Core game state
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASE.LOBBY)
  const [dayNumber, setDayNumber] = useState(1)
  const [completedPhases, setCompletedPhases] = useState([])
  const [skippedPhases, setSkippedPhases] = useState([])
  
  // Night tracking
  const [nightActions, setNightActions] = useState(initialNightActions)
  const [nightResult, setNightResult] = useState({ deaths: [], saved: [], protected: [] })
  
  // Witch skills tracking
  const [witchSkills, setWitchSkills] = useState({ saveUsed: false, poisonUsed: false })
  
  // Day tracking
  const [executedPlayer, setExecutedPlayer] = useState(null)
  const [hunterPending, setHunterPending] = useState(null)
  
  // Game end
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  
  // Socket ref
  const socketRef = useRef(null)
  
  // Get active roles in game
  const activeRoles = players.map(p => p.role).filter(Boolean)
  
  // Initialize socket listeners
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket
    
    // Listen for game events from backend
    socket.on('NIGHT_PHASE_STARTED', (data) => {
      console.log('🌙 Night started:', data)
      setCurrentPhase(GAME_PHASE.NIGHT_START)
      setDayNumber(data.day || dayNumber)
    })
    
    socket.on('GM_NIGHT_RESULT', (data) => {
      console.log('📊 Night result:', data)
      setNightResult(data)
    })
    
    socket.on('DAY_PHASE_STARTED', (data) => {
      console.log('☀️ Day started:', data)
      setCurrentPhase(GAME_PHASE.DAY_DAWN)
    })
    
    socket.on('GAME_OVER', (data) => {
      console.log('🏆 Game over:', data)
      setGameOver(true)
      setWinner(data.winner)
    })
    
    return () => {
      socket.off('NIGHT_PHASE_STARTED')
      socket.off('GM_NIGHT_RESULT')
      socket.off('DAY_PHASE_STARTED')
      socket.off('GAME_OVER')
    }
  }, [dayNumber])

  
  // Send command to backend
  const sendCommand = useCallback((actionType, payload = {}) => {
    const socket = socketRef.current
    if (!socket) return
    
    socket.emit('GAME_ACTION', {
      roomId,
      action: {
        type: actionType,
        payload
      }
    })
    
    console.log('📤 Sent command:', actionType, payload)
  }, [roomId])
  
  // Phase transition helper
  const goToPhase = useCallback((phase) => {
    if (canTransitionTo(currentPhase, phase) || true) { // Allow any transition for GM control
      setCompletedPhases(prev => [...prev, currentPhase])
      setCurrentPhase(phase)
    }
  }, [currentPhase])
  
  // ═══════════════════════════════════════════════════════════════
  // NIGHT PHASE HANDLERS
  // ═══════════════════════════════════════════════════════════════
  
  const startNight = useCallback(() => {
    // Reset night actions
    setNightActions({
      ...initialNightActions,
      lastProtected: nightActions.protectedPlayer, // Remember last protected
      lovers: nightActions.lovers // Keep lovers
    })
    setNightResult({ deaths: [], saved: [], protected: [] })
    setCompletedPhases([])
    setSkippedPhases([])
    
    // Determine first night phase
    const nightPhases = getActiveNightPhases(activeRoles, dayNumber === 1)
    const firstPhase = nightPhases[1] || GAME_PHASE.NIGHT_BODYGUARD // Skip NIGHT_START
    
    setCurrentPhase(firstPhase)
    sendCommand('GM_START_NIGHT', { day: dayNumber })
  }, [activeRoles, dayNumber, nightActions.protectedPlayer, nightActions.lovers, sendCommand])
  
  const handleBodyguardProtect = useCallback((targetUserId) => {
    setNightActions(prev => ({ ...prev, protectedPlayer: targetUserId }))
    sendCommand('GM_BODYGUARD_PROTECT', { targetUserId })
    goToPhase(GAME_PHASE.NIGHT_WEREWOLF)
  }, [sendCommand, goToPhase])
  
  const handleWerewolfKill = useCallback((targetUserId) => {
    setNightActions(prev => ({ ...prev, werewolfTarget: targetUserId }))
    sendCommand('GM_WEREWOLF_KILL', { targetUserId })
    goToPhase(GAME_PHASE.NIGHT_SEER)
  }, [sendCommand, goToPhase])
  
  const handleSeerCheck = useCallback((targetUserId) => {
    setNightActions(prev => ({ ...prev, seerChecked: targetUserId }))
    sendCommand('GM_SEER_CHECK', { targetUserId })
    goToPhase(GAME_PHASE.NIGHT_WITCH)
  }, [sendCommand, goToPhase])
  
  const handleWitchAction = useCallback(({ save, poisonTarget }) => {
    setNightActions(prev => ({
      ...prev,
      witchSaved: save,
      poisonedTarget: poisonTarget
    }))
    
    if (save) {
      setWitchSkills(prev => ({ ...prev, saveUsed: true }))
    }
    if (poisonTarget) {
      setWitchSkills(prev => ({ ...prev, poisonUsed: true }))
    }
    
    sendCommand('GM_WITCH_ACTION', { save, poisonTarget })
    goToPhase(GAME_PHASE.NIGHT_END)
  }, [sendCommand, goToPhase])
  
  const handleCupidSelect = useCallback((lovers) => {
    setNightActions(prev => ({ ...prev, lovers }))
    sendCommand('GM_CUPID_SELECT', { lovers })
    goToPhase(GAME_PHASE.NIGHT_BODYGUARD)
  }, [sendCommand, goToPhase])
  
  const endNight = useCallback(() => {
    sendCommand('GM_END_NIGHT')
    // Backend will calculate and send GM_NIGHT_RESULT
    goToPhase(GAME_PHASE.DAY_DAWN)
  }, [sendCommand, goToPhase])
  
  // ═══════════════════════════════════════════════════════════════
  // DAY PHASE HANDLERS
  // ═══════════════════════════════════════════════════════════════
  
  const startDiscussion = useCallback(() => {
    sendCommand('GM_START_DAY', { day: dayNumber })
    goToPhase(GAME_PHASE.DAY_DISCUSSION)
  }, [sendCommand, goToPhase, dayNumber])
  
  const startVote = useCallback(() => {
    goToPhase(GAME_PHASE.DAY_VOTE)
  }, [goToPhase])
  
  const endVote = useCallback((votes, votedPlayer) => {
    sendCommand('GM_END_VOTE', { votes })
    
    if (votedPlayer) {
      setExecutedPlayer(votedPlayer)
      goToPhase(GAME_PHASE.DAY_EXECUTION)
    } else {
      // Tie - no execution
      goToPhase(GAME_PHASE.DAY_END)
    }
  }, [sendCommand, goToPhase])
  
  const confirmExecution = useCallback(() => {
    const isHunter = executedPlayer?.role === 'MONSTER_HUNTER'
    
    if (isHunter) {
      setHunterPending(executedPlayer)
      goToPhase(GAME_PHASE.DAY_HUNTER)
    } else {
      goToPhase(GAME_PHASE.DAY_END)
    }
  }, [executedPlayer, goToPhase])
  
  const handleHunterShoot = useCallback((targetUserId) => {
    setNightActions(prev => ({ ...prev, hunterTarget: targetUserId }))
    sendCommand('GM_HUNTER_SHOOT', { targetUserId })
    setHunterPending(null)
    goToPhase(GAME_PHASE.DAY_END)
  }, [sendCommand, goToPhase])
  
  const endDay = useCallback(() => {
    // Check win condition (backend handles this)
    // If no winner, start next night
    setDayNumber(prev => prev + 1)
    setExecutedPlayer(null)
    startNight()
  }, [startNight])
  
  // ═══════════════════════════════════════════════════════════════
  // PHASE ACTION DISPATCHER
  // ═══════════════════════════════════════════════════════════════
  
  const handlePhaseAction = useCallback((action, payload = {}) => {
    console.log('🎮 Phase action:', action, payload)
    
    switch (action) {
      // Night actions
      case 'CUPID_SELECT':
        handleCupidSelect(payload.lovers)
        break
      case 'SKIP_CUPID':
        goToPhase(GAME_PHASE.NIGHT_BODYGUARD)
        break
      case 'BODYGUARD_PROTECT':
        handleBodyguardProtect(payload.targetUserId)
        break
      case 'SKIP_BODYGUARD':
        goToPhase(GAME_PHASE.NIGHT_WEREWOLF)
        break
      case 'WEREWOLF_KILL':
        handleWerewolfKill(payload.targetUserId)
        break
      case 'SEER_CHECK':
        handleSeerCheck(payload.targetUserId)
        break
      case 'SKIP_SEER':
        goToPhase(GAME_PHASE.NIGHT_WITCH)
        break
      case 'WITCH_ACTION':
        handleWitchAction(payload)
        break
      case 'SKIP_WITCH':
        goToPhase(GAME_PHASE.NIGHT_END)
        break
      case 'END_NIGHT':
        endNight()
        break
        
      // Day actions
      case 'START_DISCUSSION':
        startDiscussion()
        break
      case 'START_VOTE':
        startVote()
        break
      case 'END_VOTE':
        endVote(payload.votes, payload.votedPlayer)
        break
      case 'CONFIRM_EXECUTION':
        confirmExecution()
        break
      case 'HUNTER_SHOOT':
        handleHunterShoot(payload.targetUserId)
        break
      case 'END_DAY':
        endDay()
        break
        
      default:
        console.warn('Unknown action:', action)
    }
  }, [
    handleCupidSelect, handleBodyguardProtect, handleWerewolfKill,
    handleSeerCheck, handleWitchAction, endNight,
    startDiscussion, startVote, endVote, confirmExecution,
    handleHunterShoot, endDay, goToPhase
  ])
  
  return {
    // State
    currentPhase,
    dayNumber,
    completedPhases,
    skippedPhases,
    nightActions,
    nightResult,
    witchSkills,
    executedPlayer,
    hunterPending,
    gameOver,
    winner,
    activeRoles,
    
    // Actions
    startNight,
    handlePhaseAction,
    goToPhase,
    
    // Helpers
    isNightPhase: isNightPhase(currentPhase),
    isDayPhase: isDayPhase(currentPhase)
  }
}
