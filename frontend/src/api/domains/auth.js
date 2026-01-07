/**
 * Auth API Module
 * 
 * Handles all authentication-related API calls:
 * - Login / Logout
 * - Registration
 * - Token management
 * - JWT decode utilities
 * - Password reset (future)
 */

import client from '../client'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'

// ============================================
// Token Utilities (exported for reuse)
// ============================================

/**
 * Decode JWT token to get payload
 * @returns {object|null} Decoded token payload or null
 */
export function decodeToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}

/**
 * Get current user's ID from JWT token
 * @returns {string|null} User ID or null
 */
export function getCurrentUserId() {
  const decoded = decodeToken()
  // Common JWT claims for user ID: sub, userId, id, user_id
  return decoded?.sub || decoded?.userId || decoded?.id || decoded?.user_id || null
}

/**
 * Check if token is expired
 * @returns {boolean}
 */
export function isTokenExpired() {
  const decoded = decodeToken()
  if (!decoded?.exp) return true
  return Date.now() >= decoded.exp * 1000
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  /**
   * Login with email or username
   * @param {string} identifier - Email or username
   * @param {string} password 
   * @returns {Promise<{token: string, user: object}>}
   */
  login: async (emailOrUsername, password) => {
    const { data } = await client.post('auth/login', { emailOrUsername, password })

    // Store token on successful login
    if (data.token) {
      authApi.setToken(data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    }

    return data
  },

  /**
   * Register a new user
   * @param {object} userData - { email, username, password }
   * @returns {Promise<{message: string}>}
   */
  register: async ({ email, username, password }) => {
    const { data } = await client.post('auth/register', {
      email,
      username,
      password
    })
    return data
  },

  /**
   * Logout - clear tokens
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  /**
   * Get current auth token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Set auth token
   * @param {string} token 
   */
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return false
    return !isTokenExpired()
  },

  /**
   * Get decoded token data
   * @returns {object|null}
   */
  getTokenData: decodeToken,

  /**
   * Get current user's ID from token
   * @returns {string|null}
   */
  getCurrentUserId,

  /**
   * Get current user profile (from token or API)
   * @returns {Promise<object>}
   */
  getCurrentUser: async () => {
    const { data } = await client.get('/auth/me')
    return data
  },

  /**
   * Refresh access token
   * @returns {Promise<{token: string}>}
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const { data } = await client.post('/auth/refresh', { refreshToken })

    if (data.token) {
      authApi.setToken(data.token)
    }

    return data
  },
}
