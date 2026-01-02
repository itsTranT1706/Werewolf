import { Routes, Route } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GamePage from './pages/GamePage'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import { NotificationProvider } from '@/components/ui'
import { useHomeAudio } from '@/hooks/useHomeAudio'

function App() {
  // Global background audio - plays across all pages
  useHomeAudio()

  return (
    <>
      <NotificationProvider />
      <Routes>
        {/* Home - The Forbidden Ritual Gateway */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        {/* Game routes */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  )
}

export default App
