/**
 * API Module Barrel Export
 * 
 * Central export point for all API modules.
 * Import APIs from here: import { authApi, roomApi } from '@/api'
 */

// Domain APIs
export { authApi } from './domains/auth'
export { roomApi } from './domains/room'
export { gameApi } from './domains/game'
export { voteApi } from './domains/vote'
export { chatApi } from './domains/chat'
export { profileApi } from './domains/profile'

// Auth utilities (for use outside of authApi)
export { 
  decodeToken, 
  getCurrentUserId, 
  isTokenExpired 
} from './domains/auth'

// Re-export client for advanced use cases
export { default as apiClient } from './client'
