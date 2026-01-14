/**
 * Profile Banner - Ancient Hero Portrait
 * 
 * Dark medieval fantasy styled profile banner.
 * Feels like viewing an ancient warrior's portrait.
 */

import { useState } from 'react'
import { RuneQuill, RuneSeal, RuneWolf, RuneSpinner, CornerAccent } from '@/components/ui/AncientIcons'

export default function ProfileBanner({
  profile,
  isEditing,
  editData,
  onEditToggle,
  onInputChange,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <div 
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20,16,12,0.95) 0%, rgba(15,12,10,0.98) 100%)',
        border: '2px solid rgba(139,115,85,0.3)',
      }}
    >
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.3) saturate(0.5)',
        }}
      />
      
      {/* Gradient overlays */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(15,12,10,0.9) 100%)',
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-2 left-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="top-left" />
      </div>
      <div className="absolute top-2 right-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="top-right" />
      </div>
      <div className="absolute bottom-2 left-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="bottom-left" />
      </div>
      <div className="absolute bottom-2 right-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="bottom-right" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 min-h-[280px] flex flex-col justify-end">
        {/* Edit button */}
        <div className="absolute top-4 right-4">
          {!isEditing ? (
            <button
              onClick={onEditToggle}
              className="group flex items-center gap-2 px-4 py-2 font-fantasy text-sm transition-all duration-300"
              style={{
                background: 'rgba(15,12,10,0.8)',
                border: '1px solid rgba(139,115,85,0.3)',
                color: '#8a7a6a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,115,85,0.5)'
                e.currentTarget.style.color = '#a89070'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,115,85,0.3)'
                e.currentTarget.style.color = '#8a7a6a'
              }}
            >
              <RuneQuill className="w-4 h-4" />
              <span>Sửa</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 font-fantasy text-sm transition-colors"
                style={{
                  background: 'rgba(15,12,10,0.8)',
                  border: '1px solid rgba(80,70,60,0.3)',
                  color: '#6a5a4a',
                }}
              >
                Hủy
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 font-fantasy text-sm transition-all duration-300 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(180deg, rgba(92,61,30,0.9) 0%, rgba(61,41,20,0.95) 100%)',
                  border: '1px solid rgba(139,115,85,0.5)',
                  color: '#a89070',
                }}
              >
                {saving ? (
                  <RuneSpinner className="w-4 h-4" />
                ) : (
                  <RuneSeal className="w-4 h-4" />
                )}
                <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Avatar and Name section */}
        <div className="flex items-end gap-6">
          {/* Avatar */}
          <AvatarFrame
            src={isEditing ? editData.avatarUrl : profile?.avatarUrl}
            isEditing={isEditing}
            avatarUrl={editData.avatarUrl}
            onAvatarUrlChange={(url) => onInputChange('avatarUrl', url)}
          />

          {/* Name and username */}
          <div className="flex-1 pb-2 space-y-2">
            {/* Display Name */}
            {isEditing ? (
              <InlineInput
                value={editData.displayName}
                onChange={(value) => onInputChange('displayName', value)}
                placeholder="Tên hiển thị"
                className="font-medieval text-3xl md:text-4xl tracking-wide"
                style={{ color: '#8b7355' }}
              />
            ) : (
              <h1 
                className="font-medieval text-4xl md:text-5xl tracking-wide"
                style={{
                  color: '#8b7355',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,115,85,0.2)',
                }}
              >
                {profile?.displayName || profile?.username || 'Lữ Khách Vô Danh'}
              </h1>
            )}
            
            {/* Username */}
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span style={{ color: '#5a4a3a' }}>@</span>
                <InlineInput
                  value={editData.username}
                  onChange={(value) => onInputChange('username', value)}
                  placeholder="tên người dùng"
                  className="font-fantasy text-lg"
                  style={{ color: '#6a5a4a' }}
                />
              </div>
            ) : (
              <p className="font-fantasy text-lg" style={{ color: '#5a4a3a' }}>
                @{profile?.username}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InlineInput({ value, onChange, placeholder, className = '', style = {} }) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`
        bg-transparent outline-none transition-all w-full
        ${isFocused ? 'border-b-2' : 'border-b'}
        ${className}
      `}
      style={{
        borderColor: isFocused ? 'rgba(139,115,85,0.6)' : 'rgba(139,115,85,0.3)',
        caretColor: '#8b7355',
        ...style,
      }}
    />
  )
}

function AvatarFrame({ src, isEditing, avatarUrl, onAvatarUrlChange }) {
  const [isHovering, setIsHovering] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)

  return (
    <div 
      className="relative flex-shrink-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glow effect */}
      <div 
        className="absolute -inset-3 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(139,115,85,0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Frame */}
      <div 
        className="relative w-32 h-32 p-1"
        style={{
          background: 'linear-gradient(135deg, rgba(139,115,85,0.7) 0%, rgba(60,40,20,0.8) 50%, rgba(139,115,85,0.7) 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Inner border */}
        <div 
          className="w-full h-full p-1"
          style={{ background: 'rgba(15,12,10,0.95)' }}
        >
          {/* Avatar container */}
          <div 
            className="relative w-full h-full overflow-hidden"
            style={{ 
              background: 'rgba(10,8,6,0.9)',
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)',
            }}
          >
            {src ? (
              <img src={src} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <RuneWolf className="w-16 h-16 text-[#5a4a3a]" />
              </div>
            )}

            {/* Edit overlay */}
            {isEditing && isHovering && (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity"
                style={{ background: 'rgba(0,0,0,0.85)' }}
                onClick={() => setShowUrlInput(true)}
              >
                <div className="text-center">
                  <RuneQuill className="w-8 h-8 mx-auto mb-1" style={{ color: '#8b7355' }} />
                  <span className="font-fantasy text-xs" style={{ color: '#a89070' }}>Thay đổi</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute -top-1 -left-1 text-[#8b7355] opacity-60">
        <CornerAccent className="w-4 h-4" position="top-left" />
      </div>
      <div className="absolute -top-1 -right-1 text-[#8b7355] opacity-60">
        <CornerAccent className="w-4 h-4" position="top-right" />
      </div>
      <div className="absolute -bottom-1 -left-1 text-[#8b7355] opacity-60">
        <CornerAccent className="w-4 h-4" position="bottom-left" />
      </div>
      <div className="absolute -bottom-1 -right-1 text-[#8b7355] opacity-60">
        <CornerAccent className="w-4 h-4" position="bottom-right" />
      </div>

      {/* URL Input Popup */}
      {isEditing && showUrlInput && (
        <div 
          className="absolute top-full left-0 mt-2 p-4 z-50 min-w-[280px]"
          style={{
            background: 'linear-gradient(180deg, rgba(20,16,12,0.98) 0%, rgba(15,12,10,0.99) 100%)',
            border: '2px solid rgba(139,115,85,0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <label 
            className="block font-fantasy text-xs uppercase tracking-wider mb-2"
            style={{ color: '#6a5a4a' }}
          >
            Đường dẫn Avatar
          </label>
          <input
            type="text"
            value={avatarUrl || ''}
            onChange={(e) => onAvatarUrlChange(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-3 py-2 font-fantasy text-sm bg-transparent outline-none"
            style={{
              border: '1px solid rgba(139,115,85,0.3)',
              color: '#a89070',
            }}
            autoFocus
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setShowUrlInput(false)}
              className="px-4 py-1 font-fantasy text-xs"
              style={{ color: '#8b7355' }}
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
