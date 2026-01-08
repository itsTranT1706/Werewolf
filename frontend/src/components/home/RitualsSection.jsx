/**
 * Rituals Section - Forbidden Game Modes
 * 
 * Each option is a ritual, not a menu item.
 * Carved stone tablets with glowing runes.
 */

import { useState, useRef, useEffect } from 'react'
import { RuneWhisper, RuneBloodMoon, RuneCouncil, CornerRune } from './symbols'

const RITUALS = [
  {
    id: 'whisper',
    name: 'Nghi Lễ Thì Thầm',
    subtitle: 'Whispering Rite',
    description: 'Nơi những lời nói dối được thì thầm trong bóng tối',
    RuneIcon: RuneWhisper,
    players: '6-8',
  },
  {
    id: 'blood',
    name: 'Đêm Trăng Máu',
    subtitle: 'Blood Moon Night',
    description: 'Khi trăng nhuốm đỏ, không ai được an toàn',
    RuneIcon: RuneBloodMoon,
    players: '9-12',
  },
  {
    id: 'council',
    name: 'Hội Đồng Bóng Tối',
    subtitle: 'Council of Shadows',
    description: 'Những kẻ quyền lực nhất cũng có thể là quái vật',
    RuneIcon: RuneCouncil,
    players: '12-16',
  },
]

export default function RitualsSection() {
  const [hoveredRitual, setHoveredRitual] = useState(null)
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
        background: 'linear-gradient(180deg, #050508 0%, #08080f 50%, #050508 100%)',
      }}
    >
      {/* Section title */}
      <div className="text-center mb-20">
        <h2 
          className={`font-medieval text-3xl md:text-4xl tracking-[0.2em] transition-all duration-[2000ms] ${
            isVisible ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ color: '#7a6a5a' }}
        >
          Chọn Số Phận
        </h2>
        <div 
          className={`w-24 h-px mx-auto mt-4 bg-gradient-to-r from-transparent via-[#8b7355]/50 to-transparent transition-all duration-[2000ms] delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Ritual tablets */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {RITUALS.map((ritual, index) => (
          <RitualTablet
            key={ritual.id}
            ritual={ritual}
            index={index}
            isVisible={isVisible}
            isHovered={hoveredRitual === ritual.id}
            onHover={() => setHoveredRitual(ritual.id)}
            onLeave={() => setHoveredRitual(null)}
          />
        ))}
      </div>

      {/* Darkness overlay when hovering */}
      <div 
        className={`fixed inset-0 bg-black pointer-events-none transition-opacity duration-700 z-20 ${
          hoveredRitual ? 'opacity-40' : 'opacity-0'
        }`}
      />
    </section>
  )
}

function RitualTablet({ ritual, index, isVisible, isHovered, onHover, onLeave }) {
  return (
    <div
      className={`relative group transition-all duration-[1500ms] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 300}ms` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Stone tablet */}
      <div 
        className={`relative p-8 min-h-[320px] transition-all duration-500 cursor-pointer ${
          isHovered ? 'z-30 scale-105' : 'z-10'
        }`}
        style={{
          background: `linear-gradient(180deg, 
            rgba(40,35,30,0.9) 0%, 
            rgba(30,25,20,0.95) 50%, 
            rgba(25,20,15,0.9) 100%
          )`,
          border: `1px solid ${isHovered ? 'rgba(139,0,0,0.5)' : 'rgba(80,70,60,0.3)'}`,
          boxShadow: isHovered 
            ? '0 0 40px rgba(139,0,0,0.2), inset 0 0 30px rgba(139,0,0,0.1)'
            : '0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Cracked texture overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L25 30 L10 50 L30 70 L20 100' stroke='%23000' fill='none' stroke-width='0.5'/%3E%3Cpath d='M60 0 L55 25 L70 45 L50 80 L65 100' stroke='%23000' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Rune symbol */}
        <div className="flex justify-center mb-6">
          <div 
            className={`transition-all duration-700 ${
              isHovered ? 'text-[#8b0000]' : 'text-[#8b7355]/40'
            }`}
            style={{
              filter: isHovered ? 'drop-shadow(0 0 15px rgba(139,0,0,0.5))' : 'none',
            }}
          >
            <ritual.RuneIcon className="w-16 h-16" />
          </div>
        </div>

        {/* Ritual name */}
        <h3 
          className={`font-medieval text-xl text-center tracking-wider mb-2 transition-colors duration-500 ${
            isHovered ? 'text-[#c9a227]' : 'text-[#a89070]'
          }`}
        >
          {ritual.name}
        </h3>

        {/* Subtitle */}
        <p className="font-fantasy text-xs text-center tracking-[0.3em] uppercase text-[#6a5a4a] mb-6">
          {ritual.subtitle}
        </p>

        {/* Description */}
        <p 
          className={`font-fantasy text-sm text-center leading-relaxed transition-all duration-500 ${
            isHovered ? 'text-[#9a8a7a]' : 'text-[#6a5a4a]'
          }`}
        >
          {ritual.description}
        </p>

        {/* Players count */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <span className="font-fantasy text-xs text-[#5a4a3a] tracking-wider">
            {ritual.players} linh hồn
          </span>
        </div>

        {/* Corner runes */}
        <div className="absolute top-2 left-2 text-[#8b7355]/30">
          <CornerRune className="w-6 h-6" position="top-left" />
        </div>
        <div className="absolute top-2 right-2 text-[#8b7355]/30">
          <CornerRune className="w-6 h-6" position="top-right" />
        </div>
        <div className="absolute bottom-2 left-2 text-[#8b7355]/30">
          <CornerRune className="w-6 h-6" position="bottom-left" />
        </div>
        <div className="absolute bottom-2 right-2 text-[#8b7355]/30">
          <CornerRune className="w-6 h-6" position="bottom-right" />
        </div>

        {/* Blood seeping effect on hover */}
        {isHovered && (
          <div 
            className="absolute inset-x-0 top-0 h-1 animate-pulse"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.5), transparent)',
            }}
          />
        )}
      </div>
    </div>
  )
}
