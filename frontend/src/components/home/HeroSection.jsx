/**
 * Hero Section - The Dark Ritual Gate
 * 
 * Full screen forbidden gateway into the werewolf world.
 * Dense fog, moonlight, ancient cursed typography.
 */

import { useState, useEffect } from 'react'
import { RuneDivider } from './symbols'

export default function HeroSection({ onBeginRitual }) {
  const [isVisible, setIsVisible] = useState(false)
  const [titleRevealed, setTitleRevealed] = useState(false)

  useEffect(() => {
    // Slow reveal animation
    setTimeout(() => setIsVisible(true), 500)
    setTimeout(() => setTitleRevealed(true), 1500)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - Dark forest */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.15) saturate(0.6)',
        }}
      />

      {/* Fog layers */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,15,0.9) 0%, transparent 30%, transparent 70%, rgba(5,5,15,0.95) 100%)',
        }}
      />
      
      {/* Moving mist */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/assets/effects/fog.png')`,
          backgroundSize: '200% 200%',
          animation: 'slowDrift 40s ease-in-out infinite',
        }}
      />

      {/* Dim moonlight glow */}
      <div 
        className="absolute top-10 right-1/4 w-32 h-32 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(200,200,220,0.8) 0%, transparent 70%)',
          filter: 'blur(20px)',
          animation: 'moonPulse 8s ease-in-out infinite',
        }}
      />

      {/* Content */}
      <div 
        className={`relative z-10 text-center px-4 transition-all duration-[2000ms] ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Ancient rune decoration */}
        <div className="flex justify-center mb-8 text-[#8b7355] opacity-30">
          <RuneDecoration />
        </div>

        {/* Main Title */}
        <h1 
          className={`font-medieval text-6xl md:text-8xl lg:text-9xl tracking-wider transition-all duration-[3000ms] ${
            titleRevealed ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            color: '#8b7355',
            textShadow: `
              0 0 30px rgba(139,115,85,0.3),
              0 0 60px rgba(139,115,85,0.15),
              0 4px 8px rgba(0,0,0,0.9),
              2px 2px 0 #3d2914
            `,
            letterSpacing: '0.15em',
          }}
        >
          MA SÓI
        </h1>

        {/* Subtitle - whispered */}
        <p 
          className={`font-fantasy text-lg md:text-xl mt-6 tracking-[0.4em] uppercase transition-all duration-[2500ms] delay-1000 ${
            titleRevealed ? 'opacity-50' : 'opacity-0'
          }`}
          style={{
            color: '#6b5a4a',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          Đêm nay... không phải ai cũng là người
        </p>

        {/* Divider */}
        <div 
          className={`flex justify-center my-12 transition-all duration-[2000ms] delay-1500 ${
            titleRevealed ? 'opacity-40' : 'opacity-0'
          }`}
        >
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-[#8b7355] to-transparent" />
        </div>

        {/* Begin Ritual Button */}
        <button
          onClick={onBeginRitual}
          className={`group relative px-12 py-4 font-medieval text-lg tracking-[0.3em] uppercase transition-all duration-[2000ms] delay-2000 ${
            titleRevealed ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            color: '#a89070',
            background: 'transparent',
            border: '1px solid rgba(139,115,85,0.3)',
          }}
        >
          {/* Button glow on hover */}
          <span 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(139,115,85,0.1) 0%, transparent 70%)',
            }}
          />
          
          <span className="relative z-10 group-hover:text-[#c9a227] transition-colors duration-500">
            Bắt Đầu Nghi Lễ
          </span>

          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#8b7355]/50 group-hover:border-[#c9a227]/70 transition-colors duration-500" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#8b7355]/50 group-hover:border-[#c9a227]/70 transition-colors duration-500" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#8b7355]/50 group-hover:border-[#c9a227]/70 transition-colors duration-500" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#8b7355]/50 group-hover:border-[#c9a227]/70 transition-colors duration-500" />
        </button>

        {/* Scroll indicator */}
        <div 
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-[2000ms] delay-[3000ms] ${
            titleRevealed ? 'opacity-30' : 'opacity-0'
          }`}
        >
          <div className="w-6 h-10 border border-[#8b7355]/30 rounded-full flex justify-center pt-2">
            <div 
              className="w-1 h-2 bg-[#8b7355]/50 rounded-full"
              style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function RuneDecoration() {
  return (
    <svg width="200" height="40" viewBox="0 0 200 40" fill="none" className="opacity-50">
      <path d="M0 20 L30 20 M40 10 L50 30 L60 10 M70 20 L100 20" stroke="#8b7355" strokeWidth="1"/>
      <circle cx="100" cy="20" r="8" stroke="#8b7355" strokeWidth="1" fill="none"/>
      <path d="M100 12 L100 28 M92 20 L108 20" stroke="#8b7355" strokeWidth="1"/>
      <path d="M130 20 L100 20 M140 10 L150 30 L160 10 M170 20 L200 20" stroke="#8b7355" strokeWidth="1"/>
    </svg>
  )
}
