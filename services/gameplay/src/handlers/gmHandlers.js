/**
 * GM Handlers
 * Xử lý các commands từ Game Master
 */

import gameStateManager from '../utils/gameStateManager.js'
import { validateGMAction, processNightResult, checkWinCondition, processHunterShoot, processLoversChainDeath } from '../utils/gameLogic.js'

/**
 * GM: Bắt đầu đêm
 */
export async function handleGMStartNight(roomId, payload, producer) {
  const game = gameStateManager.getGame(roomId)

  if (!game) {
    throw new Error('Game not found')
  }

  // Reset night actions
  gameStateManager.resetNightActions(roomId)

  // Update phase
  if (game.phase === 'DAY') {
    gameStateManager.nextPhase(roomId)
  }

  console.log(`🌙 GM started Night ${game.day} for room ${roomId}`)

  // Broadcast to all players
  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    event: {
      type: 'NIGHT_PHASE_STARTED',
      payload: {
        day: game.day,
        message: `Đêm ${game.day} bắt đầu. Tất cả ngủ...`
      }
    },
    ts: Date.now()
  })

  return { success: true, day: game.day }
}

/**
 * GM: Cupid chọn Lovers
 */
export async function handleGMCupidSelect(roomId, payload, producer) {
  const { lovers } = payload // [userId1, userId2]

  if (!lovers || lovers.length !== 2) {
    throw new Error('Cupid must select exactly 2 players')
  }

  const validation = validateGMAction(roomId, 'CUPID_SELECT', payload)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const game = gameStateManager.getGame(roomId)
  const [userId1, userId2] = lovers

  const player1 = game.players.find(p => p.userId === userId1)
  const player2 = game.players.find(p => p.userId === userId2)

  if (!player1 || !player2 || !player1.isAlive || !player2.isAlive) {
    throw new Error('Invalid lovers selection')
  }

  // Set lovers
  gameStateManager.setLovers(roomId, userId1, userId2)

  console.log(`💘 Cupid selected lovers: ${player1.username} ❤️ ${player2.username}`)

  // Gửi riêng cho 2 người
  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    targetUserId: userId1,
    event: {
      type: 'LOVERS_SELECTED',
      payload: {
        yourLover: {
          userId: userId2,
          username: player2.username
        },
        message: `Bạn đã được Cupid chọn làm người yêu với ${player2.username}`
      }
    },
    ts: Date.now()
  })

  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    targetUserId: userId2,
    event: {
      type: 'LOVERS_SELECTED',
      payload: {
        yourLover: {
          userId: userId1,
          username: player1.username
        },
        message: `Bạn đã được Cupid chọn làm người yêu với ${player1.username}`
      }
    },
    ts: Date.now()
  })

  return { success: true, lovers: [player1.username, player2.username] }
}

/**
 * GM: Werewolf giết
 */
export async function handleGMWerewolfKill(roomId, payload, producer) {
  const { targetUserId } = payload

  const game = gameStateManager.getGame(roomId)
  const target = game.players.find(p => p.userId === targetUserId)

  if (!target || !target.isAlive) {
    throw new Error('Invalid werewolf target')
  }

  // Save target
  game.nightActions.werewolfTarget = targetUserId
  game.lastUpdate = Date.now()

  console.log(`🐺 Werewolves chose to kill: ${target.username}`)

  return { success: true, target: target.username }
}

/**
 * GM: Seer xem vai trò
 */
export async function handleGMSeerCheck(roomId, payload, producer, gmUserId) {
  const { targetUserId } = payload

  const game = gameStateManager.getGame(roomId)
  const target = game.players.find(p => p.userId === targetUserId)

  if (!target || !target.isAlive) {
    throw new Error('Invalid seer target')
  }

  // Save checked target
  game.nightActions.seerChecked = targetUserId
  game.lastUpdate = Date.now()

  // Determine result
  const isWerewolf = target.role === 'WEREWOLF'
  const result = isWerewolf ? 'WEREWOLF' : 'VILLAGER'

  console.log(`🔮 Seer checked ${target.username}: ${result}`)

  // Gửi kết quả riêng cho GM
  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    targetUserId: gmUserId,
    event: {
      type: 'GM_SEER_RESULT',
      payload: {
        checkedPlayer: target.username,
        checkedUserId: targetUserId,
        result,
        message: isWerewolf ? `${target.username} là Ma Sói 🐺` : `${target.username} là Dân Làng 👨‍🌾`
      }
    },
    ts: Date.now()
  })

  return {
    success: true,
    target: target.username,
    result
  }
}

/**
 * GM: Bodyguard bảo vệ
 */
export async function handleGMBodyguardProtect(roomId, payload, producer) {
  const { targetUserId } = payload

  const validation = validateGMAction(roomId, 'BODYGUARD_PROTECT', { targetUserId })
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const game = gameStateManager.getGame(roomId)
  const target = game.players.find(p => p.userId === targetUserId)

  if (!target || !target.isAlive) {
    throw new Error('Invalid bodyguard target')
  }

  // Save protected player
  game.nightActions.protectedPlayer = targetUserId
  game.lastProtected = targetUserId
  game.lastUpdate = Date.now()

  console.log(`🛡️ Bodyguard protects: ${target.username}`)

  return { success: true, target: target.username }
}

/**
 * GM: Witch hành động (cứu/độc)
 */
export async function handleGMWitchAction(roomId, payload, producer) {
  const { save, poisonTargetUserId } = payload

  const game = gameStateManager.getGame(roomId)

  // Xử lý cứu
  if (save) {
    const validation = validateGMAction(roomId, 'WITCH_SAVE', {})
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    game.nightActions.witchSaved = true
    game.witchSkills.saveUsed = true
    console.log('💊 Witch used SAVE potion')
  }

  // Xử lý độc
  if (poisonTargetUserId) {
    const validation = validateGMAction(roomId, 'WITCH_POISON', {})
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const target = game.players.find(p => p.userId === poisonTargetUserId)
    if (!target || !target.isAlive) {
      throw new Error('Invalid poison target')
    }

    game.nightActions.poisonedTarget = poisonTargetUserId
    game.witchSkills.poisonUsed = true
    console.log(`☠️ Witch poisoned: ${target.username}`)
  }

  game.lastUpdate = Date.now()

  return {
    success: true,
    saved: save,
    poisoned: poisonTargetUserId ? game.players.find(p => p.userId === poisonTargetUserId)?.username : null
  }
}

/**
 * GM: Kết thúc đêm và tính toán kết quả
 */
export async function handleGMEndNight(roomId, payload, producer, gmUserId) {
  const game = gameStateManager.getGame(roomId)

  // Xử lý kết quả đêm
  const nightResult = processNightResult(roomId)
  const { deaths, saved, protected } = nightResult

  console.log('🌙 Night result:', nightResult)

  // Gửi kết quả riêng cho GM
  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    targetUserId: gmUserId,
    event: {
      type: 'GM_NIGHT_RESULT',
      payload: {
        deaths: deaths.map(d => ({
          userId: d.userId,
          username: d.username,
          cause: d.cause
        })),
        saved: saved.map(id => {
          const p = game.players.find(player => player.userId === id)
          return { userId: id, username: p?.username }
        }),
        protected: protected.map(id => {
          const p = game.players.find(player => player.userId === id)
          return { userId: id, username: p?.username }
        }),
        message: deaths.length === 0 ? 'Không ai chết đêm qua' : `${deaths.length} người đã chết`
      }
    },
    ts: Date.now()
  })

  return nightResult
}

/**
 * GM: Công bố người chết cho tất cả
 */
export async function handleGMAnnounceDeaths(roomId, payload, producer) {
  const { deaths } = payload // [{ userId, username, cause }]

  const game = gameStateManager.getGame(roomId)

  console.log(`📢 GM announces deaths:`, deaths)

  // Broadcast cho tất cả
  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    event: {
      type: 'PLAYERS_DIED',
      payload: {
        deaths: deaths.map(d => ({
          userId: d.userId,
          username: d.username,
          // Không tiết lộ cause và role cho players (tùy rule)
        })),
        count: deaths.length,
        message: deaths.length === 0
          ? 'Đêm qua yên bình, không ai chết.'
          : `Đêm qua, ${deaths.map(d => d.username).join(', ')} đã chết.`
      }
    },
    ts: Date.now()
  })

  // Check win condition
  const winCondition = checkWinCondition(roomId)
  if (winCondition) {
    await handleGameOver(roomId, winCondition, producer)
  }

  return { success: true, deaths }
}

/**
 * GM: Bắt đầu ngày (thảo luận)
 */
export async function handleGMStartDay(roomId, payload, producer) {
  const game = gameStateManager.getGame(roomId)

  // Update phase to DAY
  if (game.phase === 'NIGHT') {
    gameStateManager.nextPhase(roomId)
  }

  const { duration = 120 } = payload // Default 2 phút

  console.log(`☀️ GM started Day ${game.day} for room ${roomId}`)

  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    event: {
      type: 'DAY_PHASE_STARTED',
      payload: {
        day: game.day,
        duration,
        message: `Ngày ${game.day} bắt đầu. Thời gian thảo luận: ${duration}s`
      }
    },
    ts: Date.now()
  })

  return { success: true, day: game.day, duration }
}

/**
 * GM: Hunter bắn
 */
export async function handleGMHunterShoot(roomId, payload, producer) {
  const { hunterId, targetUserId } = payload

  const result = processHunterShoot(roomId, hunterId, targetUserId)
  const { deaths, chainHunter } = result

  console.log(`🎯 Hunter shot result:`, result)

  // Broadcast deaths
  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    event: {
      type: 'HUNTER_SHOT',
      payload: {
        hunterId,
        deaths: deaths.map(d => ({
          userId: d.userId,
          username: d.username,
          cause: d.cause
        })),
        chainHunter: chainHunter ? {
          userId: chainHunter.userId,
          username: chainHunter.username,
          message: `${chainHunter.username} cũng là Thợ Săn! Được bắn tiếp...`
        } : null
      }
    },
    ts: Date.now()
  })

  // Check win condition
  const winCondition = checkWinCondition(roomId)
  if (winCondition) {
    await handleGameOver(roomId, winCondition, producer)
  }

  return result
}

/**
 * Handle game over
 */
async function handleGameOver(roomId, winCondition, producer) {
  const game = gameStateManager.getGame(roomId)

  game.phase = 'ENDED'
  game.lastUpdate = Date.now()

  console.log(`🏆 Game Over - Room ${roomId}:`, winCondition)

  await publishEvent(producer, 'evt.broadcast', {
    traceId: generateTraceId(),
    roomId,
    event: {
      type: 'GAME_OVER',
      payload: {
        winner: winCondition.winner,
        message: winCondition.message,
        alivePlayers: gameStateManager.getAlivePlayers(roomId).map(p => ({
          userId: p.userId,
          username: p.username,
          role: p.role
        })),
        allPlayers: game.players.map(p => ({
          userId: p.userId,
          username: p.username,
          role: p.role,
          isAlive: p.isAlive
        }))
      }
    },
    ts: Date.now()
  })
}

/**
 * Publish event to Kafka
 */
async function publishEvent(producer, topic, event) {
  try {
    await producer.send({
      topic,
      messages: [{
        value: JSON.stringify(event)
      }]
    })
  } catch (err) {
    console.error('Failed to publish event:', err)
    throw err
  }
}

function generateTraceId() {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
