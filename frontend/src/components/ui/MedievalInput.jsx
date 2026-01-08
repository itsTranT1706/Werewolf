/**
 * Medieval Input - Dark Fantasy Styled Input
 * 
 * Ancient stone-carved input field with mystical accents.
 * Feels like inscribing runes on weathered parchment.
 */

import { useState } from 'react'
import { RuneEye, RuneEyeClosed, RuneWarning } from './AncientIcons'

export default function MedievalInput({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  icon,
  error,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="relative">
      {/* Input container */}
      <div 
        className={`
          relative transition-all duration-500
          ${isFocused ? 'transform scale-[1.01]' : ''}
        `}
        style={{
          background: 'linear-gradient(180deg, rgba(15,12,10,0.95) 0%, rgba(20,16,12,0.98) 50%, rgba(15,12,10,0.95) 100%)',
          border: error 
            ? '2px solid rgba(139,0,0,0.6)' 
            : isFocused 
              ? '2px solid rgba(139,115,85,0.5)' 
              : '2px solid rgba(60,50,40,0.4)',
          boxShadow: isFocused 
            ? '0 0 20px rgba(139,115,85,0.15), inset 0 2px 8px rgba(0,0,0,0.6)'
            : 'inset 0 2px 8px rgba(0,0,0,0.6)',
        }}
      >
        {/* Left accent line */}
        <div 
          className="absolute left-0 top-2 bottom-2 w-0.5 transition-all duration-500"
          style={{
            background: isFocused 
              ? 'linear-gradient(180deg, transparent 0%, rgba(139,115,85,0.6) 50%, transparent 100%)'
              : 'linear-gradient(180deg, transparent 0%, rgba(80,70,60,0.3) 50%, transparent 100%)',
          }}
        />
        
        {/* Icon */}
        {icon && (
          <div 
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300
              ${isFocused ? 'text-[#8b7355]' : 'text-[#5a4a3a]'}
            `}
          >
            {icon}
          </div>
        )}

        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3.5 bg-transparent
            font-fantasy text-[#a89070] tracking-wide
            placeholder-[#5a4a3a] placeholder-opacity-100
            focus:outline-none
            ${icon ? 'pl-12' : 'pl-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
          `}
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            caretColor: '#8b7355',
          }}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a4a3a] hover:text-[#8b7355] transition-colors duration-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <RuneEyeClosed className="w-5 h-5" />
            ) : (
              <RuneEye className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Right accent line */}
        <div 
          className="absolute right-0 top-2 bottom-2 w-0.5 transition-all duration-500"
          style={{
            background: isFocused 
              ? 'linear-gradient(180deg, transparent 0%, rgba(139,115,85,0.6) 50%, transparent 100%)'
              : 'linear-gradient(180deg, transparent 0%, rgba(80,70,60,0.3) 50%, transparent 100%)',
          }}
        />

        {/* Corner accents */}
        <span className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${isFocused ? 'border-[#8b7355]/50' : 'border-[#5a4a3a]/30'}`} />
        <span className={`absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-300 ${isFocused ? 'border-[#8b7355]/50' : 'border-[#5a4a3a]/30'}`} />
        <span className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-300 ${isFocused ? 'border-[#8b7355]/50' : 'border-[#5a4a3a]/30'}`} />
        <span className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${isFocused ? 'border-[#8b7355]/50' : 'border-[#5a4a3a]/30'}`} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-[#8b0000]">
          <RuneWarning className="w-4 h-4 flex-shrink-0" />
          <p className="font-fantasy text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
