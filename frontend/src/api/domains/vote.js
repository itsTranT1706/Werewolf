/**
 * Vote API Module
 * 
 * Handles voting during day phase:
 * - Cast vote
 * - Get vote status
 * - Vote results
 */

import client from '../client'

export const voteApi = {
  /**
   * Cast a vote against a player
   * @param {string} gameId 
   * @param {string} targetId - Player to vote against
   * @returns {Promise<{vote: object}>}
   */
  cast: async (gameId, targetId) => {
    const { data } = await client.post(`/games/${gameId}/vote`, { targetId })
    return data
  },

  /**
   * Change or remove vote
   * @param {string} gameId 
   * @param {string|null} targetId - null to remove vote
   * @returns {Promise<{vote: object}>}
   */
  update: async (gameId, targetId) => {
    const { data } = await client.patch(`/games/${gameId}/vote`, { targetId })
    return data
  },

  /**
   * Get current vote tally
   * @param {string} gameId 
   * @returns {Promise<{votes: object, total: number}>}
   */
  getTally: async (gameId) => {
    const { data } = await client.get(`/games/${gameId}/votes`)
    return data
  },

  /**
   * Get my current vote
   * @param {string} gameId 
   * @returns {Promise<{targetId: string|null}>}
   */
  getMyVote: async (gameId) => {
    const { data } = await client.get(`/games/${gameId}/vote/me`)
    return data
  },

  /**
   * Skip vote (abstain)
   * @param {string} gameId 
   * @returns {Promise<void>}
   */
  skip: async (gameId) => {
    await client.post(`/games/${gameId}/vote/skip`)
  },
}
