/**
 * GM Handlers
 * 
 * Xử lý tất cả các commands từ Game Master
 */

import { gameStateManager } from '../utils/gameStateManager.js'
import {
  processNightResult,
  processHunterShoot,
  processVoteResult,
  checkWinCondition,
  getWinMessage,
  processLoversChainDeath
} from '../utils/gameLogic.js'

/**
 * Helper: Publish event to Kafka
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

/**
 * Helper: Generate trace ID
 */
function generateTraceId() {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * GM Start Night
 */
export async function handleGMStartNight(roomId, payload, command, producer) {
  console.log(`🌙 GM starting night for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  // Reset night actions
  gameStateManager.resetNightActions(roomId)

  // Move to night phase if needed
  if (game.phase !== 'NIGHT') {
    gameStateManager.updateGame(roomId, { phase: 'NIGHT' })
  }

  // Broadcast event
  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
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

  console.log(`✅ Night ${game.day} started for room ${roomId}`)
}

/**
 * GM Cupid Select Lovers
 */
export async function handleGMCupidSelect(roomId, payload, command, producer) {
  console.log(`💘 GM setting lovers for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { lovers } = payload

  // Validate
  if (!lovers || lovers.length !== 2) {
    throw new Error('Must select exactly 2 lovers')
  }

  if (game.day !== 1) {
    throw new Error('Cupid can only select lovers on night 1')
  }

  if (game.lovers.length > 0) {
    throw new Error('Lovers already selected')
  }

  const [userId1, userId2] = lovers

  const player1 = gameStateManager.getPlayer(roomId, userId1)
  const player2 = gameStateManager.getPlayer(roomId, userId2)

  if (!player1 || !player2 || !player1.isAlive || !player2.isAlive) {
    throw new Error('Invalid lovers selection')
  }

  // Set lovers
  gameStateManager.setLovers(roomId, userId1, userId2)

  const traceId = command.traceId || generateTraceId()

  // Send to lover 1
  await publishEvent(producer, 'evt.broadcast', {
    traceId,
    roomId,
    targetUserId: userId1,
    event: {
      type: 'LOVERS_SELECTED',
      payload: {
        yourLover: {
          userId: player2.userId,
          username: player2.username
        },
        message: `Bạn đã được Cupid chọn làm người yêu với ${player2.username}`
      }
    },
    ts: Date.now()
  })

  // Send to lover 2
  await publishEvent(producer, 'evt.broadcast', {
    traceId,
    roomId,
    targetUserId: userId2,
    event: {
      type: 'LOVERS_SELECTED',
      payload: {
        yourLover: {
          userId: player1.userId,
          username: player1.username
        },
        message: `Bạn đã được Cupid chọn làm người yêu với ${player1.username}`
      }
    },
    ts: Date.now()
  })

  console.log(`✅ Lovers set: ${player1.username} ❤️ ${player2.username}`)
}

/**
 * GM Werewolf Kill
 */
export async function handleGMWerewolfKill(roomId, payload, command, producer) {
  console.log(`🐺 GM recording werewolf kill for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { targetUserId } = payload

  const target = gameStateManager.getPlayer(roomId, targetUserId)
  if (!target || !target.isAlive) {
    throw new Error('Invalid target')
  }

  // Save werewolf target
  game.nightActions.werewolfTarget = targetUserId
  game.lastUpdate = Date.now()

  console.log(`✅ Werewolf targeting: ${target.username}`)
}

/**
 * GM Seer Check
 */
export async function handleGMSeerCheck(roomId, payload, command, producer) {
  console.log(`🔮 GM recording seer check for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { targetUserId } = payload

  const target = gameStateManager.getPlayer(roomId, targetUserId)
  if (!target || !target.isAlive) {
    throw new Error('Invalid target')
  }

  // Check role
  const isWerewolf = ['TRAITOR', 'YOUNG_WOLF', 'DARK_WOLF', 'ALPHA_WOLF', 'PROPHET_WOLF'].includes(target.role)
  const result = isWerewolf ? 'WEREWOLF' : 'VILLAGER'

  // Save checked target
  game.nightActions.seerChecked = targetUserId
  game.lastUpdate = Date.now()

  // Send result to GM
  const gmUserId = command.userId

  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    targetUserId: gmUserId,
    event: {
      type: 'GM_SEER_RESULT',
      payload: {
        checkedPlayer: target.username,
        checkedUserId: target.userId,
        result: result,
        message: `${target.username} là ${result === 'WEREWOLF' ? 'Ma Sói 🐺' : 'Dân Làng 👨‍🌾'}`
      }
    },
    ts: Date.now()
  })

  console.log(`✅ Seer checked ${target.username}: ${result}`)
}

/**
 * GM Bodyguard Protect
 */
export async function handleGMBodyguardProtect(roomId, payload, command, producer) {
  console.log(`🛡️ GM recording bodyguard protection for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { targetUserId } = payload

  const target = gameStateManager.getPlayer(roomId, targetUserId)
  if (!target || !target.isAlive) {
    throw new Error('Invalid target')
  }

  // Validate: không được bảo vệ cùng người 2 đêm liên tiếp
  if (game.lastProtected === targetUserId) {
    throw new Error('Cannot protect same person 2 nights in a row')
  }

  // Save protection
  game.nightActions.protectedPlayer = targetUserId
  game.lastProtected = targetUserId
  game.lastUpdate = Date.now()

  console.log(`✅ Bodyguard protecting: ${target.username}`)
}

/**
 * GM Witch Action
 */
export async function handleGMWitchAction(roomId, payload, command, producer) {
  console.log(`🧙‍♀️ GM recording witch action for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { save, poisonTargetUserId } = payload

  // Handle save
  if (save === true) {
    if (game.witchSkills.saveUsed) {
      throw new Error('Witch save skill already used')
    }

    game.nightActions.witchSaved = true
    game.witchSkills.saveUsed = true
    console.log(`💊 Witch used save skill`)
  }

  // Handle poison
  if (poisonTargetUserId) {
    if (game.witchSkills.poisonUsed) {
      throw new Error('Witch poison skill already used')
    }

    const target = gameStateManager.getPlayer(roomId, poisonTargetUserId)
    if (!target || !target.isAlive) {
      throw new Error('Invalid poison target')
    }

    game.nightActions.poisonedTarget = poisonTargetUserId
    game.witchSkills.poisonUsed = true
    console.log(`☠️ Witch poisoning: ${target.username}`)
  }

  game.lastUpdate = Date.now()
  console.log(`✅ Witch action recorded`)
}

/**
 * GM End Night - Calculate results
 */
export async function handleGMEndNight(roomId, payload, command, producer) {
  console.log(`🌙 GM ending night for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  // Process night result
  const result = processNightResult(roomId)

  const gmUserId = command.userId

  // Send result to GM only
  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    targetUserId: gmUserId,
    event: {
      type: 'GM_NIGHT_RESULT',
      payload: {
        deaths: result.deaths,
        saved: result.saved,
        protected: result.protected,
        message: result.deaths.length === 0
          ? 'Không ai chết đêm qua'
          : `${result.deaths.length} người đã chết`
      }
    },
    ts: Date.now()
  })

  console.log(`✅ Night result sent to GM:`, result)
}

/**
 * GM Announce Deaths
 */
export async function handleGMAnnounceDeaths(roomId, payload, command, producer) {
  console.log(`💀 GM announcing deaths for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { deaths } = payload

  // Broadcast to all
  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    event: {
      type: 'PLAYERS_DIED',
      payload: {
        deaths: deaths || [],
        count: deaths?.length || 0,
        message: deaths?.length === 0
          ? 'Đêm qua yên bình, không ai chết.'
          : `Đêm qua, ${deaths.map(d => d.username).join(', ')} đã chết.`
      }
    },
    ts: Date.now()
  })

  // Check win condition
  const winner = checkWinCondition(roomId)
  if (winner) {
    await handleGameOver(roomId, winner, command, producer)
  }

  console.log(`✅ Deaths announced`)
}

/**
 * GM Start Day
 */
export async function handleGMStartDay(roomId, payload, command, producer) {
  console.log(`☀️ GM starting day for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { duration } = payload

  // Move to day phase
  gameStateManager.nextPhase(roomId)

  // Reset votes
  gameStateManager.resetVotes(roomId)

  // Broadcast
  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    event: {
      type: 'DAY_PHASE_STARTED',
      payload: {
        day: game.day,
        duration: duration || 120,
        message: `Ngày ${game.day} bắt đầu. Thời gian thảo luận: ${duration || 120}s`
      }
    },
    ts: Date.now()
  })

  console.log(`✅ Day ${game.day} started`)
}

/**
 * Player Vote
 */
export async function handlePlayerVote(roomId, payload, command, producer) {
  console.log(`🗳️ Player voting in room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const voterId = command.userId
  const { targetUserId } = payload

  const voter = gameStateManager.getPlayer(roomId, voterId)
  const target = gameStateManager.getPlayer(roomId, targetUserId)

  if (!voter || !voter.isAlive) {
    throw new Error('Voter not alive')
  }

  if (!target || !target.isAlive) {
    throw new Error('Invalid vote target')
  }

  // Record vote
  game.votes.set(voterId, targetUserId)
  game.lastUpdate = Date.now()

  console.log(`✅ ${voter.username} voted for ${target.username}`)

  // Broadcast vote update (optional - có thể ẩn vote)
  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    event: {
      type: 'VOTE_RECORDED',
      payload: {
        voterId: voter.userId,
        voterName: voter.username,
        message: `${voter.username} đã bỏ phiếu`
      }
    },
    ts: Date.now()
  })
}

/**
 * GM End Vote - Process results
 */
export async function handleGMEndVote(roomId, payload, command, producer) {
  console.log(`🗳️ GM ending vote for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  // Process vote result
  const result = processVoteResult(roomId)

  // Broadcast result
  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    event: {
      type: 'VOTE_RESULT',
      payload: {
        hangedPlayer: result.hangedPlayer,
        voteResults: result.voteResults,
        reason: result.reason,
        message: result.hangedPlayer
          ? `${result.hangedPlayer.username} đã bị treo cổ với ${result.voteResults.find(v => v.userId === result.hangedPlayer.userId)?.voteCount} phiếu`
          : result.reason === 'TIE'
            ? 'Hòa phiếu, không ai bị treo cổ'
            : 'Không đủ phiếu, không ai bị treo cổ'
      }
    },
    ts: Date.now()
  })

  console.log(`✅ Vote result:`, result)

  // Check if hanged player was Hunter
  if (result.hangedPlayer && result.hangedPlayer.role === 'MONSTER_HUNTER') {
    // Notify GM that Hunter can shoot
    await publishEvent(producer, 'evt.broadcast', {
      traceId: command.traceId || generateTraceId(),
      roomId,
      targetUserId: command.userId,
      event: {
        type: 'HUNTER_CAN_SHOOT',
        payload: {
          hunterId: result.hangedPlayer.userId,
          hunterName: result.hangedPlayer.username,
          message: `${result.hangedPlayer.username} là Thợ Săn! Được bắn người trước khi chết.`
        }
      },
      ts: Date.now()
    })
  }

  // Check lovers chain death
  if (result.hangedPlayer && result.hangedPlayer.isLovers) {
    const loverDeath = processLoversChainDeath(roomId, result.hangedPlayer.userId)
    if (loverDeath) {
      await publishEvent(producer, 'evt.broadcast', {
        traceId: command.traceId || generateTraceId(),
        roomId,
        event: {
          type: 'PLAYERS_DIED',
          payload: {
            deaths: [loverDeath],
            count: 1,
            message: `${loverDeath.username} chết theo người yêu ${result.hangedPlayer.username}`
          }
        },
        ts: Date.now()
      })
    }
  }

  // Check win condition
  const winner = checkWinCondition(roomId)
  if (winner) {
    await handleGameOver(roomId, winner, command, producer)
  }
}

/**
 * GM Hunter Shoot
 */
export async function handleGMHunterShoot(roomId, payload, command, producer) {
  console.log(`🔫 GM processing hunter shoot for room ${roomId}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) {
    throw new Error('Game not found')
  }

  const { hunterId, targetUserId } = payload

  // Process hunter shoot
  const result = processHunterShoot(roomId, hunterId, targetUserId)

  // Broadcast result
  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    event: {
      type: 'HUNTER_SHOT',
      payload: {
        hunterId,
        deaths: result.deaths,
        chainHunter: result.chainHunter,
        message: result.chainHunter
          ? `Thợ Săn bắn ${result.deaths[0].username}. ${result.chainHunter.username} cũng là Thợ Săn!`
          : `Thợ Săn bắn ${result.deaths[0].username}`
      }
    },
    ts: Date.now()
  })

  console.log(`✅ Hunter shoot result:`, result)

  // If chain hunter, notify GM
  if (result.chainHunter) {
    await publishEvent(producer, 'evt.broadcast', {
      traceId: command.traceId || generateTraceId(),
      roomId,
      targetUserId: command.userId,
      event: {
        type: 'HUNTER_CAN_SHOOT',
        payload: {
          hunterId: result.chainHunter.userId,
          hunterName: result.chainHunter.username,
          message: `${result.chainHunter.username} cũng là Thợ Săn! Được bắn tiếp.`
        }
      },
      ts: Date.now()
    })
  }

  // Check win condition
  const winner = checkWinCondition(roomId)
  if (winner) {
    await handleGameOver(roomId, winner, command, producer)
  }
}

/**
 * Handle Game Over
 */
async function handleGameOver(roomId, winner, command, producer) {
  console.log(`🏁 Game over for room ${roomId}, winner: ${winner}`)

  const game = gameStateManager.getGame(roomId)
  if (!game) return

  gameStateManager.endGame(roomId)

  const alivePlayers = gameStateManager.getAlivePlayers(roomId)

  await publishEvent(producer, 'evt.broadcast', {
    traceId: command.traceId || generateTraceId(),
    roomId,
    event: {
      type: 'GAME_OVER',
      payload: {
        winner,
        message: getWinMessage(winner),
        alivePlayers: alivePlayers.map(p => ({
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

  console.log(`✅ Game over broadcast sent`)
}
