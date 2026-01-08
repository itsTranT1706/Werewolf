/**
 * Game Logic
 * 
 * Xử lý logic game: tính kết quả đêm, check win condition, vote logic
 */

import { gameStateManager } from './gameStateManager.js'
import { FACTION } from '../constants/roles.js'

/**
 * Xử lý kết quả đêm
 * Trả về { deaths: [], saved: [], protected: [] }
 */
export function processNightResult(roomId) {
  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const deaths = []
  const saved = []
  const protectedPlayers = []

  const {
    werewolfTarget,
    seerChecked,
    protectedPlayer,
    witchSaved,
    poisonedTarget
  } = game.nightActions

  // 1. Xử lý Werewolf target
  if (werewolfTarget) {
    const target = gameStateManager.getPlayer(roomId, werewolfTarget)

    if (target && target.isAlive) {
      let isDead = true

      // Check Witch save
      if (witchSaved) {
        isDead = false
        saved.push({
          userId: target.userId,
          username: target.username,
          savedBy: 'WITCH'
        })
        console.log(`💊 Witch saved ${target.username}`)
      }

      // Check Bodyguard protection
      if (protectedPlayer === werewolfTarget) {
        isDead = false
        protectedPlayers.push({
          userId: target.userId,
          username: target.username,
          protectedBy: 'BODYGUARD'
        })
        console.log(`🛡️ Bodyguard protected ${target.username}`)
      }

      // Kill if not saved or protected
      if (isDead) {
        gameStateManager.killPlayer(roomId, werewolfTarget, 'WEREWOLF_KILL')
        deaths.push({
          userId: target.userId,
          username: target.username,
          role: target.role,
          cause: 'WEREWOLF_KILL'
        })

        // Check lovers chain death
        if (target.isLovers) {
          const loverDeath = processLoversChainDeath(roomId, target.userId)
          if (loverDeath) {
            deaths.push(loverDeath)
          }
        }
      }
    }
  }

  // 2. Xử lý Poison target (nếu có)
  if (poisonedTarget) {
    const target = gameStateManager.getPlayer(roomId, poisonedTarget)

    if (target && target.isAlive) {
      gameStateManager.killPlayer(roomId, poisonedTarget, 'POISONED')
      deaths.push({
        userId: target.userId,
        username: target.username,
        role: target.role,
        cause: 'POISONED'
      })

      // Check lovers chain death
      if (target.isLovers) {
        const loverDeath = processLoversChainDeath(roomId, target.userId)
        if (loverDeath) {
          deaths.push(loverDeath)
        }
      }
    }
  }

  return {
    deaths,
    saved,
    protected: protectedPlayers
  }
}

/**
 * Xử lý lovers chain death
 * Trả về death object hoặc null
 */
export function processLoversChainDeath(roomId, deadUserId) {
  const game = gameStateManager.getGame(roomId)
  if (!game) return null

  const deadPlayer = gameStateManager.getPlayer(roomId, deadUserId)
  if (!deadPlayer || !deadPlayer.isLovers) return null

  const loverUserId = deadPlayer.loversWith
  const lover = gameStateManager.getPlayer(roomId, loverUserId)

  if (!lover || !lover.isAlive) return null

  // Lover chết theo
  gameStateManager.killPlayer(roomId, loverUserId, 'LOVERS_SUICIDE')
  console.log(`💔 ${lover.username} died following their lover ${deadPlayer.username}`)

  return {
    userId: lover.userId,
    username: lover.username,
    role: lover.role,
    cause: 'LOVERS_SUICIDE'
  }
}

/**
 * Xử lý Hunter shoot
 * Trả về { deaths: [], chainHunter: null | { userId, username } }
 */
export function processHunterShoot(roomId, hunterId, targetUserId) {
  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const hunter = gameStateManager.getPlayer(roomId, hunterId)
  if (!hunter || hunter.role !== 'MONSTER_HUNTER') {
    throw new Error('Invalid hunter')
  }

  const target = gameStateManager.getPlayer(roomId, targetUserId)
  if (!target || !target.isAlive) {
    throw new Error('Invalid target')
  }

  const deaths = []

  // Kill target
  gameStateManager.killPlayer(roomId, targetUserId, 'HUNTER_SHOT')
  deaths.push({
    userId: target.userId,
    username: target.username,
    role: target.role,
    cause: 'HUNTER_SHOT'
  })

  // Check if target is also Hunter → chain reaction
  let chainHunter = null
  if (target.role === 'MONSTER_HUNTER') {
    chainHunter = {
      userId: target.userId,
      username: target.username
    }
    console.log(`🔫 Chain reaction! ${target.username} is also a Hunter`)
  }

  // Check lovers chain death
  if (target.isLovers) {
    const loverDeath = processLoversChainDeath(roomId, target.userId)
    if (loverDeath) {
      deaths.push(loverDeath)
    }
  }

  return {
    deaths,
    chainHunter
  }
}

/**
 * Xử lý vote kết quả
 * Trả về { hangedPlayer, voteResults: [{ userId, votedFor, voteCount }] }
 */
export function processVoteResult(roomId) {
  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const alivePlayers = gameStateManager.getAlivePlayers(roomId)
  const voteCounts = new Map()

  // Count votes
  for (const [voterId, targetId] of game.votes.entries()) {
    const voter = gameStateManager.getPlayer(roomId, voterId)
    if (!voter || !voter.isAlive) continue

    // Mayor có 2 phiếu
    const voteWeight = voter.role === 'MAYOR' ? 2 : 1

    const currentCount = voteCounts.get(targetId) || 0
    voteCounts.set(targetId, currentCount + voteWeight)
  }

  // Find player with most votes
  let maxVotes = 0
  let hangedPlayerId = null
  let isTie = false

  for (const [playerId, count] of voteCounts.entries()) {
    if (count > maxVotes) {
      maxVotes = count
      hangedPlayerId = playerId
      isTie = false
    } else if (count === maxVotes && count > 0) {
      isTie = true
    }
  }

  // Prepare vote results
  const voteResults = alivePlayers.map(p => ({
    userId: p.userId,
    username: p.username,
    votedFor: game.votes.get(p.userId) || null,
    voteCount: voteCounts.get(p.userId) || 0
  }))

  // Tie → no one hanged
  if (isTie || !hangedPlayerId || maxVotes === 0) {
    return {
      hangedPlayer: null,
      voteResults,
      reason: isTie ? 'TIE' : 'NO_MAJORITY'
    }
  }

  const hangedPlayer = gameStateManager.getPlayer(roomId, hangedPlayerId)
  gameStateManager.killPlayer(roomId, hangedPlayerId, 'HANGED')

  return {
    hangedPlayer: {
      userId: hangedPlayer.userId,
      username: hangedPlayer.username,
      role: hangedPlayer.role
    },
    voteResults
  }
}

/**
 * Check win condition
 * Trả về 'VILLAGER' | 'WEREWOLF' | 'NEUTRAL' | null
 */
export function checkWinCondition(roomId) {
  const game = gameStateManager.getGame(roomId)
  if (!game) return null

  const alivePlayers = gameStateManager.getAlivePlayers(roomId)

  // Count factions
  const factionCounts = {
    VILLAGER: 0,
    WEREWOLF: 0,
    NEUTRAL: 0
  }

  for (const player of alivePlayers) {
    const faction = getFactionForPlayer(player.role)
    factionCounts[faction]++
  }

  console.log('📊 Faction counts:', factionCounts)

  // Werewolves win if no villagers left
  if (factionCounts.VILLAGER === 0 && factionCounts.WEREWOLF > 0) {
    return 'WEREWOLF'
  }

  // Villagers win if no werewolves left
  if (factionCounts.WEREWOLF === 0) {
    // Check if Serial Killer or Fool won
    if (factionCounts.NEUTRAL > 0) {
      // Check specific neutral roles
      const neutralPlayer = alivePlayers.find(p => getFactionForPlayer(p.role) === 'NEUTRAL')
      if (neutralPlayer?.role === 'SERIAL_KILLER') {
        return 'SERIAL_KILLER'
      }
      if (neutralPlayer?.role === 'FOOL') {
        return 'FOOL'
      }
    }
    return 'VILLAGER'
  }

  // Werewolves win if they equal or outnumber villagers
  if (factionCounts.WEREWOLF >= factionCounts.VILLAGER) {
    return 'WEREWOLF'
  }

  // Game continues
  return null
}

/**
 * Get faction for player role
 */
function getFactionForPlayer(role) {
  // Werewolf roles
  if (['TRAITOR', 'YOUNG_WOLF', 'DARK_WOLF', 'ALPHA_WOLF', 'PROPHET_WOLF'].includes(role)) {
    return 'WEREWOLF'
  }

  // Neutral roles
  if (['FOOL', 'SERIAL_KILLER'].includes(role)) {
    return 'NEUTRAL'
  }

  // Default to villager
  return 'VILLAGER'
}

/**
 * Get win message
 */
export function getWinMessage(winner) {
  const messages = {
    'VILLAGER': 'Phe Dân Làng thắng! Tất cả Ma Sói đã bị tiêu diệt.',
    'WEREWOLF': 'Phe Ma Sói thắng! Dân làng đã bị tiêu diệt.',
    'SERIAL_KILLER': 'Sát Nhân Hàng Loạt thắng! Tất cả người khác đã chết.',
    'FOOL': 'Thằng Ngố thắng! (Được treo cổ)',
    'LOVERS': 'Cặp Đôi thắng! Chỉ còn 2 người yêu sống sót.'
  }

  return messages[winner] || 'Game kết thúc'
}
