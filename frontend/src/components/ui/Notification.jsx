/**
 * Fantasy Notification System
 * 
 * Medieval-themed toast notifications using react-hot-toast.
 * Feels like in-game system messages, not web popups.
 */

import { Toaster, toast } from 'react-hot-toast'

/**
 * Notification Provider - Add to App root
 */
export function NotificationProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{ top: 20 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          maxWidth: '420px',
        },
      }}
    />
  )
}

/**
 * Notification types configuration
 */
const NOTIFICATION_TYPES = {
  success: {
    icon: <SuccessIcon />,
    borderColor: 'rgba(34, 197, 94, 0.6)',
    glowColor: 'rgba(34, 197, 94, 0.2)',
    iconBg: 'rgba(34, 197, 94, 0.2)',
  },
  error: {
    icon: <ErrorIcon />,
    borderColor: 'rgba(239, 68, 68, 0.6)',
    glowColor: 'rgba(239, 68, 68, 0.2)',
    iconBg: 'rgba(239, 68, 68, 0.2)',
  },
  warning: {
    icon: <WarningIcon />,
    borderColor: 'rgba(234, 179, 8, 0.6)',
    glowColor: 'rgba(234, 179, 8, 0.2)',
    iconBg: 'rgba(234, 179, 8, 0.2)',
  },
  info: {
    icon: <InfoIcon />,
    borderColor: 'rgba(59, 130, 246, 0.6)',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    iconBg: 'rgba(59, 130, 246, 0.2)',
  },
}

/**
 * Fantasy-styled toast component
 */
function FantasyToast({ type, title, message, visible }) {
  const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
      `}
    >
      {/* Main container - parchment/wood panel style */}
      <div
        className="relative flex items-start gap-3 px-4 py-3 min-w-[280px]"
        style={{
          background: 'linear-gradient(180deg, rgba(30,22,15,0.97) 0%, rgba(20,15,10,0.98) 100%)',
          border: `2px solid ${config.borderColor}`,
          boxShadow: `
            0 0 20px ${config.glowColor},
            0 4px 20px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.05)
          `,
        }}
      >
        {/* Left accent bar */}
        <div 
          className="absolute left-0 top-2 bottom-2 w-1"
          style={{ background: config.borderColor }}
        />

        {/* Icon */}
        <div 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded"
          style={{ background: config.iconBg }}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <p 
              className="font-medieval text-sm tracking-wide"
              style={{ color: '#d4b896' }}
            >
              {title}
            </p>
          )}
          <p 
            className="font-fantasy text-sm"
            style={{ color: 'rgba(212, 184, 150, 0.8)' }}
          >
            {message}
          </p>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: config.borderColor }} />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: config.borderColor }} />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: config.borderColor }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: config.borderColor }} />
      </div>
    </div>
  )
}

/**
 * Centralized notification helper
 * 
 * Usage:
 *   notify.success('Profile updated!')
 *   notify.error('Login failed', 'Invalid credentials')
 *   notify.warning('Session expiring soon')
 *   notify.info('A new day has begun')
 */
export const notify = {
  success: (message, title = 'Success') => {
    toast.custom((t) => (
      <FantasyToast type="success" title={title} message={message} visible={t.visible} />
    ))
  },

  error: (message, title = 'Error') => {
    toast.custom((t) => (
      <FantasyToast type="error" title={title} message={message} visible={t.visible} />
    ), { duration: 5000 })
  },

  warning: (message, title = 'Warning') => {
    toast.custom((t) => (
      <FantasyToast type="warning" title={title} message={message} visible={t.visible} />
    ))
  },

  info: (message, title = 'Notice') => {
    toast.custom((t) => (
      <FantasyToast type="info" title={title} message={message} visible={t.visible} />
    ))
  },

  // Game-specific notifications
  gameEvent: (message) => {
    toast.custom((t) => (
      <FantasyToast type="info" title="⚔ Game Event" message={message} visible={t.visible} />
    ))
  },

  phaseChange: (phase) => {
    toast.custom((t) => (
      <FantasyToast 
        type="warning" 
        title="☽ Phase Change" 
        message={`The ${phase} has begun...`} 
        visible={t.visible} 
      />
    ), { duration: 5000 })
  },

  death: (playerName) => {
    toast.custom((t) => (
      <FantasyToast 
        type="error" 
        title="☠ Death" 
        message={`${playerName} has been eliminated`} 
        visible={t.visible} 
      />
    ), { duration: 6000 })
  },

  // Dismiss all
  dismiss: () => toast.dismiss(),
}

// Fantasy-themed icons
function SuccessIcon() {
  return (
    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  )
}

export default notify
