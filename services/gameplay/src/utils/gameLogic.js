/**
 * Game Logic Utilities
 * Xử lý logic game: tính toán kết quả đêm, check thắng thua, xử lý deaths
 */

import gameStateManager from './gameStateManager.js'

/**
 * Xử lý kết quả ban đêm
 * Tính toán ai sống, ai chết dựa trên các night actions
 */
export function processNightResult(roomId) {
  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error(`Game not found: ${roomId}`)
  }

  const { nightActions, players } = game
  const deaths = []
  const saved = []
  const protected = []

  // 1. Xử lý Werewolf target
  if (nightActions.werewolfTarget) {
    const targetId = nightActions.werewolfTarget
    const target = players.find(p => p.userId === targetId)

    if (target && target.isAlive) {
      let isDead = true

      // Check if Witch saved
      if (nightActions.witchSaved) {
        isDead = false
        saved.push(targetId)
        console.log(`✅ ${target.username} được Phù thủy cứu`)
      }

      // Check if Bodyguard protected
      if (nightActions.protectedPlayer === targetId) {
        isDead = false
        protected.push(targetId)
        console.log(`🛡️ ${target.username} được Bảo vệ cứu`)
      }

      if (isDead) {
        gameStateManager.killPlayer(roomId, targetId, 'WEREWOLF_KILL')
        deaths.push({
          userId: targetId,
          username: target.username,
          cause: 'WEREWOLF_KILL'
        })
        console.log(`💀 ${target.username} bị Sói giết`)
      }
    }
  }

  // 2. Xử lý Witch poison
  if (nightActions.poisonedTarget) {
    const targetId = nightActions.poisonedTarget
    const target = players.find(p => p.userId === targetId)

    if (target && target.isAlive) {
      gameStateManager.killPlayer(roomId, targetId, 'POISONED')
      deaths.push({
        userId: targetId,
        username: target.username,
        cause: 'POISONED'
      })
      console.log(`💀 ${target.username} bị Phù thủy độc`)
    }
  }

  // 3. Xử lý Lovers chain death
  const loversChainDeaths = processLoversChainDeath(roomId, deaths)
  deaths.push(...loversChainDeaths)

  return {
    deaths,
    saved,
    protected: protected.filter(id => !deaths.find(d => d.userId === id))
  }
}

/**
 * Xử lý chain death của Lovers
 * Nếu 1 người chết → người yêu chết theo
 */
export function processLoversChainDeath(roomId, initialDeaths) {
  const game = gameStateManager.getGame(roomId)
  if (!game || !game.lovers.length) return []

  const chainDeaths = []
  const [lover1, lover2] = game.lovers

  // Check nếu 1 trong 2 lovers chết
  for (const death of initialDeaths) {
    if (death.userId === lover1 || death.userId === lover2) {
      const survivingLoverId = death.userId === lover1 ? lover2 : lover1
      const survivingLover = game.players.find(p => p.userId === survivingLoverId)

      if (survivingLover && survivingLover.isAlive) {
        gameStateManager.killPlayer(roomId, survivingLoverId, 'LOVERS_SUICIDE')
        chainDeaths.push({
          userId: survivingLoverId,
          username: survivingLover.username,
          cause: 'LOVERS_SUICIDE'
        })
        console.log(`💔 ${survivingLover.username} tự sát vì người yêu chết`)
      }
      break // Chỉ xử lý 1 lần
    }
  }

  return chainDeaths
}

/**
 * Xử lý Hunter bắn khi chết
 */
export function processHunterShoot(roomId, hunterId, targetId) {
  const game = gameStateManager.getGame(roomId)
  const target = game.players.find(p => p.userId === targetId)

  if (!target || !target.isAlive) {
    throw new Error('Invalid hunter target')
  }

  // Kill target
  gameStateManager.killPlayer(roomId, targetId, 'HUNTER_SHOT')
  const deaths = [{
    userId: targetId,
    username: target.username,
    cause: 'HUNTER_SHOT'
  }]

  // Check lovers chain
  const loversChainDeaths = processLoversChainDeath(roomId, deaths)
  deaths.push(...loversChainDeaths)

  // Check if target is also a Hunter → chain reaction
  if (target.role === 'HUNTER') {
    console.log(`⚠️ Hunter chain detected: ${target.username} is also a Hunter!`)
    // Return info to trigger another hunter shot
    return {
      deaths,
      chainHunter: {
        userId: targetId,
        username: target.username
      }
    }
  }

  return { deaths, chainHunter: null }
}

/**
 * Check điều kiện thắng thua
 */
export function checkWinCondition(roomId) {
  const game = gameStateManager.getGame(roomId)
  const alivePlayers = gameStateManager.getAlivePlayers(roomId)

  // No one left → draw?
  if (alivePlayers.length === 0) {
    return {
      winner: 'DRAW',
      message: 'Tất cả đã chết. Trận đấu hòa!'
    }
  }

  // Lovers win
  if (game.lovers.length === 2) {
    const [lover1, lover2] = game.lovers
    const lover1Alive = alivePlayers.find(p => p.userId === lover1)
    const lover2Alive = alivePlayers.find(p => p.userId === lover2)

    if (lover1Alive && lover2Alive && alivePlayers.length === 2) {
      return {
        winner: 'LOVERS',
        message: 'Cặp đôi tình nhân thắng!',
        players: [lover1Alive, lover2Alive]
      }
    }
  }

  // Count werewolves vs villagers
  const werewolves = alivePlayers.filter(p => p.role === 'WEREWOLF')
  const villagers = alivePlayers.filter(p => p.role !== 'WEREWOLF')

  // Werewolves win
  if (werewolves.length >= villagers.length) {
    return {
      winner: 'WEREWOLF',
      message: 'Phe Ma Sói thắng!',
      werewolves
    }
  }

  // Villagers win
  if (werewolves.length === 0) {
    return {
      winner: 'VILLAGER',
      message: 'Phe Dân Làng thắng! Tất cả Sói đã chết.',
      villagers
    }
  }

  // Game continues
  return null
}

/**
 * Get role name (Vietnamese)
 */
export function getRoleName(roleId) {
  const roleMap = {
    'BODYGUARD': 'Bảo Vệ',
    'SEER': 'Tiên Tri',
    'WITCH': 'Phù Thủy',
    'WEREWOLF': 'Ma Sói',
    'VILLAGER': 'Dân Làng',
    'CUPID': 'Cupid',
    'MAYOR': 'Trưởng Làng',
    'HUNTER': 'Thợ Săn'
  }
  return roleMap[roleId] || roleId
}

/**
 * Validate GM action based on game state
 */
export function validateGMAction(roomId, actionType, payload) {
  const game = gameStateManager.getGame(roomId)

  if (!game) {
    return { valid: false, error: 'Game not found' }
  }

  switch (actionType) {
    case 'CUPID_SELECT':
      if (game.day !== 1 || game.phase !== 'NIGHT') {
        return { valid: false, error: 'Cupid chỉ chọn ở đêm đầu tiên' }
      }
      if (game.lovers.length > 0) {
        return { valid: false, error: 'Đã chọn Lovers rồi' }
      }
      break

    case 'BODYGUARD_PROTECT':
      if (payload.targetUserId === game.lastProtected) {
        return { valid: false, error: 'Không được bảo vệ cùng 1 người 2 đêm liên tiếp' }
      }
      break

    case 'WITCH_SAVE':
      if (game.witchSkills.saveUsed) {
        return { valid: false, error: 'Phù thủy đã dùng thuốc cứu rồi' }
      }
      break

    case 'WITCH_POISON':
      if (game.witchSkills.poisonUsed) {
        return { valid: false, error: 'Phù thủy đã dùng thuốc độc rồi' }
      }
      break
  }

  return { valid: true }
}

/**
 * Get faction from role
 */
export function getFactionFromRole(role) {
  if (role === 'WEREWOLF') return 'WEREWOLF'
  return 'VILLAGER' // Tất cả role khác đều là phe Dân
}
