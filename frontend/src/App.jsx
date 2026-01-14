import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import IntroPage from './pages/IntroPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GamePage from './pages/GamePage'
import ProfilePage from './pages/ProfilePage'
import RoomPage from './pages/RoomPage'
import MatchChroniclePage from './pages/MatchChroniclePage'
import { NotificationProvider } from '@/components/ui'
import { useHomeAudio } from '@/hooks/useHomeAudio'

function App() {
  // Global background audio - plays across all pages
  useHomeAudio()

  return (
    <>
      <NotificationProvider />
      <Routes>
        {/* Intro - The Forbidden Ritual Gateway */}
        <Route path="/" element={<IntroPage />} />

        {/* Home - Enter room / Create room */}
        <Route element={<AuthLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Game routes */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/room/:roomId/chronicle" element={<MatchChroniclePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </>
  )
}

export default App
