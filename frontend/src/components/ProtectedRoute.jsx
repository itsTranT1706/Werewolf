/**
 * Protected Route Component
 * 
 * Checks for authentication token before allowing access to protected routes.
 * Redirects to /home if no valid token is found.
 */

import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const location = useLocation()
    const token = localStorage.getItem('token')

    // Check if token exists
    if (!token) {
        // Redirect to home page, saving the attempted location for potential future use
        return <Navigate to="/home" state={{ from: location }} replace />
    }

    // Optional: Validate token format (basic check)
    try {
        const parts = token.split('.')
        if (parts.length !== 3) {
            // Invalid JWT format, clear it and redirect
            localStorage.removeItem('token')
            return <Navigate to="/home" state={{ from: location }} replace />
        }
    } catch {
        // Token parsing failed, clear and redirect
        localStorage.removeItem('token')
        return <Navigate to="/home" state={{ from: location }} replace />
    }

    // Token exists and is valid format, render the protected content
    return children
}
