/**
 * Room API Module
 * 
 * Handles game room management:
 * - Create / Join / Leave rooms
 * - List available rooms
 * - Room settings
 */

import client from '../client'
import { getOrCreateGuestUserId } from '@/utils/guestUtils'

export const roomApi = {
  /**
   * Get list of available rooms
   * @param {object} params - { page, limit, status }
   * @returns {Promise<{rooms: array, total: number}>}
   */
  list: async (params = {}) => {
    const { data } = await client.get('/rooms', { params })
    return data
  },

  /**
   * Get room details by ID
   * @param {string} roomId 
   * @returns {Promise<object>}
   */
  get: async (roomId) => {
    const { data } = await client.get(`/rooms/${roomId}`)
    return data
  },

  /**
   * Create a new room
   * @param {object} roomData - { name, maxPlayers, isPrivate, password }
   * @returns {Promise<{room: object}>}
   */
  create: async (roomData) => {
    const { data } = await client.post('/rooms', roomData)
    return data
  },

  /**
   * Join a room
   * @param {string} roomId 
   * @param {string} password - Optional for private rooms
   * @param {string} username - Optional username for guest players
   * @returns {Promise<{room: object}>}
   */
  join: async (roomId, password = null, username = null) => {
    // Lấy userId từ localStorage để gửi trong body (backup nếu header không hoạt động)
    const token = localStorage.getItem('token')
    let userId = null
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        userId = payload.userId || payload.id
      } catch (err) {
        // Ignore
      }
    } else {
      // Nếu không có token, lấy guest userId
      userId = getOrCreateGuestUserId()
    }

    const { data } = await client.post(`/rooms/${roomId}/join`, {
      password,
      username,
      userId // Gửi userId trong body để đảm bảo backend nhận được
    })
    return data
  },

  /**
   * Leave current room
   * @param {string} roomId 
   * @param {string} userId - Optional, gửi để backend remove đúng player
   * @returns {Promise<void>}
   */
  leave: async (roomId, userId = null) => {
    await client.post(`/rooms/${roomId}/leave`, {
      userId: userId || undefined
    })
  },

  /**
   * Update room settings (host only)
   * @param {string} roomId 
   * @param {object} settings 
   * @returns {Promise<{room: object}>}
   */
  update: async (roomId, settings) => {
    const { data } = await client.patch(`/rooms/${roomId}`, settings)
    return data
  },

  /**
   * Kick a player from room (host only)
   * @param {string} roomId 
   * @param {string} playerId 
   * @returns {Promise<void>}
   */
  kickPlayer: async (roomId, playerId) => {
    await client.post(`/rooms/${roomId}/kick`, { playerId })
  },

  /**
   * Start the game (host only)
   * @param {string} roomId 
   * @returns {Promise<{gameId: string}>}
   */
  startGame: async (roomId) => {
    const { data } = await client.post(`/rooms/${roomId}/start`)
    return data
  },
}
