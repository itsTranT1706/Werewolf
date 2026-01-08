/**
 * Medieval Button - Dark Fantasy Styled Button
 * 
 * Ancient stone/wood carved button with mystical glow effects.
 * Feels like pressing a rune-inscribed artifact.
 */

export default function MedievalButton({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variantStyles = {
    primary: {
      background: 'linear-gradient(180deg, rgba(92,61,30,0.95) 0%, rgba(61,41,20,0.98) 50%, rgba(42,26,10,0.95) 100%)',
      border: '2px solid rgba(139,115,85,0.4)',
      hoverBorder: 'rgba(201,162,39,0.6)',
      textColor: '#a89070',
      hoverText: '#c9a227',
      glow: 'rgba(139,115,85,0.2)',
    },
    secondary: {
      background: 'linear-gradient(180deg, rgba(40,35,30,0.95) 0%, rgba(30,25,20,0.98) 50%, rgba(20,15,10,0.95) 100%)',
      border: '2px solid rgba(80,70,60,0.4)',
      hoverBorder: 'rgba(139,115,85,0.5)',
      textColor: '#8a7a6a',
      hoverText: '#a89070',
      glow: 'rgba(80,70,60,0.2)',
    },
    danger: {
      background: 'linear-gradient(180deg, rgba(80,20,20,0.95) 0%, rgba(60,15,15,0.98) 50%, rgba(40,10,10,0.95) 100%)',
      border: '2px solid rgba(139,0,0,0.4)',
      hoverBorder: 'rgba(180,0,0,0.6)',
      textColor: '#a05050',
      hoverText: '#cc4444',
      glow: 'rgba(139,0,0,0.2)',
    },
  }

  const style = variantStyles[variant] || variantStyles.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group relative px-8 py-3 font-medieval tracking-[0.15em] uppercase
        transition-all duration-500 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      style={{
        background: style.background,
        border: style.border,
        color: style.textColor,
        boxShadow: `
          0 4px 12px rgba(0,0,0,0.5),
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -1px 0 rgba(0,0,0,0.3)
        `,
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = style.hoverBorder
          e.currentTarget.style.color = style.hoverText
          e.currentTarget.style.boxShadow = `
            0 6px 20px rgba(0,0,0,0.6),
            0 0 20px ${style.glow},
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.3)
          `
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = style.border.split(' ')[2]
        e.currentTarget.style.color = style.textColor
        e.currentTarget.style.boxShadow = `
          0 4px 12px rgba(0,0,0,0.5),
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -1px 0 rgba(0,0,0,0.3)
        `
      }}
      {...props}
    >
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current opacity-30 group-hover:opacity-60 transition-opacity" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-current opacity-30 group-hover:opacity-60 transition-opacity" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-current opacity-30 group-hover:opacity-60 transition-opacity" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current opacity-30 group-hover:opacity-60 transition-opacity" />

      {/* Glow effect on hover */}
      <span 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${style.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Loading spinner */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </span>
      )}
      
      {/* Button content */}
      <span className={`relative z-10 ${loading ? 'invisible' : ''}`}>
        {children}
      </span>
    </button>
  )
}

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {/* Mystical spinning rune */}
      <circle cx="12" cy="12" r="9" strokeDasharray="20 40" opacity="0.8" />
      <path d="M12 6 L12 9 M12 15 L12 18 M6 12 L9 12 M15 12 L18 12" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}
