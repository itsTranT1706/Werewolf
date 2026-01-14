/**
 * Divider - Ancient Rune Divider
 * 
 * Mystical separator with carved rune symbols.
 * Feels like an ancient boundary marker.
 */

import { RuneDividerLine } from './AncientIcons'

export default function Divider({ text, className = '' }) {
  if (text) {
    return (
      <div className={`flex items-center gap-4 my-6 ${className}`}>
        <div className="flex-1 h-px divider-line-left" />
        <span className="font-fantasy text-sm tracking-[0.2em] uppercase text-[#6a5a4a]">
          {text}
        </span>
        <div className="flex-1 h-px divider-line-right" />
      </div>
    )
  }

  return (
    <div className={`my-6 flex justify-center text-[#6a5a4a] opacity-50 ${className}`}>
      <RuneDividerLine className="w-48 h-4" />
    </div>
  )
}
