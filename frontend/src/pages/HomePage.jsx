/**
 * Home Page - The Forbidden Ritual Gateway
 * 
 * A dark, immersive opening experience that feels like
 * crossing into a cursed world, not a website.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from '@/components/home/HeroSection'
import LoreSection from '@/components/home/LoreSection'
import RitualsSection from '@/components/home/RitualsSection'
import CursedSoulsSection from '@/components/home/CursedSoulsSection'
import SacrificialGate from '@/components/home/SacrificialGate'

export default function HomePage() {
  const navigate = useNavigate()
  const [fadeToBlack, setFadeToBlack] = useState(false)

  // Handle ritual begin - scroll to next section
  const handleBeginRitual = () => {
    const loreSection = document.getElementById('lore-section')
    loreSection?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle final gate entry - navigate to login page
  const handleEnterDarkness = () => {
    setFadeToBlack(true)
    setTimeout(() => {
      navigate('/login')
    }, 1500)
  }

  return (
    <div className="relative bg-[#050508] text-parchment overflow-x-hidden">
      {/* Global fog overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            background: 'url(/assets/effects/fog.png)',
            backgroundSize: 'cover',
            animation: 'fogDrift 30s ease-in-out infinite',
          }}
        />
      </div>

      {/* Vignette overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Screen fade for transitions */}
      <div 
        className={`fixed inset-0 bg-black z-50 pointer-events-none transition-opacity duration-1000 ${
          fadeToBlack ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 1. HERO - The Dark Ritual Gate */}
      <HeroSection onBeginRitual={handleBeginRitual} />

      {/* 2. LORE - Ancient Curse Whispers */}
      <LoreSection />

      {/* 3. RITUALS - Forbidden Game Modes */}
      <RitualsSection />

      {/* 4. CURSED SOULS - Roles Preview */}
      <CursedSoulsSection />

      {/* 5. SACRIFICIAL GATE - Final Call */}
      <SacrificialGate onEnter={handleEnterDarkness} />
    </div>
  )
}
