export default function MedievalPanel({ children, className = '' }) {
  return (
    <div className={`panel-medieval relative ${className}`}>
      {/* Top decorative bar */}
      <div className="absolute -top-1 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
      
      {/* Corner rivets */}
      <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />
      <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />
      <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />
      <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-gold-light to-gold shadow-md" />

      {/* Content */}
      <div className="relative z-10 p-8">
        {children}
      </div>

      {/* Bottom decorative bar */}
      <div className="absolute -bottom-1 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
    </div>
  )
}
