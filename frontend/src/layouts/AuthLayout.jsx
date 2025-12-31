import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark fantasy background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-blue/80 via-transparent to-night-blue/90" />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Ambient fog layers */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'url(/assets/effects/fog.png)',
          backgroundSize: 'cover',
          animation: 'fogDrift 20s ease-in-out infinite'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Game title */}
        <div className="mb-8 text-center">
          <h1 className="font-medieval text-5xl md:text-6xl text-gold-glow tracking-wider">
            WEREWOLF
          </h1>
          <p className="font-fantasy text-parchment/70 text-sm tracking-[0.3em] mt-2 uppercase">
            The Village Awaits
          </p>
        </div>

        {/* Auth form container */}
        <Outlet />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-fantasy text-parchment/40 text-xs tracking-wider">
            © The Ancient Order of Wolves
          </p>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-30 pointer-events-none">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none transform scale-x-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-30 pointer-events-none transform scale-y-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30 pointer-events-none transform scale-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
    </div>
  )
}
