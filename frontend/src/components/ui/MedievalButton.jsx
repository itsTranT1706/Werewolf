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
      background: 'linear-gradient(180deg, rgba(132,94,46,0.96) 0%, rgba(92,61,30,0.98) 55%, rgba(61,41,20,0.98) 100%)',
      border: '2px solid rgba(201,162,39,0.55)',
      hoverBorder: 'rgba(230,200,74,0.85)',
      textColor: '#e6c84a',
      hoverText: '#fff1b0',
      glow: 'rgba(201,162,39,0.28)',
    },
    secondary: {
      background: 'linear-gradient(180deg, rgba(70,70,72,0.95) 0%, rgba(45,45,48,0.97) 60%, rgba(28,28,30,0.98) 100%)',
      border: '2px solid rgba(120,120,125,0.45)',
      hoverBorder: 'rgba(201,162,39,0.55)',
      textColor: '#d4c4a8',
      hoverText: '#f0dfb6',
      glow: 'rgba(139,115,85,0.18)',
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
        btn-medieval group relative px-8 py-3 font-medieval tracking-[0.15em] uppercase
        transition-all duration-500 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      style={{
        '--btn-bg': style.background,
        '--btn-border': style.border,
        '--btn-text': style.textColor,
        '--btn-hover-border': style.hoverBorder,
        '--btn-hover-text': style.hoverText,
        '--btn-glow': style.glow,
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
