/**
 * GM Interface Page - Game Master Control Center
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * The sacred ritual table for the Game Master.
 * Two-panel layout: Player Panel (left) + Event Timeline/Wizard (right)
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSocket } from '@/api/socket'
import { getRoomSocket } from '@/api/roomSocket'
import useGameMaster from '@/hooks/useGameMaster'
import { GAME_PHASE, PHASE_META, isNightPhase, isDayPhase } from '@/constants/gamePhases'

// Components
import PlayerPanel from '@/components/gm/PlayerPanel'
import PhaseTimeline from '@/components/gm/PhaseTimeline'
import NightPhaseWizard from '@/components/gm/NightPhaseWizard'
import DayPhaseWizard from '@/components/gm/DayPhaseWizard'
import GameOverScreen from '@/components/gm/GameOverScreen'
import { RuneMoon, RuneSun, RuneCrown } from '@/components/ui/RuneIcons'

export default function GMInterfacePage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  
  // Players state (from room/game)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roomCode, setRoomCode] = useState(null)
  
  // Game Master hook
  const {
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
    startNight,
    handlePhaseAction,
    goToPhase,
    isNightPhase: isNight,
    isDayPhase: isDay
  } = useGameMaster(roomId, players)
  
  // Selected player for actions
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)

  
  // Load players from localStorage and socket
  useEffect(() => {
    // First, try to load from localStorage (saved when game started)
    const savedData = localStorage.getItem(`gm_data_${roomId}`)
    if (savedData) {
      try {
        const gmData = JSON.parse(savedData)
        console.log('📦 Loaded GM data from localStorage:', gmData)
        if (gmData.players && gmData.players.length > 0) {
          setPlayers(gmData.players)
          setRoomCode(gmData.roomCode)
        }
      } catch (err) {
        console.error('Failed to parse GM data:', err)
      }
    }
    
    // Connect to room socket for real-time updates
    const roomSocket = getRoomSocket()
    const apiSocket = getSocket()
    
    // Listen for role assignments (GM gets all)
    const handleRoleAssignmentList = (data) => {
      console.log('🎭 Role assignments received:', data)
      const assignments = data.assignments || data.payload?.assignments || []
      
      if (assignments.length > 0) {
        setPlayers(prev => {
          const updated = prev.map(p => {
            const assignment = assignments.find(a => 
              (a.userId && String(a.userId) === String(p.userId)) ||
              (a.username && String(a.username) === String(p.username))
            )
            if (assignment) {
              return { 
                ...p, 
                role: assignment.roleId || assignment.role,
                roleName: assignment.roleName
              }
            }
            return p
          })
          console.log('📊 Updated players with roles:', updated)
          return updated
        })
        setLoading(false)
      }
    }
    
    // Listen for player death updates
    const handlePlayersDied = (data) => {
      console.log('💀 Players died:', data)
      const deaths = data.deaths || data.payload?.deaths || []
      
      if (deaths.length > 0) {
        setPlayers(prev => prev.map(p => {
          const died = deaths.find(d => 
            (d.userId && String(d.userId) === String(p.userId)) ||
            (d.username && String(d.username) === String(p.username))
          )
          return died ? { ...p, isAlive: false } : p
        }))
      }
    }
    
    // Listen on both sockets
    roomSocket.on('GAME_ROLE_ASSIGNMENT_LIST', handleRoleAssignmentList)
    apiSocket.on('GAME_ROLE_ASSIGNMENT_LIST', handleRoleAssignmentList)
    roomSocket.on('PLAYERS_DIED', handlePlayersDied)
    apiSocket.on('PLAYERS_DIED', handlePlayersDied)
    
    // Set loading to false after a timeout if no data received
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)
    
    return () => {
      clearTimeout(timeout)
      roomSocket.off('GAME_ROLE_ASSIGNMENT_LIST', handleRoleAssignmentList)
      apiSocket.off('GAME_ROLE_ASSIGNMENT_LIST', handleRoleAssignmentList)
      roomSocket.off('PLAYERS_DIED', handlePlayersDied)
      apiSocket.off('PLAYERS_DIED', handlePlayersDied)
    }
  }, [roomId])
  
  // Determine which wizard to show
  const renderWizard = () => {
    if (currentPhase === GAME_PHASE.LOBBY || currentPhase === GAME_PHASE.ROLE_ASSIGNMENT) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-stone-900/50 border border-amber-900/30 rounded-lg p-8">
          <RuneCrown size={64} className="text-amber-400/50 mb-6" />
          <h2 className="font-medieval text-2xl text-amber-200 mb-4">Chuẩn Bị Nghi Lễ</h2>
          <p className="text-stone-400 text-center mb-8 max-w-md">
            Khi tất cả người chơi đã sẵn sàng và vai trò đã được phân, 
            hãy bắt đầu đêm đầu tiên.
          </p>
          <button
            onClick={startNight}
            disabled={players.length < 3}
            className={`
              px-8 py-4 rounded-xl font-medieval text-xl transition-all
              ${players.length >= 3
                ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30 border-2 border-purple-400/30'
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
              }
            `}
          >
            <RuneMoon size={24} className="inline mr-3" />
            Bắt Đầu Đêm 1
          </button>
          {players.length < 3 && (
            <p className="text-red-400/70 text-sm mt-4">
              Cần ít nhất 3 người chơi để bắt đầu
            </p>
          )}
        </div>
      )
    }
    
    if (isNight) {
      return (
        <NightPhaseWizard
          currentPhase={currentPhase}
          players={players}
          nightActions={nightActions}
          witchSkills={witchSkills}
          dayNumber={dayNumber}
          onPhaseAction={handlePhaseAction}
        />
      )
    }
    
    if (isDay) {
      return (
        <DayPhaseWizard
          currentPhase={currentPhase}
          players={players}
          nightResult={nightResult}
          executedPlayer={executedPlayer}
          hunter={hunterPending}
          onPhaseAction={handlePhaseAction}
        />
      )
    }
    
    // Night End - transition to day
    if (currentPhase === GAME_PHASE.NIGHT_END) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-stone-900/50 border border-amber-900/30 rounded-lg p-8">
          <RuneSun size={64} className="text-amber-400 mb-6" />
          <h2 className="font-medieval text-2xl text-amber-200 mb-4">Đêm Kết Thúc</h2>
          <p className="text-stone-400 text-center mb-8">
            Tất cả hành động đêm đã được ghi nhận. Bình minh đang đến...
          </p>
          <button
            onClick={() => handlePhaseAction('END_NIGHT')}
            className="px-8 py-4 rounded-xl font-medieval text-xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 hover:from-amber-600 hover:via-orange-500 hover:to-amber-600 text-white shadow-lg shadow-amber-500/30 border-2 border-amber-400/30"
          >
            <RuneSun size={24} className="inline mr-3" />
            Công Bố Kết Quả
          </button>
        </div>
      )
    }
    
    // Day End - check win or next night
    if (currentPhase === GAME_PHASE.DAY_END) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-stone-900/50 border border-amber-900/30 rounded-lg p-8">
          <RuneMoon size={64} className="text-indigo-400 mb-6" />
          <h2 className="font-medieval text-2xl text-amber-200 mb-4">Ngày Kết Thúc</h2>
          <p className="text-stone-400 text-center mb-8">
            Mặt trời lặn, bóng tối lại bao trùm ngôi làng...
          </p>
          <button
            onClick={() => handlePhaseAction('END_DAY')}
            className="px-8 py-4 rounded-xl font-medieval text-xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30 border-2 border-purple-400/30"
          >
            <RuneMoon size={24} className="inline mr-3" />
            Bắt Đầu Đêm {dayNumber + 1}
          </button>
        </div>
      )
    }
    
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <RuneCrown size={64} className="mx-auto text-amber-400/50 animate-pulse mb-4" />
          <p className="text-amber-200 font-medieval">Đang tải nghi lễ...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-stone-950 text-stone-100"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at top, rgba(120, 53, 15, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at bottom, rgba(30, 27, 75, 0.2) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23ffffff03' stroke-width='1'/%3E%3C/svg%3E")
        `
      }}
    >
      {/* Game Over Overlay */}
      {gameOver && (
        <GameOverScreen
          winner={winner}
          players={players}
          onNewGame={() => window.location.reload()}
          onBackToLobby={() => navigate('/game')}
        />
      )}
      
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-stone-900/80 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/room/${roomId}`)}
              className="flex items-center gap-2 text-stone-400 hover:text-amber-200 transition-colors"
            >
              <span className="text-lg">←</span>
            </button>
            <h1 className="font-medieval text-xl text-amber-200">
              ⚔ Bàn Quản Trò
            </h1>
            <div className="h-6 w-px bg-amber-900/50" />
            <span className="text-stone-400 text-sm">
              Phòng: <span className="text-amber-300 font-mono">{roomCode || roomId}</span>
            </span>
            <span className="text-stone-500 text-xs">
              ({players.length} người chơi)
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Phase Indicator */}
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border
              ${isNight 
                ? 'bg-indigo-900/30 border-indigo-500/30 text-indigo-300' 
                : 'bg-amber-900/30 border-amber-500/30 text-amber-300'
              }
            `}>
              {isNight ? <RuneMoon size={18} /> : <RuneSun size={18} />}
              <span className="font-medieval">
                {isNight ? `Đêm ${dayNumber}` : `Ngày ${dayNumber}`}
              </span>
            </div>
            
            {/* Current Phase */}
            <div className="text-sm text-stone-400">
              {PHASE_META[currentPhase]?.name || currentPhase}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content - Two Panel Layout */}
      <main className="max-w-[1800px] mx-auto p-4 h-[calc(100vh-64px)]">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Panel - Players */}
          <div className="col-span-4 xl:col-span-3">
            <PlayerPanel
              players={players}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
              nightActions={nightActions}
              showRoles={true}
              title="Các Linh Hồn"
            />
          </div>
          
          {/* Center Panel - Wizard */}
          <div className="col-span-5 xl:col-span-6">
            {renderWizard()}
          </div>
          
          {/* Right Panel - Timeline */}
          <div className="col-span-3">
            <PhaseTimeline
              currentPhase={currentPhase}
              completedPhases={completedPhases}
              skippedPhases={skippedPhases}
              activeRoles={activeRoles}
              dayNumber={dayNumber}
              onPhaseClick={(phase) => {
                // Allow GM to jump to completed phases for review
                if (completedPhases.includes(phase)) {
                  console.log('Review phase:', phase)
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
