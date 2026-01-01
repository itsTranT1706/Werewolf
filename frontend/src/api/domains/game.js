/**
 * Game API Module
 * 
 * Handles active game state and actions:
 * - Game state retrieval
 * - Player actions (werewolf kill, seer reveal, etc.)
 * - Phase transitions
 */

import client from '../client'

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
}
