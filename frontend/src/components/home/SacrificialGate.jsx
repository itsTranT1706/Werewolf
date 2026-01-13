/**
 * Sacrificial Gate - Final Call to Action
 * 
 * The point of no return. Almost completely black.
 * Clicking leads to the existing Login page.
 */

import { useRef, useState } from 'react'

export default function SacrificialGate({ onEnter }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef(null)

  const handleEnter = () => {
    if (isAnimating) return
    setIsAnimating(true)
    spawnDrops()
    setTimeout(() => {
      onEnter()
    }, 420)
  }

  const spawnDrops = () => {
    const button = buttonRef.current
    if (!button) return

    const dropCount = 10 + Math.floor(Math.random() * 7)
    for (let i = 0; i < dropCount; i += 1) {
      const drop = document.createElement('span')
      drop.className = 'blood-drop'

      const size = 4 + Math.random() * 8
      const fall = 60 + Math.random() * 140
      const dur = 400 + Math.random() * 700
      const offset = -40 + Math.random() * 80

      drop.style.width = `${size}px`
      drop.style.height = `${size * 1.6}px`
      drop.style.left = `calc(50% + ${offset}px)`
      drop.style.setProperty('--fall', `${fall}px`)
      drop.style.setProperty('--dur', `${dur}ms`)

      button.appendChild(drop)
      drop.addEventListener('animationend', () => drop.remove(), { once: true })
    }
  }

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center py-32"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #020203 50%, #000000 100%)',
      }}
    >
      {/* Faint blood moon glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(180,30,30,0.6) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-md mx-auto px-6 text-center">
        {/* Warning text */}
        <p 
          className="font-fantasy text-lg md:text-xl tracking-wider mb-12 leading-relaxed"
          style={{ 
            color: '#b7a48a',
            textShadow: '0 2px 10px rgba(0,0,0,0.85)',
          }}
        >
          "Một khi người bước vào...<br/>
          <span className="text-[#e35d5d]">sẽ không có đường quay lại.</span>"
        </p>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          ref={buttonRef}
          className="group relative px-14 py-4 font-medieval text-xl tracking-[0.2em] uppercase transition-all duration-700"
          style={{
            color: '#e35d5d',
            background: 'transparent',
            border: '1px solid rgba(227,93,93,0.45)',
          }}
        >
          {/* Glow effect */}
          <span 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(227,93,93,0.2) 0%, transparent 70%)',
            }}
          />
          
          <span className="relative z-10 group-hover:text-[#ff8a8a] transition-colors duration-700">
            Bước Vào Bóng Tối
          </span>

          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#e35d5d]/50 group-hover:border-[#ff8a8a]/70 transition-all duration-500" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#e35d5d]/50 group-hover:border-[#ff8a8a]/70 transition-all duration-500" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#e35d5d]/50 group-hover:border-[#ff8a8a]/70 transition-all duration-500" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#e35d5d]/50 group-hover:border-[#ff8a8a]/70 transition-all duration-500" />
        </button>
      </div>
    </section>
  )
}
