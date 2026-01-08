/**
 * Lore Section - Ancient Curse Whispers
 * 
 * Cryptic text that appears gradually on scroll.
 * Feels like whispers from an old curse.
 */

import { useEffect, useRef, useState } from 'react'
import { AncientSeal, ClawMarks, RuneDivider } from './symbols'

const LORE_TEXTS = [
  { text: "Máu đã chọn người...", delay: 0 },
  { text: "Trăng không còn mang ánh sáng.", delay: 300 },
  { text: "Trong bóng tối, có kẻ đang rình rập.", delay: 600 },
  { text: "Đừng tin bất kỳ ai.", delay: 900 },
]

export default function LoreSection() {
  const sectionRef = useRef(null)
  const [visibleItems, setVisibleItems] = useState([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal texts one by one
            LORE_TEXTS.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems(prev => [...prev, index])
              }, LORE_TEXTS[index].delay + index * 800)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      id="lore-section"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center py-32"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0a0a12 50%, #050508 100%)',
      }}
    >
      {/* Floating runes background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <FloatingRunes />
      </div>

      {/* Cracked stone divider top */}
      <div 
        className="absolute top-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(180deg, #050508 0%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Ancient symbol - using imported component */}
        <div className="flex justify-center mb-16 text-[#8b7355] opacity-20">
          <AncientSeal className="w-32 h-32" />
        </div>

        {/* Lore texts */}
        <div className="space-y-12">
          {LORE_TEXTS.map((item, index) => (
            <div key={index}>
              <p
                className={`font-fantasy text-xl md:text-2xl tracking-wider transition-all duration-[2000ms] ${
                  visibleItems.includes(index) 
                    ? 'opacity-60 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
                style={{
                  color: '#7a6a5a',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                }}
              >
                "{item.text}"
              </p>
              {/* Rune divider between texts */}
              {index < LORE_TEXTS.length - 1 && (
                <div 
                  className={`flex justify-center mt-8 text-[#5a4a3a] transition-all duration-[2000ms] ${
                    visibleItems.includes(index) ? 'opacity-20' : 'opacity-0'
                  }`}
                >
                  <RuneDivider className="w-32 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Claw mark divider - using imported component */}
        <div 
          className={`flex justify-center mt-20 text-[#5a4a3a] transition-all duration-[2000ms] delay-[3000ms] ${
            visibleItems.length >= LORE_TEXTS.length ? 'opacity-30' : 'opacity-0'
          }`}
        >
          <ClawMarks className="w-24 h-8" />
        </div>
      </div>

      {/* Cracked stone divider bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(0deg, #050508 0%, transparent 100%)',
        }}
      />
    </section>
  )
}

// Custom floating rune SVG component
function FloatingRuneSVG({ variant = 0 }) {
  const variants = [
    // Variant 0 - Simple cross rune
    <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2 L12 22 M6 8 L18 8"/>
    </svg>,
    // Variant 1 - Arrow rune
    <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2 L12 22 M6 8 L12 2 L18 8"/>
    </svg>,
    // Variant 2 - Diamond rune
    <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2 L22 12 L12 22 L2 12 Z"/>
    </svg>,
    // Variant 3 - Branch rune
    <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2 L12 22 M6 6 L12 12 L18 6"/>
    </svg>,
    // Variant 4 - Circle cross
    <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 4 L12 20 M4 12 L20 12"/>
    </svg>,
    // Variant 5 - Triangle rune
    <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4 L20 20 L4 20 Z"/>
    </svg>,
    // Variant 6 - Zigzag rune
    <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4 L18 12 L6 20"/>
    </svg>,
    // Variant 7 - Double line
    <svg key="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2 L8 22 M16 2 L16 22 M4 12 L20 12"/>
    </svg>,
  ]
  return variants[variant % variants.length]
}

function FloatingRunes() {
  return (
    <div className="relative w-full h-full">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-[#8b7355] w-10 h-10"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 13) % 70}%`,
            animation: `floatRune ${15 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.3,
          }}
        >
          <FloatingRuneSVG variant={i} />
        </div>
      ))}
    </div>
  )
}
