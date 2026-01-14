/**
 * Game API Module
 * 
 * Handles active game state and actions:
 * - Game state retrieval
 * - Player actions (werewolf kill, seer reveal, etc.)
 * - Phase transitions
 */

import client from '../client'
import { getSocket } from '../socket'

export const gameApi = {
  /**
   * Get current game state
   * @param {string} gameId 
   * @returns {Promise<object>}
   */
  getState: async (gameId) => {
    const { data } = await client.get(`/games/${gameId}`)
    return data
  },

  /**
   * Get player's role and private info
   * @param {string} gameId 
   * @returns {Promise<{role: string, teammates: array}>}
   */
  getMyRole: async (gameId) => {
    const { data } = await client.get(`/games/${gameId}/role`)
    return data
  },

  /**
   * Perform night action (role-specific)
   * @param {string} gameId 
   * @param {object} action - { type, targetId }
   * @returns {Promise<{result: object}>}
   */
  performAction: async (gameId, action) => {
    const { data } = await client.post(`/games/${gameId}/action`, action)
    return data
  },

  /**
   * Get game history/log
   * @param {string} gameId 
   * @returns {Promise<{events: array}>}
   */
  getHistory: async (gameId) => {
    const { data } = await client.get(`/games/${gameId}/history`)
    return data
  },

  /**
   * Get list of alive players
   * @param {string} gameId 
   * @returns {Promise<{players: array}>}
   */
  getAlivePlayers: async (gameId) => {
    const { data } = await client.get(`/games/${gameId}/players`)
    return data
  },

  /**
   * Skip current action (if allowed)
   * @param {string} gameId 
   * @returns {Promise<void>}
   */
  skipAction: async (gameId) => {
    await client.post(`/games/${gameId}/skip`)
  },

  // ============================================
  // CHIA NHÂN VẬT - WebSocket Functions
  // ============================================

  /**
   * Bắt đầu game và phân vai trò
   * @param {string} roomId 
   * @param {Array} players - Array of { userId, username }
   * @param {Object} roleSetup - Optional: Custom role setup { 'VILLAGER': 5, 'SEER': 1, ... }
   * @param {Array<string>} availableRoles - Optional: Các role đã chọn khi tạo phòng
   * @returns {void}
   */
  startGame: (roomId, players, roleSetup = null, availableRoles = null) => {
    const socket = getSocket()
    socket.emit('GAME_START', {
      roomId,
      players,
      roleSetup,
      availableRoles
    })
  },

  /**
   * Lắng nghe khi nhận được vai trò
   * @param {Function} callback - (data) => void
   *   data = { role, roleName, faction, userId }
   * @returns {Function} Unsubscribe function
   */
  onRoleAssigned: (callback) => {
    const socket = getSocket()

    const handler = (data) => {
      const { payload } = data
      callback({
        role: payload.role,
        roleName: payload.roleName,
        faction: payload.faction,
        userId: payload.userId,
        username: payload.username // Thêm username để match anonymous users
      })
    }

    socket.on('GAME_ROLE_ASSIGNED', handler)

    // Return unsubscribe function
    return () => {
      socket.off('GAME_ROLE_ASSIGNED', handler)
    }
  },

  /**
   * Lắng nghe khi game bắt đầu
   * @param {Function} callback - (data) => void
   * @returns {Function} Unsubscribe function
   */
  onGameStarted: (callback) => {
    const socket = getSocket()

    const handler = (data) => {
      callback(data.payload)
    }

    socket.on('GAME_STARTED', handler)

    return () => {
      socket.off('GAME_STARTED', handler)
    }
  },

  /**
   * Lắng nghe lỗi khi bắt đầu game
   * @param {Function} callback - (error) => void
   * @returns {Function} Unsubscribe function
   */
  onGameStartError: (callback) => {
    const socket = getSocket()

    const handler = (data) => {
      callback(data.payload)
    }

    socket.on('GAME_START_ERROR', handler)

    return () => {
      socket.off('GAME_START_ERROR', handler)
    }
  },

  /**
   * Lắng nghe danh sách vai trò đã xáo (cho quản trò)
   * @param {Function} callback - (data) => void
   *   data = { assignment: [{ player: {...}, role: 'SEER', roleName: 'Thầy Bói' }, ...] }
   * @returns {Function} Unsubscribe function
   */
  onRoleAssignmentList: (callback) => {
    const socket = getSocket()

    const handler = (data) => {
      const { payload } = data
      callback({
        assignment: payload.assignment || []
      })
    }

    socket.on('GAME_ROLE_ASSIGNMENT_LIST', handler)

    return () => {
      socket.off('GAME_ROLE_ASSIGNMENT_LIST', handler)
    }
  },

  /**
   * Cập nhật faction để dùng cho faction chat
   * @param {string} roomId 
   * @param {string} faction - 'VILLAGER', 'WEREWOLF'
   * @returns {void}
   */
  updateFaction: (roomId, faction) => {
    const socket = getSocket()
    socket.emit('UPDATE_FACTION', {
      roomId,
      faction
    })
  }
}
