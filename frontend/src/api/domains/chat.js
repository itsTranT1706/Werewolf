/**
 * Chat API Module
 * 
 * Handles in-game and lobby chat:
 * - Send messages
 * - Get message history
 * - Chat channels (day chat, werewolf chat, dead chat)
 * 
 * Note: Real-time messages are handled via WebSocket,
 * this module is for REST operations (history, etc.)
 */

import client from '../client'

export const chatApi = {
  /**
   * Get chat history for a room/game
   * @param {string} channelId - Room or game ID
   * @param {object} params - { before, limit }
   * @returns {Promise<{messages: array, hasMore: boolean}>}
   */
  getHistory: async (channelId, params = {}) => {
    const { data } = await client.get(`/chat/${channelId}/messages`, { params })
    return data
  },

  /**
   * Send a message (fallback if WebSocket unavailable)
   * @param {string} channelId 
   * @param {string} content 
   * @returns {Promise<{message: object}>}
   */
  send: async (channelId, content) => {
    const { data } = await client.post(`/chat/${channelId}/messages`, { content })
    return data
  },

  /**
   * Get available chat channels for current game
   * @param {string} gameId 
   * @returns {Promise<{channels: array}>}
   */
  getChannels: async (gameId) => {
    const { data } = await client.get(`/games/${gameId}/chat/channels`)
    return data
  },

  /**
   * Report a message
   * @param {string} messageId 
   * @param {string} reason 
   * @returns {Promise<void>}
   */
  report: async (messageId, reason) => {
    await client.post(`/chat/messages/${messageId}/report`, { reason })
  },
}
