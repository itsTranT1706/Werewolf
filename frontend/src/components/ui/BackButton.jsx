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
        btn-back group relative flex items-center gap-3 px-5 py-2.5 
        font-fantasy text-sm tracking-wide
        transition-all duration-500
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
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
        btn-back group relative w-11 h-11 flex items-center justify-center
        transition-all duration-500
        hover:scale-105 active:scale-95
        ${className}
      `}
      title="Trở Về Làng"
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
