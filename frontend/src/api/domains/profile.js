/**
 * Profile API Module
 * 
 * Handles user profile management:
 * - View/update profile
 * - Stats and history
 * 
 * Profile endpoint: /api/user-profile/{userId}
 * userId is extracted from JWT token via auth utilities
 */

import client from '../client'
import { getCurrentUserId } from './auth'

const PROFILE_BASE = '/user-profile'

export const profileApi = {
  /**
   * Get current user's profile
   * @returns {Promise<object>}
   */
  getMe: async () => {
    const userId = getCurrentUserId()
    if (!userId) {
      throw new Error('Not authenticated')
    }
    const { data } = await client.get(`${PROFILE_BASE}/${userId}`)
    return data
  },

  /**
   * Get user's public profile by ID
   * @param {string} userId 
   * @returns {Promise<object>}
   */
  get: async (userId) => {
    const { data } = await client.get(`${PROFILE_BASE}/${userId}`)
    return data
  },

  /**
   * Update current user's profile
   * @param {object} updates - { displayName, avatar, bio }
   * @returns {Promise<object>}
   */
  updateMe: async (updates) => {
    const userId = getCurrentUserId()
    if (!userId) {
      throw new Error('Not authenticated')
    }
    const { data } = await client.put(`${PROFILE_BASE}/${userId}`, updates)
    return data
  },

  /**
   * Update user's profile by ID
   * @param {string} userId
   * @param {object} updates
   * @returns {Promise<object>}
   */
  update: async (userId, updates) => {
    const { data } = await client.put(`${PROFILE_BASE}/${userId}`, updates)
    return data
  },

  /**
   * Get user's game statistics
   * @param {string} userId - Optional, defaults to current user
   * @returns {Promise<object>}
   */
  getStats: async (userId = null) => {
    const id = userId || getCurrentUserId()
    if (!id) {
      throw new Error('User ID required')
    }
    const { data } = await client.get(`/game-history/user/${id}/stats`)
    return data
  },

  /**
   * Get user's game history
   * @param {string} userId - Optional, defaults to current user
   * @param {object} params - { page, limit }
   * @returns {Promise<object>}
   */
  getGameHistory: async (userId = null, params = {}) => {
    const id = userId || getCurrentUserId()
    if (!id) {
      throw new Error('User ID required')
    }
    const { data } = await client.get(`/game-history/user/${id}`, { params })
    return data
  },
}
