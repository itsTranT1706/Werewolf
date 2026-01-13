/**
 * Cursed Souls Section - Roles Preview
 * 
 * Roles appear as sealed, cursed entities.
 * Minimal info, maximum tension.
 */

import { useState, useRef, useEffect } from 'react'
import { 
  WerewolfSigil, 
  SeerSigil, 
  WitchSigil, 
  VillagerSigil,
  SealedMark 
} from './symbols'

const CURSED_SOULS = [
  {
    id: 'werewolf',
    name: 'Sói',
    Sigil: WerewolfSigil,
    whisper: 'Nó nghe thấy nhịp tim của ngươi trong bóng tối.',
    color: '#8b0000',
  },
  {
    id: 'seer',
    name: 'Tiên Tri',
    Sigil: SeerSigil,
    whisper: 'Đôi mắt nhìn thấu linh hồn, nhưng không thể cứu chính mình.',
    color: '#4a5a8a',
  },
  {
    id: 'witch',
    name: 'Phù Thủy',
    Sigil: WitchSigil,
    whisper: 'Một giọt cứu mạng, một giọt đoạt hồn.',
    color: '#2a5a4a',
  },
  {
    id: 'villager',
    name: 'Dân Làng',
    Sigil: VillagerSigil,
    whisper: 'Kẻ vô tội... hay kẻ giả vờ vô tội?',
    color: '#5a4a3a',
  },
]

export default function CursedSoulsSection() {
  const [hoveredSoul, setHoveredSoul] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen py-32"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0a0810 50%, #050508 100%)',
      }}
    >
      {/* Section title */}
      <div className="text-center mb-20">
        <h2 
          className={`font-medieval text-3xl md:text-4xl tracking-[0.2em] transition-all duration-[2000ms] ${
            isVisible ? 'opacity-50 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ color: '#6a5a4a' }}
        >
          Những Linh Hồn Bị Nguyền
        </h2>
        <div 
          className={`w-24 h-px mx-auto mt-4 bg-gradient-to-r from-transparent via-[#8b7355]/30 to-transparent transition-all duration-[2000ms] delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Souls grid */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {CURSED_SOULS.map((soul, index) => (
          <CursedSoulCard
            key={soul.id}
            soul={soul}
            index={index}
            isVisible={isVisible}
            isHovered={hoveredSoul === soul.id}
            onHover={() => setHoveredSoul(soul.id)}
            onLeave={() => setHoveredSoul(null)}
          />
        ))}
      </div>

      {/* Warning text */}
      <p 
        className={`text-center mt-20 font-fantasy text-sm tracking-wider transition-all duration-[2000ms] delay-[2000ms] ${
          isVisible ? 'opacity-30' : 'opacity-0'
        }`}
        style={{ color: '#5a4a3a' }}
      >
        Đừng để vẻ ngoài đánh lừa...
      </p>
    </section>
  )
}

function CursedSoulCard({ soul, index, isVisible, isHovered, onHover, onLeave }) {
  return (
    <div
      className={`relative group transition-all duration-[1500ms] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Sealed card */}
      <div 
        className={`relative aspect-[3/4] flex flex-col items-center justify-center p-4 transition-all duration-700 cursor-pointer ${
          isHovered ? 'scale-105' : ''
        }`}
        style={{
          background: `radial-gradient(ellipse at center, 
            ${isHovered ? 'rgba(20,18,15,0.95)' : 'rgba(15,13,10,0.9)'} 0%, 
            rgba(10,8,5,0.98) 100%
          )`,
          border: `1px solid ${isHovered ? soul.color + '60' : 'rgba(60,50,40,0.3)'}`,
          boxShadow: isHovered 
            ? `0 0 30px ${soul.color}30, inset 0 0 20px ${soul.color}10`
            : '0 5px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Seal overlay - fades on hover */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
            isHovered ? 'opacity-0' : 'opacity-70'
          }`}
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
          }}
        >
          <SealedMark className="w-12 h-12 text-[#5a4a3a] opacity-40" />
        </div>

        {/* Sigil */}
        <div 
          className={`mb-4 transition-all duration-700 ${
            isHovered ? 'opacity-100 scale-110' : 'opacity-20 scale-100'
          }`}
          style={{
            color: isHovered ? soul.color : '#6a5a4a',
            filter: isHovered ? `drop-shadow(0 0 15px ${soul.color})` : 'none',
          }}
        >
          <soul.Sigil className="w-16 h-16" glow={isHovered} />
        </div>

        {/* Name */}
        <h3 
          className={`font-medieval text-lg tracking-wider text-center transition-all duration-700 ${
            isHovered ? 'opacity-90' : 'opacity-30'
          }`}
          style={{ color: isHovered ? soul.color : '#6a5a4a' }}
        >
          {soul.name}
        </h3>

        {/* Whisper - only on hover */}
        <p 
          className={`absolute bottom-4 left-4 right-4 font-fantasy text-xs text-center leading-relaxed transition-all duration-700 ${
            isHovered ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ color: '#8a7a6a' }}
        >
          "{soul.whisper}"
        </p>

        {/* Corner seals */}
        <span 
          className={`absolute top-2 left-2 w-4 h-4 border-t border-l transition-colors duration-500`}
          style={{ borderColor: isHovered ? soul.color + '50' : 'rgba(80,70,60,0.2)' }}
        />
        <span 
          className={`absolute top-2 right-2 w-4 h-4 border-t border-r transition-colors duration-500`}
          style={{ borderColor: isHovered ? soul.color + '50' : 'rgba(80,70,60,0.2)' }}
        />
        <span 
          className={`absolute bottom-2 left-2 w-4 h-4 border-b border-l transition-colors duration-500`}
          style={{ borderColor: isHovered ? soul.color + '50' : 'rgba(80,70,60,0.2)' }}
        />
        <span 
          className={`absolute bottom-2 right-2 w-4 h-4 border-b border-r transition-colors duration-500`}
          style={{ borderColor: isHovered ? soul.color + '50' : 'rgba(80,70,60,0.2)' }}
        />
      </div>
    </div>
  )
}
