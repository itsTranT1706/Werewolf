/**
 * Profile API Module
 * 
 * Handles user profile management:
 * - View/update profile
 * - Stats and history
 * - Avatar/settings
 */

import client from '../client'

export const profileApi = {
  /**
   * Get current user's profile
   * @returns {Promise<object>}
   */
  getMe: async () => {
    const { data } = await client.get('/profile/me')
    return data
  },

  /**
   * Get another user's public profile
   * @param {string} userId 
   * @returns {Promise<object>}
   */
  get: async (userId) => {
    const { data } = await client.get(`/profile/${userId}`)
    return data
  },

  /**
   * Update current user's profile
   * @param {object} updates - { username, avatar, bio }
   * @returns {Promise<object>}
   */
  update: async (updates) => {
    const { data } = await client.patch('/profile/me', updates)
    return data
  },

  /**
   * Get user's game statistics
   * @param {string} userId - Optional, defaults to current user
   * @returns {Promise<{stats: object}>}
   */
  getStats: async (userId = 'me') => {
    const { data } = await client.get(`/profile/${userId}/stats`)
    return data
  },

  /**
   * Get user's game history
   * @param {string} userId 
   * @param {object} params - { page, limit }
   * @returns {Promise<{games: array, total: number}>}
   */
  getGameHistory: async (userId = 'me', params = {}) => {
    const { data } = await client.get(`/profile/${userId}/games`, { params })
    return data
  },

  /**
   * Update avatar
   * @param {File} file 
   * @returns {Promise<{avatarUrl: string}>}
   */
  updateAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const { data } = await client.post('/profile/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
