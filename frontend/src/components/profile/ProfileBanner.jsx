/**
 * Profile Banner - Hero banner with avatar and name
 * 
 * Features:
 * - Large fantasy artwork background
 * - Ornate avatar frame with inline URL editing
 * - Inline editing for display name and username
 * - Edit/Save/Cancel controls
 */

import { useState } from 'react'

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
    <div className="relative rounded-lg overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.4) saturate(0.8)',
        }}
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-night-blue/95 via-night-blue/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-night-blue/60 via-transparent to-night-blue/60" />

      {/* Ornate border frame */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          border: '3px solid transparent',
          borderImage: 'linear-gradient(135deg, #c9a227 0%, #5c3d1e 25%, #c9a227 50%, #5c3d1e 75%, #c9a227 100%) 1',
        }}
      />

      {/* Corner ornaments */}
      <CornerOrnament position="top-left" />
      <CornerOrnament position="top-right" />
      <CornerOrnament position="bottom-left" />
      <CornerOrnament position="bottom-right" />

      {/* Content */}
      <div className="relative z-10 p-6 min-h-[280px] flex flex-col justify-end">
        {/* Edit button (top right) */}
        <div className="absolute top-4 right-4">
          {!isEditing ? (
            <button
              onClick={onEditToggle}
              className="group flex items-center gap-2 px-3 py-1.5 font-fantasy text-sm text-parchment/70 hover:text-gold transition-colors"
              style={{
                background: 'rgba(20,15,10,0.7)',
                border: '1px solid rgba(201,162,39,0.3)',
              }}
            >
              <QuillIcon className="w-4 h-4" />
              <span>Sửa</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-3 py-1.5 font-fantasy text-sm text-parchment/70 hover:text-parchment transition-colors"
                style={{
                  background: 'rgba(20,15,10,0.7)',
                  border: '1px solid rgba(100,100,100,0.3)',
                }}
              >
                Hủy
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-1.5 font-fantasy text-sm text-gold hover:text-gold-light transition-colors disabled:opacity-50"
                style={{
                  background: 'linear-gradient(180deg, rgba(92,61,30,0.9) 0%, rgba(61,41,20,0.9) 100%)',
                  border: '1px solid rgba(201,162,39,0.5)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {saving ? (
                  <LoadingSpinner />
                ) : (
                  <SealIcon className="w-4 h-4" />
                )}
                <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Avatar and Name section */}
        <div className="flex items-end gap-6">
          {/* Avatar with ornate frame */}
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
                style={{
                  color: '#c9a227',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                }}
              />
            ) : (
              <h1 
                className="font-medieval text-4xl md:text-5xl tracking-wide"
                style={{
                  color: '#c9a227',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(201,162,39,0.3)',
                }}
              >
                {profile?.displayName || profile?.username || 'Lữ Khách Vô Danh'}
              </h1>
            )}
            
            {/* Username */}
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span className="text-parchment/50 text-lg">@</span>
                <InlineInput
                  value={editData.username}
                  onChange={(value) => onInputChange('username', value)}
                  placeholder="tên người dùng"
                  className="font-fantasy text-lg"
                  style={{ color: 'rgba(212, 184, 150, 0.7)' }}
                />
              </div>
            ) : (
              <p className="font-fantasy text-parchment/50 text-lg">
                @{profile?.username}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline input that looks like text until focused
 */
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
        ${isFocused ? 'border-b-2 border-gold' : 'border-b border-gold/30'}
        ${className}
      `}
      style={{
        caretColor: '#c9a227',
        ...style,
      }}
    />
  )
}

/**
 * Ornate avatar frame with inline URL editing
 */
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
        className="absolute -inset-3 rounded-lg opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Metal frame */}
      <div 
        className="relative w-32 h-32 rounded-lg p-1"
        style={{
          background: 'linear-gradient(135deg, #c9a227 0%, #6b4c0a 30%, #c9a227 50%, #6b4c0a 70%, #c9a227 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        {/* Inner border */}
        <div className="w-full h-full rounded-md p-1 bg-wood-dark">
          {/* Avatar container */}
          <div 
            className="relative w-full h-full rounded bg-stone-dark overflow-hidden"
            style={{ boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.7)' }}
          >
            {src ? (
              <img src={src} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <WolfIcon className="w-16 h-16 text-parchment/30" />
              </div>
            )}

            {/* Edit overlay */}
            {isEditing && isHovering && (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity"
                style={{ background: 'rgba(0,0,0,0.8)' }}
                onClick={() => setShowUrlInput(true)}
              >
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gold mx-auto mb-1" />
                  <span className="font-fantasy text-xs text-parchment">Thay đổi</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corner rivets */}
      <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />
      <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />
      <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />
      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />

      {/* URL Input Popup */}
      {isEditing && showUrlInput && (
        <div 
          className="absolute top-full left-0 mt-2 p-3 rounded-lg z-50 min-w-[280px]"
          style={{
            background: 'linear-gradient(180deg, rgba(30,22,15,0.98) 0%, rgba(20,15,10,0.99) 100%)',
            border: '2px solid rgba(201,162,39,0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <label className="block font-fantasy text-xs text-parchment/50 uppercase tracking-wider mb-2">
            Đường dẫn Avatar
          </label>
          <input
            type="text"
            value={avatarUrl || ''}
            onChange={(e) => onAvatarUrlChange(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-3 py-2 font-fantasy text-sm text-parchment bg-stone-dark/50 border border-gold/30 focus:border-gold outline-none rounded"
            autoFocus
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setShowUrlInput(false)}
              className="px-3 py-1 font-fantasy text-xs text-gold hover:text-gold-light"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Corner ornament decoration
 */
function CornerOrnament({ position }) {
  const positionClasses = {
    'top-left': 'top-1 left-1',
    'top-right': 'top-1 right-1 scale-x-[-1]',
    'bottom-left': 'bottom-1 left-1 scale-y-[-1]',
    'bottom-right': 'bottom-1 right-1 scale-[-1]',
  }

  return (
    <div className={`absolute w-8 h-8 ${positionClasses[position]} pointer-events-none opacity-60`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <path d="M2 2 L12 2 L12 4 L4 4 L4 12 L2 12 Z" fill="#c9a227" />
        <circle cx="8" cy="8" r="2" fill="#c9a227" />
      </svg>
    </div>
  )
}

// Icons
function QuillIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/>
    </svg>
  )
}

function SealIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
}

function WolfIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 4c-2 0-4 1-6 3l-4 6-8-2c-2 0-3 1-3 3l2 10-6 8c-1 2 0 4 2 5l8 4v12c0 2 1 4 3 5l10 4c1 0 2 0 4-1l10-4c2-1 3-3 3-5V41l8-4c2-1 3-3 2-5l-6-8 2-10c0-2-1-3-3-3l-8 2-4-6c-2-2-4-3-6-3zm-8 24a3 3 0 110 6 3 3 0 010-6zm16 0a3 3 0 110 6 3 3 0 010-6zm-8 10c2 0 4 2 4 4h-8c0-2 2-4 4-4z"/>
    </svg>
  )
}

function ImageIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}
