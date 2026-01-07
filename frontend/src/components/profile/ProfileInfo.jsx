/**
 * Profile Info Panel - Information with inline editing for email
 * 
 * Displays:
 * - Email (editable)
 * - Member since (read-only)
 * - Last updated (read-only)
 * - Logout action
 */

export default function ProfileInfo({ profile, isEditing, editData, onInputChange, onLogout }) {
  return (
    <div 
      className="mt-6 p-6 rounded-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(30,22,15,0.9) 0%, rgba(20,15,10,0.95) 100%)',
        border: '2px solid rgba(201,162,39,0.2)',
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <ScrollIcon className="w-5 h-5 text-gold/60" />
        <h3 className="font-medieval text-lg text-gold tracking-wide">
          Thông Tin Chi Tiết
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
      </div>

      {/* Info fields */}
      <div className="space-y-4">
        {/* Email - Editable */}
        <InfoField
          icon={<MailIcon />}
          label="Email"
          value={isEditing ? editData?.email : profile?.email}
          isEditing={isEditing}
          onChange={(value) => onInputChange?.('email', value)}
          placeholder="email@example.com"
        />
        
        {/* Read-only fields */}
        <InfoField
          icon={<CalendarIcon />}
          label="Ngày Tham Gia"
          value={formatDate(profile?.createdAt)}
        />
        {profile?.updatedAt && (
          <InfoField
            icon={<ClockIcon />}
            label="Cập Nhật Lần Cuối"
            value={formatDate(profile?.updatedAt)}
          />
        )}
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Logout section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-fantasy text-parchment/50 text-sm">
            Sẵn sàng rời khỏi làng?
          </p>
        </div>
        <button
          onClick={onLogout}
          className="group flex items-center gap-2 px-4 py-2 font-fantasy text-sm transition-all"
          style={{
            background: 'linear-gradient(180deg, rgba(60,40,40,0.8) 0%, rgba(40,25,25,0.9) 100%)',
            border: '1px solid rgba(139,0,0,0.4)',
          }}
        >
          <ExitIcon className="w-4 h-4 text-parchment/60 group-hover:text-blood-red transition-colors" />
          <span className="text-parchment/70 group-hover:text-blood-red transition-colors">
            Rời Khỏi Làng
          </span>
        </button>
      </div>
    </div>
  )
}

/**
 * Info field with optional inline editing
 */
function InfoField({ icon, label, value, isEditing, onChange, placeholder }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="text-gold/50 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-fantasy text-xs text-parchment/40 uppercase tracking-wider">
          {label}
        </p>
        {isEditing && onChange ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full font-fantasy text-sm text-parchment bg-transparent border-b border-gold/30 focus:border-gold outline-none mt-0.5 py-0.5"
            style={{ caretColor: '#c9a227' }}
          />
        ) : (
          <p className="font-fantasy text-parchment text-sm mt-0.5">
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

// Icons
function ScrollIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h1V4h11v16h1a2 2 0 002-2V4a2 2 0 00-2-2H6zm3 4v2h6V6H9zm0 4v2h6v-2H9zm0 4v2h4v-2H9z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ExitIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
