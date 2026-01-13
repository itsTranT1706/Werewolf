/**
 * Game State Manager
 * 
 * Quản lý trạng thái của tất cả các game đang chạy
 * Sử dụng in-memory Map để lưu trữ
 */

// Map<roomId, GameState>
const games = new Map()

/**
 * Game State Structure:
 * {
 *   roomId: string,
 *   phase: 'NIGHT' | 'DAY' | 'ENDED',
 *   day: number,
 *   players: [{
 *     userId: string,
 *     username: string,
 *     role: string,
 *     isAlive: boolean,
 *     isLovers: boolean,
 *     loversWith: string | null
 *   }],
 *   nightActions: {
 *     werewolfTarget: string | null,
 *     seerChecked: string | null,
 *     protectedPlayer: string | null,
 *     witchSaved: boolean,
 *     poisonedTarget: string | null
 *   },
 *   lovers: [string, string] | [],
 *   lastProtected: string | null,
 *   witchSkills: {
 *     saveUsed: boolean,
 *     poisonUsed: boolean
 *   },
 *   deaths: [{
 *     userId: string,
 *     username: string,
 *     role: string,
 *     day: number,
 *     phase: string,
 *     cause: string,
 *     timestamp: number
 *   }],
 *   votes: Map<string, string>,
 *   createdAt: number,
 *   lastUpdate: number
 * }
 */

export const gameStateManager = {
  /**
   * Tạo game mới
   */
  createGame(roomId, players, roleIds) {
    const playersWithRoles = players.map((player, index) => ({
      userId: player.userId,
      username: player.username,
      role: roleIds[index],
      isAlive: true,
      isLovers: false,
      loversWith: null
    }))

    const game = {
      roomId,
      phase: 'NIGHT',
      day: 1,
      players: playersWithRoles,
      nightActions: {
        werewolfTarget: null,
        seerChecked: null,
        protectedPlayer: null,
        witchSaved: false,
        poisonedTarget: null
      },
      lovers: [],
      lastProtected: null,
      lastProtectedNight: null,
      witchSkills: {
        saveUsed: false,
        poisonUsed: false
      },
      deaths: [],
      votes: new Map(),
      createdAt: Date.now(),
      lastUpdate: Date.now()
    }

    games.set(roomId, game)
    console.log(`✅ Created game state for room ${roomId}`)
    return game
  },

  /**
   * Lấy game state
   */
  getGame(roomId) {
    return games.get(roomId)
  },

  /**
   * Xóa game
   */
  deleteGame(roomId) {
    games.delete(roomId)
    console.log(`🗑️ Deleted game state for room ${roomId}`)
  },

  /**
   * Update game state
   */
  updateGame(roomId, updates) {
    const game = games.get(roomId)
    if (!game) return null

    Object.assign(game, updates, { lastUpdate: Date.now() })
    return game
  },

  /**
   * Lấy thông tin player
   */
  getPlayer(roomId, userId) {
    const game = games.get(roomId)
    if (!game) return null
    return game.players.find(p => p.userId === userId)
  },

  /**
   * Lấy danh sách người chơi còn sống
   */
  getAlivePlayers(roomId) {
    const game = games.get(roomId)
    if (!game) return []
    return game.players.filter(p => p.isAlive)
  },

  /**
   * Lấy danh sách người chơi đã chết
   */
  getDeadPlayers(roomId) {
    const game = games.get(roomId)
    if (!game) return []
    return game.players.filter(p => !p.isAlive)
  },

  /**
   * Kill player
   */
  killPlayer(roomId, userId, cause = 'UNKNOWN') {
    const game = games.get(roomId)
    if (!game) return null

    const player = game.players.find(p => p.userId === userId)
    if (!player || !player.isAlive) return null

    player.isAlive = false

    // Ghi nhận cái chết
    game.deaths.push({
      userId: player.userId,
      username: player.username,
      role: player.role,
      day: game.day,
      phase: game.phase,
      cause,
      timestamp: Date.now()
    })

    game.lastUpdate = Date.now()
    console.log(`💀 Player ${player.username} killed (${cause})`)
    return player
  },

  /**
   * Set lovers
   */
  setLovers(roomId, userId1, userId2) {
    const game = games.get(roomId)
    if (!game) return false

    const player1 = game.players.find(p => p.userId === userId1)
    const player2 = game.players.find(p => p.userId === userId2)

    if (!player1 || !player2) return false

    player1.isLovers = true
    player1.loversWith = userId2

    player2.isLovers = true
    player2.loversWith = userId1

    game.lovers = [userId1, userId2]
    game.lastUpdate = Date.now()

    console.log(`💕 Set lovers: ${player1.username} ❤️ ${player2.username}`)
    return true
  },

  /**
   * Check if two players are lovers
   */
  areLovers(roomId, userId1, userId2) {
    const game = games.get(roomId)
    if (!game) return false

    return game.lovers.includes(userId1) && game.lovers.includes(userId2)
  },

  /**
   * Get lover of a player
   */
  getLover(roomId, userId) {
    const game = games.get(roomId)
    if (!game) return null

    const player = game.players.find(p => p.userId === userId)
    return player?.loversWith || null
  },

  /**
   * Reset night actions (gọi khi bắt đầu đêm mới)
   */
  resetNightActions(roomId) {
    const game = games.get(roomId)
    if (!game) return

    game.nightActions = {
      werewolfTarget: null,
      seerChecked: null,
      protectedPlayer: null,
      witchSaved: false,
      poisonedTarget: null
    }

    game.lastUpdate = Date.now()
    console.log(`🔄 Reset night actions for room ${roomId}`)
  },

  /**
   * Reset votes (gọi khi bắt đầu vote mới)
   */
  resetVotes(roomId) {
    const game = games.get(roomId)
    if (!game) return

    game.votes.clear()
    game.lastUpdate = Date.now()
    console.log(`🔄 Reset votes for room ${roomId}`)
  },

  /**
   * Next phase
   */
  nextPhase(roomId) {
    const game = games.get(roomId)
    if (!game) return

    if (game.phase === 'NIGHT') {
      game.phase = 'DAY'
    } else if (game.phase === 'DAY') {
      game.phase = 'NIGHT'
      game.day += 1
    }

    game.lastUpdate = Date.now()
    console.log(`⏭️ Room ${roomId} moved to ${game.phase} phase (Day ${game.day})`)
  },

  /**
   * Set game as ended
   */
  endGame(roomId) {
    const game = games.get(roomId)
    if (!game) return

    game.phase = 'ENDED'
    game.lastUpdate = Date.now()
    console.log(`🏁 Game ended for room ${roomId}`)
  },

  /**
   * Get all games (for debugging)
   */
  getAllGames() {
    return Array.from(games.values())
  }
}
