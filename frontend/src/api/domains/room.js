/**
 * Room API Module
 * 
 * Handles game room management:
 * - Create / Join / Leave rooms
 * - List available rooms
 * - Room settings
 */

import client from '../client'

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
   * @param {object} options - { displayname, userId, password }
   * @returns {Promise<{room: object, player: object}>}
   */
  join: async (roomId, options = {}) => {
    const { displayname, userId, password = null } = options
    const { data } = await client.post(`/rooms/${roomId}/join`, { displayname, userId, password })
    return data
  },

  /**
   * Leave current room
   * @param {string} roomId 
   * @returns {Promise<void>}
   */
  leave: async (roomId) => {
    await client.post(`/rooms/${roomId}/leave`)
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
