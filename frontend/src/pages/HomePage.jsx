/**
 * Home Page - The Village Gate
 * 
 * Entry point after the intro ritual.
 * Dark medieval fantasy styled room entry.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, notify } from '@/components/ui'
import { RuneDoor, RuneWolf } from '@/components/ui/AncientIcons'
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
    <div className="w-full max-w-md">
        <MedievalPanel className="w-full home-panel-frame" variant="altar">
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
            
            <h2 className="font-medieval text-3xl tracking-wider home-panel-header">
              Bước Vào Làng
            </h2>
            <p className="font-fantasy text-sm mt-2 tracking-wide home-panel-subtitle">
              Đêm tối đầy những bí mật
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
                Vào Phòng
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
            <p className="font-fantasy text-xs mt-3 italic text-[#5a4a3a]">
              (để lưu lịch sử trò chơi)
            </p>
          </div>
        </MedievalPanel>
      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
      />
    </div>
  )
}
