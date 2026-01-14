/**
 * Profile Info Panel - Information with inline editing for email
 * 
 * Dark medieval fantasy theme - Ancient chronicle scroll
 * Displays:
 * - Email (editable)
 * - Member since (read-only)
 * - Last updated (read-only)
 * - Logout action
 */

import { CornerAccent, RuneExit, RuneMail, RuneScroll } from '@/components/ui/AncientIcons'

export default function ProfileInfo({ profile, isEditing, editData, onInputChange, onLogout }) {
  return (
    <div 
      className="mt-6 p-6 relative"
      style={{
        background: 'linear-gradient(180deg, rgba(10,8,6,0.95) 0%, rgba(5,5,8,0.98) 100%)',
        border: '1px solid rgba(139,115,85,0.3)',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Corner accents */}
      <CornerAccent className="absolute top-2 left-2 w-4 h-4 text-[#8b7355]/40" position="top-left" />
      <CornerAccent className="absolute top-2 right-2 w-4 h-4 text-[#8b7355]/40" position="top-right" />
      <CornerAccent className="absolute bottom-2 left-2 w-4 h-4 text-[#8b7355]/40" position="bottom-left" />
      <CornerAccent className="absolute bottom-2 right-2 w-4 h-4 text-[#8b7355]/40" position="bottom-right" />

      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <RuneScrollIcon className="w-5 h-5 text-[#c9a227]/70" />
        <h3 className="font-medieval text-lg text-[#c9a227] tracking-wide">
          Thông Tin Chi Tiết
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#8b7355]/40 to-transparent" />
      </div>

      {/* Info fields */}
      <div className="space-y-4">
        {/* Email - Editable */}
        <InfoField
          icon={<RuneMailIcon />}
          label="Email"
          value={isEditing ? editData?.email : profile?.email}
          isEditing={isEditing}
          onChange={(value) => onInputChange?.('email', value)}
          placeholder="email@example.com"
        />
        
        {/* Read-only fields */}
        <InfoField
          icon={<RuneCalendarIcon />}
          label="Ngày Tham Gia"
          value={formatDate(profile?.createdAt)}
        />
        {profile?.updatedAt && (
          <InfoField
            icon={<RuneClockIcon />}
            label="Cập Nhật Lần Cuối"
            value={formatDate(profile?.updatedAt)}
          />
        )}
      </div>

      {/* Divider - Mystical line */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#8b7355]/30 to-transparent" />

      {/* Logout section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-fantasy text-[#6a5a4a] text-sm">
            Sẵn sàng rời khỏi làng?
          </p>
        </div>
        <button
          onClick={onLogout}
          className="group flex items-center gap-2 px-4 py-2 font-fantasy text-sm transition-all duration-500"
          style={{
            background: 'linear-gradient(180deg, rgba(60,30,30,0.6) 0%, rgba(40,20,20,0.8) 100%)',
            border: '1px solid rgba(139,0,0,0.4)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <RuneExitIcon className="w-4 h-4 text-[#8b7355]/70 group-hover:text-[#8b0000] transition-colors duration-500" />
          <span className="text-[#8b7355]/80 group-hover:text-[#8b0000] transition-colors duration-500 tracking-wider">
            Rời Khỏi Làng
          </span>
        </button>
      </div>
    </div>
  )
}

/**
 * Info field with optional inline editing - Ancient inscription style
 */
function InfoField({ icon, label, value, isEditing, onChange, placeholder }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="text-[#c9a227]/60 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-fantasy text-xs text-[#6a5a4a] uppercase tracking-[0.15em]">
          {label}
        </p>
        {isEditing && onChange ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full font-fantasy text-sm text-[#d4c4a8] bg-transparent border-b border-[#8b7355]/40 focus:border-[#c9a227] outline-none mt-1 py-1 transition-colors duration-500"
            style={{ caretColor: '#c9a227' }}
          />
        ) : (
          <p className="font-fantasy text-[#d4c4a8] text-sm mt-1">
            {value || '—'}
          </p>
        )}
      </div>
    </div>
  )
}

// Utilities
function formatDate(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Ancient Rune Icons - Hand-crafted mystical symbols
function RuneScrollIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Scroll shape */}
      <path d="M6 4 Q4 4 4 6 L4 18 Q4 20 6 20 L18 20 Q20 20 20 18 L20 6 Q20 4 18 4 Z" />
      {/* Rolled edges */}
      <path d="M4 6 Q6 6 6 4" />
      <path d="M20 18 Q18 18 18 20" />
      {/* Text lines */}
      <path d="M8 9 L16 9 M8 12 L14 12 M8 15 L12 15" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function RuneMailIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Sealed scroll/letter */}
      <path d="M3 7 L12 13 L21 7" />
      <rect x="3" y="5" width="18" height="14" rx="1" />
      {/* Wax seal */}
      <circle cx="12" cy="14" r="3" fill="currentColor" opacity="0.2" />
      <path d="M10 14 L14 14 M12 12 L12 16" strokeWidth="1" />
    </svg>
  )
}

function RuneCalendarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Calendar frame */}
      <rect x="3" y="5" width="18" height="16" rx="1" />
      {/* Top binding */}
      <path d="M8 3 L8 7 M16 3 L16 7" />
      {/* Divider */}
      <path d="M3 10 L21 10" />
      {/* Moon phase marks */}
      <circle cx="8" cy="14" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="14" r="1.5" strokeDasharray="2 1" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function RuneClockIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Sundial circle */}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6" strokeDasharray="2 2" opacity="0.5" />
      {/* Gnomon/hands */}
      <path d="M12 6 L12 12 L16 14" strokeWidth="2" />
      {/* Hour marks */}
      <path d="M12 4 L12 5 M20 12 L19 12 M12 20 L12 19 M4 12 L5 12" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

function RuneExitIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Doorway */}
      <path d="M9 3 L9 21 L4 21 L4 3 Z" />
      {/* Arrow leaving */}
      <path d="M14 12 L20 12" />
      <path d="M17 9 L20 12 L17 15" />
      {/* Threshold mark */}
      <path d="M9 10 L12 10 M9 14 L12 14" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}
