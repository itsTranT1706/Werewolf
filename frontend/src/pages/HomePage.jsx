import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, notify } from '@/components/ui'

export default function HomePage() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  const handleRoomCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4) // Only digits, max 4
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
    notify.success('Đang tạo phòng mới...', 'Tạo Phòng')
    navigate('/game?create=true')
  }

  const handleLoginRegister = () => {
    navigate('/login')
  }

  return (
    <MedievalPanel className="w-full max-w-md">
      {/* Panel header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <img 
            src="/assets/ui/wolf-icon.svg" 
            alt="Wolf" 
            className="w-16 h-16 opacity-80"
            style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(61%) saturate(400%) hue-rotate(359deg) brightness(95%) contrast(92%)' }}
          />
        </div>
        <h2 className="font-medieval text-2xl text-gold-glow tracking-wide">
          Bước Vào Làng
        </h2>
        <p className="font-fantasy text-parchment/60 text-sm mt-1">
          Đêm tối đầy những bí mật
        </p>
      </div>

      {/* Room code input with enter button */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <MedievalInput
              type="text"
              name="roomCode"
              placeholder="Mã phòng (4 chữ số)"
              value={roomCode}
              onChange={handleRoomCodeChange}
              icon={<DoorIcon className="w-5 h-5" />}
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
      <div className="mb-4">
        <MedievalButton
          onClick={handleCreateRoom}
          className="w-full"
          variant="secondary" // Changed to secondary variant
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
        <p className="font-fantasy text-parchment/50 text-xs mt-2 italic">
          (để lưu lịch sử trò chơi)
        </p>
      </div>
    </MedievalPanel>
  )
}

// Icons
function DoorIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  )
}
