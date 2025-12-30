export default function MedievalButton({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseClasses = 'btn-wood relative overflow-hidden'
  
  const variantClasses = {
    primary: '',
    secondary: 'bg-gradient-to-b from-stone-light to-stone-dark border-stone-dark',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <LoadingSpinner />
        </span>
      )}
      
      {/* Button content */}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>

      {/* Shine effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          transform: 'skewX(-20deg) translateX(-100%)',
          animation: 'none'
        }}
      />
    </button>
  )
}

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5 text-parchment" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
