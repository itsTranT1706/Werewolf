/**
 * Medieval Panel - Dark Fantasy Container
 * 
 * Ancient stone/wood panel with mystical border accents.
 * Feels like an artifact from a forgotten ritual.
 */

import { CornerAccent } from './AncientIcons'

export default function MedievalPanel({ children, className = '', variant = 'default' }) {
  const variants = {
    default: {
      background: 'linear-gradient(180deg, rgba(20,16,12,0.97) 0%, rgba(15,12,10,0.98) 50%, rgba(10,8,6,0.97) 100%)',
      border: 'rgba(60,50,40,0.5)',
      glow: 'rgba(139,115,85,0.1)',
    },
    dark: {
      background: 'linear-gradient(180deg, rgba(10,8,6,0.98) 0%, rgba(8,6,4,0.99) 50%, rgba(5,4,3,0.98) 100%)',
      border: 'rgba(40,35,30,0.5)',
      glow: 'rgba(80,70,60,0.1)',
    },
    blood: {
      background: 'linear-gradient(180deg, rgba(30,15,15,0.97) 0%, rgba(20,10,10,0.98) 50%, rgba(15,8,8,0.97) 100%)',
      border: 'rgba(139,0,0,0.4)',
      glow: 'rgba(139,0,0,0.1)',
    },
  }

  const style = variants[variant] || variants.default

  return (
    <div 
      className={`relative ${className}`}
      style={{
        background: style.background,
        border: `2px solid ${style.border}`,
        boxShadow: `
          0 0 30px ${style.glow},
          0 10px 40px rgba(0,0,0,0.6),
          inset 0 1px 0 rgba(255,255,255,0.03),
          inset 0 -1px 0 rgba(0,0,0,0.3)
        `,
      }}
    >
      {/* Top decorative line */}
      <div 
        className="absolute -top-px left-8 right-8 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(139,115,85,0.4) 50%, transparent 100%)',
        }}
      />
      
      {/* Corner accents */}
      <div className="absolute top-2 left-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="top-left" />
      </div>
      <div className="absolute top-2 right-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="top-right" />
      </div>
      <div className="absolute bottom-2 left-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="bottom-left" />
      </div>
      <div className="absolute bottom-2 right-2 text-[#8b7355] opacity-40">
        <CornerAccent className="w-5 h-5" position="bottom-right" />
      </div>

      {/* Mystical corner rivets */}
      <div 
        className="absolute top-3 left-3 w-2 h-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,115,85,0.6) 0%, rgba(92,61,30,0.8) 100%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      />
      <div 
        className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,115,85,0.6) 0%, rgba(92,61,30,0.8) 100%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      />
      <div 
        className="absolute bottom-3 left-3 w-2 h-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,115,85,0.6) 0%, rgba(92,61,30,0.8) 100%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      />
      <div 
        className="absolute bottom-3 right-3 w-2 h-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,115,85,0.6) 0%, rgba(92,61,30,0.8) 100%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-8">
        {children}
      </div>

      {/* Bottom decorative line */}
      <div 
        className="absolute -bottom-px left-8 right-8 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(139,115,85,0.4) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}
