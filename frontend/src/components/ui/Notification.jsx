/**
 * Fantasy Notification System - Dark Medieval Theme
 * 
 * Ancient scroll-style toast notifications.
 * Feels like receiving messages from the spirit realm.
 */

import { Toaster, toast } from 'react-hot-toast'
import { RuneCheck, RuneClose, RuneWarning, RuneScroll, CornerAccent } from './AncientIcons'

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
    icon: <RuneCheck className="w-5 h-5" />,
    borderColor: 'rgba(34, 120, 60, 0.6)',
    glowColor: 'rgba(34, 120, 60, 0.15)',
    iconColor: '#4a8a5a',
    accentColor: 'rgba(34, 120, 60, 0.4)',
  },
  error: {
    icon: <RuneClose className="w-5 h-5" />,
    borderColor: 'rgba(139, 0, 0, 0.6)',
    glowColor: 'rgba(139, 0, 0, 0.15)',
    iconColor: '#8b4040',
    accentColor: 'rgba(139, 0, 0, 0.4)',
  },
  warning: {
    icon: <RuneWarning className="w-5 h-5" />,
    borderColor: 'rgba(139, 115, 85, 0.6)',
    glowColor: 'rgba(139, 115, 85, 0.15)',
    iconColor: '#8b7355',
    accentColor: 'rgba(139, 115, 85, 0.4)',
  },
  info: {
    icon: <RuneScroll className="w-5 h-5" />,
    borderColor: 'rgba(80, 100, 120, 0.6)',
    glowColor: 'rgba(80, 100, 120, 0.15)',
    iconColor: '#6a7a8a',
    accentColor: 'rgba(80, 100, 120, 0.4)',
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
      {/* Main container */}
      <div
        className="relative flex items-start gap-4 px-5 py-4 min-w-[280px]"
        style={{
          background: 'linear-gradient(180deg, rgba(20,16,12,0.98) 0%, rgba(15,12,10,0.99) 100%)',
          border: `2px solid ${config.borderColor}`,
          boxShadow: `
            0 0 20px ${config.glowColor},
            0 8px 24px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.03)
          `,
        }}
      >
        {/* Left accent bar */}
        <div 
          className="absolute left-0 top-3 bottom-3 w-0.5"
          style={{ background: config.accentColor }}
        />

        {/* Icon */}
        <div 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          style={{ color: config.iconColor }}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <p 
              className="font-medieval text-sm tracking-wide"
              style={{ color: '#a89070' }}
            >
              {title}
            </p>
          )}
          <p 
            className="font-fantasy text-sm mt-0.5"
            style={{ color: '#8a7a6a' }}
          >
            {message}
          </p>
        </div>

        {/* Corner accents */}
        <div className="absolute top-1 left-1 text-current opacity-30" style={{ color: config.iconColor }}>
          <CornerAccent className="w-2 h-2" position="top-left" />
        </div>
        <div className="absolute top-1 right-1 text-current opacity-30" style={{ color: config.iconColor }}>
          <CornerAccent className="w-2 h-2" position="top-right" />
        </div>
        <div className="absolute bottom-1 left-1 text-current opacity-30" style={{ color: config.iconColor }}>
          <CornerAccent className="w-2 h-2" position="bottom-left" />
        </div>
        <div className="absolute bottom-1 right-1 text-current opacity-30" style={{ color: config.iconColor }}>
          <CornerAccent className="w-2 h-2" position="bottom-right" />
        </div>
      </div>
    </div>
  )
}

/**
 * Centralized notification helper
 */
export const notify = {
  success: (message, title = 'Thành Công') => {
    toast.custom((t) => (
      <FantasyToast type="success" title={title} message={message} visible={t.visible} />
    ))
  },

  error: (message, title = 'Lỗi') => {
    toast.custom((t) => (
      <FantasyToast type="error" title={title} message={message} visible={t.visible} />
    ), { duration: 5000 })
  },

  warning: (message, title = 'Cảnh Báo') => {
    toast.custom((t) => (
      <FantasyToast type="warning" title={title} message={message} visible={t.visible} />
    ))
  },

  info: (message, title = 'Thông Báo') => {
    toast.custom((t) => (
      <FantasyToast type="info" title={title} message={message} visible={t.visible} />
    ))
  },

  // Game-specific notifications
  gameEvent: (message) => {
    toast.custom((t) => (
      <FantasyToast type="info" title="Sự Kiện" message={message} visible={t.visible} />
    ))
  },

  phaseChange: (phase) => {
    toast.custom((t) => (
      <FantasyToast 
        type="warning" 
        title="Chuyển Pha" 
        message={`${phase} đã bắt đầu...`} 
        visible={t.visible} 
      />
    ), { duration: 5000 })
  },

  death: (playerName) => {
    toast.custom((t) => (
      <FantasyToast 
        type="error" 
        title="Tử Vong" 
        message={`${playerName} đã bị loại`} 
        visible={t.visible} 
      />
    ), { duration: 6000 })
  },

  dismiss: () => toast.dismiss(),
}

export default notify
