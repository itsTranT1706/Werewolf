/**
 * Mystic Backdrop - Shared dark medieval fantasy background
 * 
 * Provides consistent layered atmosphere across pages.
 */

export default function MysticBackdrop({
  children,
  className = '',
  showMoon = false,
  showHorizontalOverlay = true,
  showFog = true,
}) {
  return (
    <div className={`min-h-screen relative overflow-hidden theme-backdrop ${className}`}>
      <div className="absolute inset-0 theme-forest" />
      <div className="absolute inset-0 theme-overlay-vertical" />
      {showHorizontalOverlay && <div className="absolute inset-0 theme-overlay-horizontal" />}
      <div className="absolute inset-0 pointer-events-none theme-vignette" />
      {showFog && <div className="absolute inset-0 pointer-events-none theme-fog" />}
      {showMoon && (
        <div className="absolute top-10 right-1/4 w-32 h-32 rounded-full pointer-events-none theme-moon" />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
