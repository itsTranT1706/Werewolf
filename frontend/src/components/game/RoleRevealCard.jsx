/**
 * Role Reveal Card Component
 * 
 * Displays the player's assigned role in a medieval tarot card style.
 * Designed to feel like uncovering a cursed card in a dark ritual.
 * 
 * Features:
 * - Ancient card frame with parchment texture
 * - Centered role image
 * - Subtle glow effect based on faction
 * - Dark, mysterious atmosphere
 * 
 * Note: MODERATOR role uses a simple display instead of card style.
 */

import { useState, useEffect } from 'react'
import { ROLES, FACTION, FACTION_NAMES, getRoleImage, getRoleIcon } from '@/constants/roles'

/**
 * Get faction-based colors for card styling
 */
function getFactionColors(faction) {
    switch (faction) {
        case FACTION.VILLAGER:
            return {
                glow: 'rgba(34, 197, 94, 0.4)',
                border: '#4ade80',
                text: 'text-green-400',
                bg: 'from-green-900/30 to-green-950/50'
            }
        case FACTION.WEREWOLF:
            return {
                glow: 'rgba(239, 68, 68, 0.4)',
                border: '#ef4444',
                text: 'text-red-400',
                bg: 'from-red-900/30 to-red-950/50'
            }
        case FACTION.NEUTRAL:
            return {
                glow: 'rgba(234, 179, 8, 0.4)',
                border: '#eab308',
                text: 'text-yellow-400',
                bg: 'from-yellow-900/30 to-yellow-950/50'
            }
        default:
            return {
                glow: 'rgba(201, 162, 39, 0.3)',
                border: '#c9a227',
                text: 'text-gold',
                bg: 'from-amber-900/30 to-amber-950/50'
            }
    }
}

/**
 * Moderator Display - Simple, non-card style for game master
 */
function ModeratorDisplay({ role, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Simple panel */}
            <div className="relative bg-gradient-to-b from-[#1a1510] to-[#0d0a07] border-2 border-gold/50 rounded-lg p-8 max-w-md text-center">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="font-medieval text-2xl text-gold mb-2">
                    {role.name}
                </h2>
                <p className="font-fantasy text-parchment/70 text-sm mb-6">
                    {role.description}
                </p>
                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gold/20 border border-gold/50 rounded font-fantasy text-gold hover:bg-gold/30 transition-colors"
                >
                    Bắt Đầu Điều Phối
                </button>
            </div>
        </div>
    )
}

/**
 * Card Frame Component - The mystical card border
 */
function CardFrame({ children, factionColors }) {
    return (
        <div 
            className="relative"
            style={{
                filter: `drop-shadow(0 0 20px ${factionColors.glow})`
            }}
        >
            {/* Outer frame - ancient wood/stone texture effect */}
            <div 
                className="relative p-2 rounded-lg"
                style={{
                    background: 'linear-gradient(135deg, #3d2914 0%, #1a0f08 50%, #2a1a0e 100%)',
                    boxShadow: `
                        inset 0 2px 4px rgba(255,255,255,0.1),
                        inset 0 -2px 4px rgba(0,0,0,0.5),
                        0 0 30px ${factionColors.glow}
                    `
                }}
            >
                {/* Decorative corner runes */}
                <div className="absolute top-1 left-1 w-6 h-6 border-l-2 border-t-2 border-gold/40 rounded-tl" />
                <div className="absolute top-1 right-1 w-6 h-6 border-r-2 border-t-2 border-gold/40 rounded-tr" />
                <div className="absolute bottom-1 left-1 w-6 h-6 border-l-2 border-b-2 border-gold/40 rounded-bl" />
                <div className="absolute bottom-1 right-1 w-6 h-6 border-r-2 border-b-2 border-gold/40 rounded-br" />
                
                {/* Inner frame - parchment area */}
                <div 
                    className="relative rounded overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, #2a1f15 0%, #1a1410 50%, #0f0a05 100%)',
                        border: `1px solid ${factionColors.border}40`
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

/**
 * Role Image Component - Displays the role artwork
 */
function RoleImage({ roleId, roleName, factionColors }) {
    const [imageError, setImageError] = useState(false)
    const imagePath = getRoleImage(roleId)
    const icon = getRoleIcon(roleId)
    
    if (!imagePath || imageError) {
        // Fallback to emoji icon
        return (
            <div 
                className="w-full aspect-[3/4] flex items-center justify-center"
                style={{
                    background: `radial-gradient(ellipse at center, ${factionColors.glow} 0%, transparent 70%)`
                }}
            >
                <span className="text-8xl">{icon}</span>
            </div>
        )
    }
    
    return (
        <div className="relative w-full aspect-[3/4] overflow-hidden">
            {/* Vignette overlay */}
            <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%),
                        linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)
                    `
                }}
            />
            
            {/* Subtle glow behind image */}
            <div 
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at center, ${factionColors.glow} 0%, transparent 60%)`
                }}
            />
            
            {/* Role image */}
            <img
                src={imagePath}
                alt={roleName}
                className="relative z-0 w-full h-full object-cover"
                onError={() => setImageError(true)}
            />
        </div>
    )
}

/**
 * Main Role Reveal Card Component
 */
export default function RoleRevealCard({ 
    roleId, 
    roleName, 
    faction, 
    isOpen, 
    onClose 
}) {
    const [isRevealing, setIsRevealing] = useState(false)
    
    // Get role details
    const role = ROLES[roleId] || {
        id: roleId,
        name: roleName || roleId,
        faction: faction || FACTION.NEUTRAL,
        description: 'Vai trò bí ẩn...'
    }
    
    const factionColors = getFactionColors(role.faction)
    
    // Trigger reveal animation on open
    useEffect(() => {
        if (isOpen) {
            setIsRevealing(true)
        }
    }, [isOpen])
    
    if (!isOpen) return null
    
    // Special handling for Moderator
    if (roleId === 'MODERATOR') {
        return <ModeratorDisplay role={role} onClose={onClose} />
    }
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark ritual backdrop */}
            <div 
                className="absolute inset-0 bg-black/90"
                onClick={onClose}
                style={{
                    background: `
                        radial-gradient(ellipse at center, rgba(20,10,5,0.95) 0%, rgba(0,0,0,0.98) 100%)
                    `
                }}
            />
            
            {/* Ambient particles/dust effect (static) */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay'
                }}
            />
            
            {/* Card container with reveal animation */}
            <div 
                className={`relative transition-all duration-700 ease-out ${
                    isRevealing 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 translate-y-8'
                }`}
            >
                <CardFrame factionColors={factionColors}>
                    {/* Card content */}
                    <div className="w-72 sm:w-80">
                        {/* Top ornament */}
                        <div className="h-8 flex items-center justify-center border-b border-gold/20">
                            <div className="flex items-center gap-2">
                                <span className="text-gold/40">✦</span>
                                <span className="font-medieval text-xs text-gold/60 tracking-widest uppercase">
                                    Số Phận Của Ngươi
                                </span>
                                <span className="text-gold/40">✦</span>
                            </div>
                        </div>
                        
                        {/* Role image area */}
                        <RoleImage 
                            roleId={role.id} 
                            roleName={role.name}
                            factionColors={factionColors}
                        />
                        
                        {/* Role name banner */}
                        <div 
                            className={`py-4 px-4 text-center bg-gradient-to-b ${factionColors.bg}`}
                            style={{
                                borderTop: `1px solid ${factionColors.border}40`,
                                borderBottom: `1px solid ${factionColors.border}40`
                            }}
                        >
                            <h2 className={`font-medieval text-2xl ${factionColors.text} tracking-wide`}>
                                {role.name}
                            </h2>
                            <p className="font-fantasy text-xs text-parchment/50 mt-1">
                                Phe {FACTION_NAMES[role.faction]}
                            </p>
                        </div>
                        
                        {/* Bottom ornament & close button */}
                        <div className="p-4 border-t border-gold/20 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-gold/30">
                                <span>─────</span>
                                <span>☽</span>
                                <span>─────</span>
                            </div>
                            
                            <button
                                onClick={onClose}
                                className={`
                                    w-full py-3 rounded
                                    bg-gradient-to-b from-gold/20 to-gold/10
                                    border border-gold/40
                                    font-fantasy text-sm text-gold
                                    hover:from-gold/30 hover:to-gold/20
                                    transition-all duration-300
                                    active:scale-95
                                `}
                            >
                                Chấp Nhận Số Phận
                            </button>
                        </div>
                    </div>
                </CardFrame>
            </div>
        </div>
    )
}

/**
 * HOW TO ADD NEW ROLES:
 * 
 * 1. Add role image to: /public/assets/role-images/[rolename].png
 *    - Recommended size: 300x400px (3:4 aspect ratio)
 *    - Style: Dark, mysterious, medieval artwork
 * 
 * 2. Update ROLE_IMAGES in /src/constants/roles.js:
 *    NEW_ROLE: '/assets/role-images/newrole.png'
 * 
 * 3. Add role definition to ROLES in /src/constants/roles.js:
 *    NEW_ROLE: {
 *        id: 'NEW_ROLE',
 *        name: 'Tên Vai Trò',
 *        faction: 'VILLAGER' | 'WEREWOLF' | 'NEUTRAL',
 *        description: 'Mô tả vai trò...',
 *        aura: 'Thiện' | 'Ác' | 'Trung Lập'
 *    }
 * 
 * 4. (Optional) Add icon to ROLE_ICONS for emoji fallback
 */
