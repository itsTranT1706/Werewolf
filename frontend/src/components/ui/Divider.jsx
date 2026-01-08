/**
 * Divider - Ancient Rune Divider
 * 
 * Mystical separator with carved rune symbols.
 * Feels like an ancient boundary marker.
 */

import { RuneDividerLine } from './AncientIcons'

export default function Divider({ text }) {
  if (text) {
    return (
      <div className="flex items-center gap-4 my-6">
        <div 
          className="flex-1 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(139,115,85,0.3) 100%)',
          }}
        />
        <span 
          className="font-fantasy text-sm tracking-[0.2em] uppercase"
          style={{ color: '#6a5a4a' }}
        >
          {text}
        </span>
        <div 
          className="flex-1 h-px"
          style={{
            background: 'linear-gradient(90deg, rgba(139,115,85,0.3) 0%, transparent 100%)',
          }}
        />
      </div>
    )
  }

  return (
    <div className="my-6 flex justify-center text-[#6a5a4a] opacity-50">
      <RuneDividerLine className="w-48 h-4" />
    </div>
  )
}
