/**
 * API Module Barrel Export
 * 
 * Central export point for all API modules.
 * Import APIs from here: import { authApi, roomApi } from '@/api'
 */

export { authApi } from './domains/auth'
export { roomApi } from './domains/room'
export { gameApi } from './domains/game'
export { voteApi } from './domains/vote'
export { chatApi } from './domains/chat'
export { profileApi } from './domains/profile'

// Re-export client for advanced use cases
export { default as apiClient } from './client'
