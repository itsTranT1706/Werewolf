/**
 * Home Page - The Village Gate
 * 
 * Entry point after the intro ritual.
 * Dark medieval fantasy styled room entry.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, notify } from '@/components/ui'
import { RuneDoor, RuneWolf, CornerAccent } from '@/components/ui/AncientIcons'
import CreateRoomModal from '@/components/game/CreateRoomModal'

export default function HomePage() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)

  const handleRoomCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setRoomCode(value)
    if (error) setError('')
  }

  const handleEnterRoom = () => {
    if (roomCode.length !== 4) {
      setError('Vui lòng nhập đủ 4 chữ số')
      return
    }

    notify.success(`Đang vào phòng ${roomCode}...`, 'Vào Phòng')
    navigate(`/game?room=${roomCode}`)
  }

  const handleCreateRoom = () => {
    setShowCreateRoom(true)
  }

  const handleLoginRegister = () => {
    navigate('/login')
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: '#050508' }}
    >
      {/* Dark forest background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.15) saturate(0.5)',
        }}
      />
      
      {/* Gradient overlays */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.9) 0%, transparent 30%, transparent 70%, rgba(5,5,8,0.95) 100%)',
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Fog */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/effects/fog.png')`,
          backgroundSize: '200% 200%',
          animation: 'slowDrift 40s ease-in-out infinite',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <MedievalPanel className="w-full">
          {/* Panel header */}
          <div className="text-center mb-8">
            {/* Wolf sigil */}
            <div className="flex justify-center mb-4">
              <div 
                className="w-20 h-20 flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(139,115,85,0.15) 0%, transparent 70%)',
                }}
              >
                <RuneWolf className="w-16 h-16 text-[#8b7355] opacity-70" />
              </div>
            </div>
            
            <h2 
              className="font-medieval text-3xl tracking-wider"
              style={{
                color: '#8b7355',
                textShadow: '0 0 20px rgba(139,115,85,0.3), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              Bước Vào Làng
            </h2>
            <p 
              className="font-fantasy text-sm mt-2 tracking-wide"
              style={{ color: '#6a5a4a' }}
            >
              Đêm tối đầy những bí mật...
            </p>
          </div>

          {/* Room code input with enter button */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <MedievalInput
                  type="text"
                  name="roomCode"
                  placeholder="Mã phòng (4 chữ số)"
                  value={roomCode}
                  onChange={handleRoomCodeChange}
                  icon={<RuneDoor className="w-5 h-5" />}
                  error={error}
                  maxLength={4}
                  inputMode="numeric"
                />
              </div>
              <MedievalButton
                onClick={handleEnterRoom}
                className="px-6 whitespace-nowrap"
              >
                Vào
              </MedievalButton>
            </div>
          </div>

          <Divider text="hoặc" />

          {/* Create new room button */}
          <div className="mb-6">
            <MedievalButton
              onClick={handleCreateRoom}
              className="w-full"
              variant="secondary"
            >
              Tạo Phòng Mới
            </MedievalButton>
          </div>

          <Divider text="hoặc" />

          {/* Login/Register button */}
          <div className="text-center">
            <MedievalButton
              onClick={handleLoginRegister}
              className="w-full"
            >
              Đăng Nhập / Đăng Ký
            </MedievalButton>
            <p 
              className="font-fantasy text-xs mt-3 italic"
              style={{ color: '#5a4a3a' }}
            >
              (để lưu lịch sử trò chơi)
            </p>
          </div>
        </MedievalPanel>
      </div>

      {/* Corner ornaments */}
      <div className="absolute top-6 left-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="top-left" />
      </div>
      <div className="absolute top-6 right-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="top-right" />
      </div>
      <div className="absolute bottom-6 left-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="bottom-left" />
      </div>
      <div className="absolute bottom-6 right-6 text-[#8b7355] opacity-20 pointer-events-none">
        <CornerAccent className="w-12 h-12" position="bottom-right" />
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
      />
    </div>
  )
}
