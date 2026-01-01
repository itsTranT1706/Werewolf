/**
 * Back Button - Fantasy styled navigation button
 * 
 * Used to navigate back to previous page (e.g., Game page from Profile)
 * Styled as a medieval/fantasy UI element
 */

import { useNavigate } from 'react-router-dom'

export default function BackButton({ 
  to = '/game', 
  label = 'Trở Về Làng',
  className = '' 
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        group flex items-center gap-3 px-4 py-2 
        font-fantasy text-sm text-parchment/70 
        hover:text-gold transition-all duration-200
        ${className}
      `}
      style={{
        background: 'linear-gradient(180deg, rgba(30,22,15,0.85) 0%, rgba(20,15,10,0.9) 100%)',
        border: '2px solid rgba(201,162,39,0.3)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Arrow icon */}
      <span 
        className="transform group-hover:-translate-x-1 transition-transform duration-200"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </span>

      {/* Label */}
      <span className="tracking-wide">{label}</span>

      {/* Decorative corner accents */}
      <span 
        className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold/30 
                   group-hover:border-gold/60 transition-colors"
      />
      <span 
        className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold/30 
                   group-hover:border-gold/60 transition-colors"
      />
      <span 
        className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold/30 
                   group-hover:border-gold/60 transition-colors"
      />
      <span 
        className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold/30 
                   group-hover:border-gold/60 transition-colors"
      />
    </button>
  )
}

/**
 * Compact back button (icon only)
 */
export function BackButtonCompact({ to = '/game', className = '' }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className={`
        group relative w-10 h-10 flex items-center justify-center
        text-parchment/60 hover:text-gold transition-all duration-200
        ${className}
      `}
      style={{
        background: 'linear-gradient(180deg, rgba(30,22,15,0.85) 0%, rgba(20,15,10,0.9) 100%)',
        border: '2px solid rgba(201,162,39,0.3)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
      title="Trở Về Làng"
    >
      <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" />
      
      {/* Hover glow */}
      <span 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 10px rgba(201,162,39,0.2)',
        }}
      />
    </button>
  )
}

// Arrow icon
function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
      />
    </svg>
  )
}
