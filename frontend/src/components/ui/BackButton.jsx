/**
 * Back Button - Ancient Navigation Rune
 * 
 * Mystical navigation button styled as a carved rune tablet.
 * Feels like activating an ancient waypoint.
 */

import { useNavigate } from 'react-router-dom'
import { RuneArrowLeft } from './AncientIcons'

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
        group relative flex items-center gap-3 px-5 py-2.5 
        font-fantasy text-sm tracking-wide
        transition-all duration-500
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      style={{
        background: 'linear-gradient(180deg, rgba(20,16,12,0.95) 0%, rgba(15,12,10,0.98) 100%)',
        border: '2px solid rgba(60,50,40,0.4)',
        color: '#8a7a6a',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(139,115,85,0.5)'
        e.currentTarget.style.color = '#a89070'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5), 0 0 15px rgba(139,115,85,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(60,50,40,0.4)'
        e.currentTarget.style.color = '#8a7a6a'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
      }}
    >
      {/* Arrow icon */}
      <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
        <RuneArrowLeft className="w-5 h-5" />
      </span>

      {/* Label */}
      <span>{label}</span>

      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
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
        group relative w-11 h-11 flex items-center justify-center
        transition-all duration-500
        hover:scale-105 active:scale-95
        ${className}
      `}
      style={{
        background: 'linear-gradient(180deg, rgba(20,16,12,0.95) 0%, rgba(15,12,10,0.98) 100%)',
        border: '2px solid rgba(60,50,40,0.4)',
        color: '#8a7a6a',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
      title="Trở Về Làng"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(139,115,85,0.5)'
        e.currentTarget.style.color = '#a89070'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(60,50,40,0.4)'
        e.currentTarget.style.color = '#8a7a6a'
      }}
    >
      <RuneArrowLeft className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" />
      
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#8b7355]/30 group-hover:border-[#8b7355]/60 transition-colors" />
    </button>
  )
}
