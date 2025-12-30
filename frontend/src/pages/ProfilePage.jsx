/**
 * Profile Page - Fantasy RPG Character Sheet Style
 * 
 * Displays player profile information in an immersive game UI.
 * Feels like viewing a character sheet, not a web dashboard.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalButton, Divider } from '@/components/ui'
import { profileApi, authApi } from '@/api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await profileApi.getMe()
      setProfile(data)
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    navigate('/login')
  }

  const handleEditProfile = () => {
    navigate('/profile/edit')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Dark fantasy background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/backgrounds/dark-forest.jpg')`,
          filter: 'brightness(0.3) saturate(0.7)'
        }}
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-blue/60 via-transparent to-night-blue/80" />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Page title */}
        <div className="text-center mb-6">
          <h1 className="font-medieval text-4xl text-gold-glow tracking-wider">
            Character Sheet
          </h1>
          <p className="font-fantasy text-parchment/50 text-sm tracking-widest uppercase mt-1">
            Your Legend Awaits
          </p>
        </div>

        <MedievalPanel>
          {loading ? (
            <ProfileSkeleton />
          ) : error ? (
            <ProfileError message={error} onRetry={loadProfile} />
          ) : (
            <ProfileContent 
              profile={profile} 
              onEdit={handleEditProfile}
              onLogout={handleLogout}
            />
          )}
        </MedievalPanel>
      </div>

      {/* Corner ornaments */}
      <CornerOrnaments />
    </div>
  )
}

/**
 * Profile content with avatar, info, and actions
 */
function ProfileContent({ profile, onEdit, onLogout }) {
  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <div className="flex flex-col items-center">
        <AvatarFrame src={profile?.avatar} />
        
        {/* Username */}
        <h2 className="font-medieval text-2xl text-gold mt-4 tracking-wide">
          {profile?.username || 'Unknown Traveler'}
        </h2>
        
        {/* Title / Role flavor text */}
        <p className="font-fantasy text-parchment/60 text-sm italic mt-1">
          {profile?.title || 'Villager of the Realm'}
        </p>
      </div>

      <Divider />

      {/* Profile info */}
      <div className="space-y-4">
        <ProfileField 
          icon={<ScrollIcon />} 
          label="Name" 
          value={profile?.username} 
        />
        <ProfileField 
          icon={<MailIcon />} 
          label="Raven Address" 
          value={profile?.email} 
        />
        <ProfileField 
          icon={<ShieldIcon />} 
          label="Member Since" 
          value={formatDate(profile?.createdAt)} 
        />
      </div>

      <Divider />

      {/* Action buttons */}
      <div className="space-y-3">
        <MedievalButton onClick={onEdit} className="w-full">
          <span className="flex items-center justify-center gap-2">
            <QuillIcon className="w-5 h-5" />
            Update Profile
          </span>
        </MedievalButton>

        <MedievalButton 
          onClick={onLogout} 
          variant="secondary"
          className="w-full !bg-gradient-to-b !from-stone-700 !to-stone-900 !border-blood-red/50 hover:!border-blood-red"
        >
          <span className="flex items-center justify-center gap-2 text-parchment/80 hover:text-blood-red">
            <ExitIcon className="w-5 h-5" />
            Leave the Village
          </span>
        </MedievalButton>
      </div>
    </div>
  )
}

/**
 * Fantasy-framed avatar
 */
function AvatarFrame({ src }) {
  return (
    <div className="relative">
      {/* Outer frame glow */}
      <div 
        className="absolute -inset-2 rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)'
        }}
      />
      
      {/* Frame border */}
      <div 
        className="relative w-28 h-28 rounded-full p-1"
        style={{
          background: 'linear-gradient(135deg, #c9a227 0%, #8b6914 50%, #c9a227 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        {/* Inner frame */}
        <div className="w-full h-full rounded-full p-1 bg-wood-dark">
          {/* Avatar image */}
          <div 
            className="w-full h-full rounded-full bg-stone-dark flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.6)'
            }}
          >
            {src ? (
              <img 
                src={src} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <WolfIcon className="w-12 h-12 text-parchment/40" />
            )}
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-gold/60" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-gold/60" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-gold/60" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-gold/60" />
    </div>
  )
}

/**
 * Single profile field row
 */
function ProfileField({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gold/60 w-6 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-fantasy text-parchment/50 text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="font-fantasy text-parchment text-sm truncate">
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

/**
 * Loading skeleton
 */
function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 rounded-full bg-stone-dark/50" />
        <div className="h-6 w-32 bg-stone-dark/50 mt-4 rounded" />
        <div className="h-4 w-24 bg-stone-dark/30 mt-2 rounded" />
      </div>
      <Divider />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 bg-stone-dark/30 rounded" />
            <div className="flex-1">
              <div className="h-3 w-16 bg-stone-dark/30 rounded mb-1" />
              <div className="h-4 w-32 bg-stone-dark/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Error state
 */
function ProfileError({ message, onRetry }) {
  return (
    <div className="text-center py-8">
      <div className="text-blood-red text-4xl mb-4">⚠</div>
      <p className="font-fantasy text-parchment/70 mb-4">{message}</p>
      <MedievalButton onClick={onRetry}>
        Try Again
      </MedievalButton>
    </div>
  )
}

/**
 * Corner decorations
 */
function CornerOrnaments() {
  return (
    <>
      <div className="absolute top-4 left-4 w-20 h-20 opacity-20 pointer-events-none">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute top-4 right-4 w-20 h-20 opacity-20 pointer-events-none transform scale-x-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-4 left-4 w-20 h-20 opacity-20 pointer-events-none transform scale-y-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-4 right-4 w-20 h-20 opacity-20 pointer-events-none transform scale-[-1]">
        <img src="/assets/ui/corner-ornament.png" alt="" className="w-full h-full" />
      </div>
    </>
  )
}

// Utility
function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Icons
function WolfIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 4c-2 0-4 1-6 3l-4 6-8-2c-2 0-3 1-3 3l2 10-6 8c-1 2 0 4 2 5l8 4v12c0 2 1 4 3 5l10 4c1 0 2 0 4-1l10-4c2-1 3-3 3-5V41l8-4c2-1 3-3 2-5l-6-8 2-10c0-2-1-3-3-3l-8 2-4-6c-2-2-4-3-6-3zm-8 24a3 3 0 110 6 3 3 0 010-6zm16 0a3 3 0 110 6 3 3 0 010-6zm-8 10c2 0 4 2 4 4h-8c0-2 2-4 4-4z"/>
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h1V4h11v16h1a2 2 0 002-2V4a2 2 0 00-2-2H6zm3 4v2h6V6H9zm0 4v2h6v-2H9zm0 4v2h4v-2H9z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function QuillIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/>
    </svg>
  )
}

function ExitIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
