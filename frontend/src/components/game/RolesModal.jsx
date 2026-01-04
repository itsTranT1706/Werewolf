/**
 * Roles Modal Component
 * Hiển thị thông tin về các vai trò trong game
 */

import { useState } from 'react'
import { ROLES, FACTION, FACTION_NAMES, getRolesByFaction } from '@/constants/roles'

export default function RolesModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('classic')
    const [expandedRole, setExpandedRole] = useState(null)

    if (!isOpen) return null

    // Filter roles by tab
    const getFilteredRoles = () => {
        if (activeTab === 'classic') {
            // Classic Werewolf roles - các vai trò cơ bản trong game Ma Sói cổ điển:
            // - Dân Làng (Villager) - role cơ bản, không có khả năng đặc biệt
            // - Thầy Bói (Seer) - xem vai trò mỗi đêm
            // - Phù Thủy (Witch) - thuốc cứu và thuốc độc
            // - Bảo Vệ (Bodyguard) - bảo vệ người khác
            // - Sói Trẻ (Young Wolf) - Ma Sói cơ bản
            return Object.values(ROLES).filter(role => role.isClassic === true)
        }
        return Object.values(ROLES)
    }

    const toggleRole = (roleId) => {
        setExpandedRole(expandedRole === roleId ? null : roleId)
    }

    const getFactionColor = (faction) => {
        switch (faction) {
            case FACTION.VILLAGER:
                return 'text-green-400'
            case FACTION.WEREWOLF:
                return 'text-red-400'
            case FACTION.NEUTRAL:
                return 'text-yellow-400'
            default:
                return 'text-gray-300'
        }
    }

    const getAuraColor = (aura) => {
        switch (aura) {
            case 'Thiện':
                return 'text-blue-400'
            case 'Ác':
                return 'text-red-400'
            case 'Trung Lập':
                return 'text-gray-400'
            default:
                return 'text-gray-300'
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-wood-dark to-wood-darker border-2 border-gold rounded-lg shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(180deg, rgba(30,22,15,0.98) 0%, rgba(20,15,10,0.99) 100%)',
                    boxShadow: '0 0 40px rgba(201, 162, 39, 0.3), 0 8px 32px rgba(0,0,0,0.8)'
                }}
            >
                {/* Header */}
                <div className="p-6 border-b border-gold/30">
                    <div className="flex justify-between items-center">
                        <h2 className="font-medieval text-3xl text-gold tracking-wide">
                            Vai Trò
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-parchment/60 hover:text-parchment transition-colors text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gold/20">
                    <button
                        onClick={() => setActiveTab('classic')}
                        className={`flex-1 px-6 py-3 font-fantasy text-sm transition-colors ${activeTab === 'classic'
                            ? 'bg-gold/20 text-gold border-b-2 border-gold'
                            : 'text-parchment/60 hover:text-parchment hover:bg-wood-light/30'
                            }`}
                    >
                        Cổ Điển
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 px-6 py-3 font-fantasy text-sm transition-colors ${activeTab === 'all'
                            ? 'bg-gold/20 text-gold border-b-2 border-gold'
                            : 'text-parchment/60 hover:text-parchment hover:bg-wood-light/30'
                            }`}
                    >
                        Tất Cả
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 px-6 py-3 font-fantasy text-sm transition-colors ${activeTab === 'settings'
                            ? 'bg-gold/20 text-gold border-b-2 border-gold'
                            : 'text-parchment/60 hover:text-parchment hover:bg-wood-light/30'
                            }`}
                    >
                        Thiết Lập
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
                    {activeTab === 'settings' ? (
                        <div className="text-center text-parchment/60 py-8">
                            <p className="font-fantasy">Thiết lập sẽ có sớm...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {getFilteredRoles().map((role) => (
                                <div
                                    key={role.id}
                                    className="bg-wood-dark/50 border border-wood-light rounded-lg overflow-hidden"
                                >
                                    {/* Role Header */}
                                    <button
                                        onClick={() => toggleRole(role.id)}
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-wood-light/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center">
                                                <span className="text-xl">
                                                    {getRoleIcon(role.id)}
                                                </span>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-heading text-parchment text-lg">
                                                    {role.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className="text-parchment/40">
                                            {expandedRole === role.id ? '▼' : '▶'}
                                        </span>
                                    </button>

                                    {/* Role Details (Expanded) */}
                                    {expandedRole === role.id && (
                                        <div className="px-4 pb-4 pt-2 border-t border-wood-light/30">
                                            <p className="text-parchment/80 text-sm leading-relaxed mb-4">
                                                {role.description}
                                            </p>
                                            <div className="flex gap-4 flex-wrap">
                                                <span className={`px-3 py-1 rounded text-xs font-fantasy ${getFactionColor(role.faction)} bg-wood-light/20 border border-current/30`}>
                                                    Phe: {FACTION_NAMES[role.faction]}
                                                </span>
                                                {role.aura && (
                                                    <span className={`px-3 py-1 rounded text-xs font-fantasy ${getAuraColor(role.aura)} bg-wood-light/20 border border-current/30`}>
                                                        Hào quang: {role.aura}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gold/20 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-red-600/30 border border-red-500/50 rounded text-red-300 font-fantasy hover:bg-red-600/50 transition-colors"
                    >
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
    )
}

/**
 * Get icon for role
 */
function getRoleIcon(roleId) {
    const icons = {
        BODYGUARD: '🛡️',
        WATCHMAN: '🔔',
        SEER: '👁️',
        DETECTIVE: '🔍',
        MEDIUM: '🔮',
        SOUL_BINDER: '💀',
        MAYOR: '👑',
        WITCH: '🧪',
        MONSTER_HUNTER: '🏹',
        TRAITOR: '🎭',
        YOUNG_WOLF: '🐺',
        DARK_WOLF: '🌑',
        ALPHA_WOLF: '👑',
        PROPHET_WOLF: '🔮',
        FOOL: '🤡',
        SERIAL_KILLER: '🔪',
        VILLAGER: '👤'
    }
    return icons[roleId] || '❓'
}

/**
 * Classic Werewolf Game Explanation
 * 
 * Tab "Cổ Điển" hiển thị 5 vai trò cơ bản trong game Ma Sói cổ điển:
 * 
 * 1. Dân Làng (Villager) - Không có khả năng đặc biệt, nhiệm vụ là tìm ra Ma Sói
 * 2. Thầy Bói (Seer) - Xem vai trò của một người mỗi đêm
 * 3. Phù Thủy (Witch) - Có thuốc cứu (1 lần) và thuốc độc (1 lần)
 * 4. Bảo Vệ (Bodyguard) - Bảo vệ một người mỗi đêm, chết thay họ nếu bị tấn công
 * 5. Sói Trẻ (Young Wolf) - Ma Sói cơ bản, giết một người mỗi đêm cùng bầy Sói
 * 
 * Đây là setup cổ điển nhất và phổ biến nhất trong game Ma Sói.
 */

