/**
 * Game State Manager
 * Quản lý trạng thái của từng room/game
 */

class GameStateManager {
  constructor() {
    // Map<roomId, GameState>
    this.games = new Map()
  }

  /**
   * Tạo game state mới khi game bắt đầu
   */
  createGame(roomId, players, roleAssignments) {
    const gameState = {
      roomId,
      phase: 'NIGHT', // NIGHT | DAY | ENDED
      day: 1,

      // Players info
      players: players.map((p, index) => ({
        userId: p.userId,
        username: p.username,
        role: roleAssignments[index],
        isAlive: true,
        isLovers: false,
        loversWith: null
      })),

      // Night actions
      nightActions: {
        werewolfTarget: null,
        seerChecked: null,
        protectedPlayer: null,
        witchSaved: false,
        poisonedTarget: null
      },

      // Persistent data
      lovers: [], // [userId1, userId2]
      lastProtected: null, // Bodyguard không được bảo vệ cùng người 2 đêm liên tiếp

      // Witch skills
      witchSkills: {
        saveUsed: false,
        poisonUsed: false
      },

      // Deaths history
      deaths: [],

      // Vote data (ban ngày)
      votes: {}, // { voterId: targetId }

      // Tracking
      createdAt: Date.now(),
      lastUpdate: Date.now()
    }

    this.games.set(roomId, gameState)
    return gameState
  }

  /**
   * Lấy game state
   */
  getGame(roomId) {
    return this.games.get(roomId)
  }

  /**
   * Cập nhật game state
   */
  updateGame(roomId, updates) {
    const game = this.games.get(roomId)
    if (!game) {
      throw new Error(`Game not found: ${roomId}`)
    }

    Object.assign(game, updates, { lastUpdate: Date.now() })
    return game
  }

  /**
   * Xóa game (khi kết thúc)
   */
  deleteGame(roomId) {
    this.games.delete(roomId)
  }

  /**
   * Get player by userId
   */
  getPlayer(roomId, userId) {
    const game = this.getGame(roomId)
    if (!game) return null
    return game.players.find(p => p.userId === userId)
  }

  /**
   * Get alive players
   */
  getAlivePlayers(roomId) {
    const game = this.getGame(roomId)
    if (!game) return []
    return game.players.filter(p => p.isAlive)
  }

  /**
   * Get dead players
   */
  getDeadPlayers(roomId) {
    const game = this.getGame(roomId)
    if (!game) return []
    return game.players.filter(p => !p.isAlive)
  }

  /**
   * Mark player as dead
   */
  killPlayer(roomId, userId, cause) {
    const game = this.getGame(roomId)
    const player = game.players.find(p => p.userId === userId)

    if (!player || !player.isAlive) {
      return null
    }

    player.isAlive = false
    game.deaths.push({
      userId,
      username: player.username,
      role: player.role,
      day: game.day,
      phase: game.phase,
      cause,
      timestamp: Date.now()
    })

    game.lastUpdate = Date.now()
    return player
  }

  /**
   * Reset night actions
   */
  resetNightActions(roomId) {
    const game = this.getGame(roomId)
    game.nightActions = {
      werewolfTarget: null,
      seerChecked: null,
      protectedPlayer: null,
      witchSaved: false,
      poisonedTarget: null
    }
    game.lastUpdate = Date.now()
  }

  /**
   * Reset day votes
   */
  resetVotes(roomId) {
    const game = this.getGame(roomId)
    game.votes = {}
    game.lastUpdate = Date.now()
  }

  /**
   * Set lovers
   */
  setLovers(roomId, userId1, userId2) {
    const game = this.getGame(roomId)
    game.lovers = [userId1, userId2]

    const player1 = game.players.find(p => p.userId === userId1)
    const player2 = game.players.find(p => p.userId === userId2)

    if (player1 && player2) {
      player1.isLovers = true
      player1.loversWith = userId2
      player2.isLovers = true
      player2.loversWith = userId1
    }

    game.lastUpdate = Date.now()
  }

  /**
   * Check if players are lovers
   */
  areLovers(roomId, userId1, userId2) {
    const game = this.getGame(roomId)
    if (!game || !game.lovers.length) return false
    return (
      (game.lovers[0] === userId1 && game.lovers[1] === userId2) ||
      (game.lovers[0] === userId2 && game.lovers[1] === userId1)
    )
  }

  /**
   * Get lover of a player
   */
  getLover(roomId, userId) {
    const game = this.getGame(roomId)
    const player = game.players.find(p => p.userId === userId)
    return player?.loversWith || null
  }

  /**
   * Advance to next phase
   */
  nextPhase(roomId) {
    const game = this.getGame(roomId)

    if (game.phase === 'NIGHT') {
      game.phase = 'DAY'
    } else if (game.phase === 'DAY') {
      game.phase = 'NIGHT'
      game.day += 1
    }

    game.lastUpdate = Date.now()
  }

  /**
   * Get all games (for debugging)
   */
  getAllGames() {
    return Array.from(this.games.entries()).map(([roomId, game]) => ({
      roomId,
      phase: game.phase,
      day: game.day,
      alivePlayers: game.players.filter(p => p.isAlive).length,
      totalPlayers: game.players.length
    }))
  }
}

// Singleton instance
const gameStateManager = new GameStateManager()

export default gameStateManager
