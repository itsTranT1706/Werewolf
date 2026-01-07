/**
 * Centralized HTTP Client
 * 
 * All API calls go through this client, which handles:
 * - Base URL configuration (API Gateway)
 * - Request/response interceptors
 * - Authentication headers
 * - Error normalization
 * - Timeout handling
 */

import axios from 'axios'

// Configuration from environment
// Use '/api/v1' for Vite proxy in development, or full URL in production
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || '/api/v1'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000

// Create axios instance with defaults
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// ============================================
// Request Interceptor
// ============================================
client.interceptors.request.use(
  (config) => {
    // Attach auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ============================================
// Response Interceptor
// ============================================
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error structure
    const normalizedError = normalizeError(error)
    
    // Handle 401 globally - clear token and redirect
    if (normalizedError.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(normalizedError)
  }
)

// ============================================
// Error Normalization
// ============================================
function normalizeError(error) {
  // Network error (no response)
  if (!error.response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your connection.',
      original: error,
    }
  }

  // Server responded with error
  const { status, data } = error.response
  
  return {
    status,
    code: data?.code || `HTTP_${status}`,
    message: data?.message || data?.error || getDefaultMessage(status),
    errors: data?.errors || null, // Validation errors array
    original: error,
  }
}

function getDefaultMessage(status) {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'Session expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please wait a moment.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable.',
    503: 'Service is under maintenance.',
  }
  return messages[status] || 'An unexpected error occurred.'
}

export default client
