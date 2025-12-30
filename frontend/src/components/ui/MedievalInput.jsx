import { useState } from 'react'

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
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="relative ">
      {/* Input container with stone carved effect */}
      <div className="relative ">
        {/* Decorative left border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold/30 via-gold/60 to-gold/30" />
        
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment/50">
            {icon}
          </div>
        )}

        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            input-stone w-full
            font-semibold
            ${icon ? 'pl-12' : 'pl-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
            ${error ? 'border-blood-red' : ''}
          `}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-parchment/50 hover:text-gold transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Decorative right border */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold/30 via-gold/60 to-gold/30" />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-blood-red text-sm font-fantasy flex items-center gap-1">
          <span className="text-lg">⚠</span> {error}
        </p>
      )}
    </div>
  )
}

// Simple eye icons
function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}
