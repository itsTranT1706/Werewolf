/**
 * Sacrificial Gate - Final Call to Action
 * 
 * The point of no return. Almost completely black.
 * Clicking leads to the existing Login page.
 */

export default function SacrificialGate({ onEnter }) {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center py-32"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #020203 50%, #000000 100%)',
      }}
    >
      {/* Faint blood moon glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, rgba(139,0,0,0.5) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-md mx-auto px-6 text-center">
        {/* Warning text */}
        <p 
          className="font-fantasy text-lg md:text-xl tracking-wider mb-12 leading-relaxed"
          style={{ 
            color: '#5a4a3a',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          "Một khi ngươi bước vào...<br/>
          <span className="text-[#8b0000]/70">sẽ không có đường quay lại.</span>"
        </p>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className="group relative px-16 py-5 font-medieval text-xl tracking-[0.3em] uppercase transition-all duration-700"
          style={{
            color: '#8b0000',
            background: 'transparent',
            border: '1px solid rgba(139,0,0,0.3)',
          }}
        >
          {/* Glow effect */}
          <span 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(139,0,0,0.15) 0%, transparent 70%)',
            }}
          />
          
          <span className="relative z-10 group-hover:text-[#cc0000] transition-colors duration-700">
            Bước Vào Bóng Tối
          </span>

          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#8b0000]/40 group-hover:border-[#cc0000]/60 transition-all duration-500" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#8b0000]/40 group-hover:border-[#cc0000]/60 transition-all duration-500" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#8b0000]/40 group-hover:border-[#cc0000]/60 transition-all duration-500" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#8b0000]/40 group-hover:border-[#cc0000]/60 transition-all duration-500" />
        </button>
      </div>
    </section>
  )
}
