/**
 * Role Setup Modal
 * Component cho quản trò chọn bộ vai trò trước khi bắt đầu game
 */

import { useState, useEffect } from 'react'
import { ROLES, FACTION } from '@/constants/roles'

export default function RoleSetupModal({
    isOpen,
    onClose,
    playerCount,
    onConfirm,
    initialSetup = null,
    availableRoles = null // Các role đã chọn khi tạo phòng
}) {
    const [roleSetup, setRoleSetup] = useState({})
    const [suggestedSetup, setSuggestedSetup] = useState({})
    const [warnings, setWarnings] = useState([])

    // Tính toán gợi ý tỉ lệ
    useEffect(() => {
        if (playerCount && isOpen) {
            const suggested = calculateSuggestedSetup(playerCount, availableRoles)
            setSuggestedSetup(suggested)

            // Nếu có initialSetup, dùng nó, không thì dùng suggested
            if (initialSetup) {
                setRoleSetup(initialSetup)
            } else {
                setRoleSetup(suggested)
            }

            validateSetup(suggested)
        }
    }, [playerCount, isOpen, initialSetup, availableRoles])

    // Tính toán gợi ý tỉ lệ (chỉ dùng các role có trong availableRoles)
    const calculateSuggestedSetup = (count, availableRolesList = availableRoles) => {
        const setup = {}

        // Lọc các role có trong availableRoles
        const allVillagerRoles = Object.values(ROLES).filter(r => r.faction === FACTION.VILLAGER)
        const allWerewolfRoles = Object.values(ROLES).filter(r => r.faction === FACTION.WEREWOLF)
        const allNeutralRoles = Object.values(ROLES).filter(r => r.faction === FACTION.NEUTRAL)

        const villagerRoles = availableRoles
            ? allVillagerRoles.filter(r => availableRoles.includes(r.id))
            : allVillagerRoles

        const werewolfRoles = availableRoles
            ? allWerewolfRoles.filter(r => availableRoles.includes(r.id))
            : allWerewolfRoles

        const neutralRoles = availableRoles
            ? allNeutralRoles.filter(r => availableRoles.includes(r.id))
            : allNeutralRoles

        // Số lượng Sói: 20-30% số người
        const werewolfCount = Math.max(1, Math.round(count * 0.25))
        
        // Chọn Sói từ availableRoles
        if (werewolfRoles.length > 0) {
            const alphaWolf = werewolfRoles.find(r => r.id === 'ALPHA_WOLF')
            const youngWolf = werewolfRoles.find(r => r.id === 'YOUNG_WOLF')
            
            if (alphaWolf) {
                setup['ALPHA_WOLF'] = 1
                if (werewolfCount > 1 && youngWolf) {
                    setup['YOUNG_WOLF'] = werewolfCount - 1
                } else if (werewolfCount > 1) {
                    // Nếu không có YOUNG_WOLF, dùng role đầu tiên khác
                    const otherWolf = werewolfRoles.find(r => r.id !== 'ALPHA_WOLF') || werewolfRoles[0]
                    setup[otherWolf.id] = werewolfCount - 1
                }
            } else {
                // Không có ALPHA_WOLF, dùng role đầu tiên
                setup[werewolfRoles[0].id] = werewolfCount
            }
        }

        // Chọn các role Dân làng từ availableRoles
        const seer = villagerRoles.find(r => r.id === 'SEER')
        const witch = villagerRoles.find(r => r.id === 'WITCH')
        const bodyguard = villagerRoles.find(r => r.id === 'BODYGUARD')

        if (seer) setup['SEER'] = 1
        if (witch) setup['WITCH'] = 1
        if (bodyguard && count >= 6) {
            setup['BODYGUARD'] = 1
        }

        // Fill còn lại với VILLAGER (nếu có trong availableRoles)
        const usedSlots = Object.values(setup).reduce((sum, c) => sum + c, 0)
        const remaining = count - usedSlots
        if (remaining > 0) {
            const villager = villagerRoles.find(r => r.id === 'VILLAGER')
            if (villager) {
                setup['VILLAGER'] = remaining
            } else if (villagerRoles.length > 0) {
                // Nếu không có VILLAGER, dùng role đầu tiên có sẵn
                const fallbackRole = villagerRoles.find(r => !setup[r.id]) || villagerRoles[0]
                setup[fallbackRole.id] = (setup[fallbackRole.id] || 0) + remaining
            }
        }

        return setup
    }

    // Validate setup
    const validateSetup = (setup) => {
        const warnings = []
        const total = Object.values(setup).reduce((sum, count) => sum + count, 0)

        // Check tổng số (lỗi cứng)
        if (total !== playerCount) {
            warnings.push(`❌ Tổng vai trò (${total}) không khớp với số người chơi (${playerCount})`)
        }

        // Check tỉ lệ Sói (chỉ cảnh báo mềm, vẫn cho bắt đầu)
        const werewolfCount = (setup['YOUNG_WOLF'] || 0) + (setup['ALPHA_WOLF'] || 0)
        const werewolfPercent = (werewolfCount / playerCount) * 100

        if (werewolfPercent < 20) {
            warnings.push(`⚠️ Phe Sói quá yếu (${werewolfPercent.toFixed(1)}%). Khuyến nghị: 20-30%`)
        } else if (werewolfPercent > 30) {
            warnings.push(`⚠️ Phe Sói quá mạnh (${werewolfPercent.toFixed(1)}%). Khuyến nghị: 20-30%`)
        }

        // Check có ít nhất 1 Sói và 1 Dân (lỗi cứng)
        if (werewolfCount === 0) {
            warnings.push('❌ Phải có ít nhất 1 Sói')
        }

        const villagerCount = total - werewolfCount
        if (villagerCount === 0) {
            warnings.push('❌ Phải có ít nhất 1 Dân làng')
        }

        setWarnings(warnings)

        // Chỉ chặn khi có lỗi cứng (❌)
        const hasCritical = warnings.some(w => w.startsWith('❌'))
        return !hasCritical
    }

    // Update role count
    const updateRoleCount = (roleId, delta) => {
        setRoleSetup(prev => {
            const newSetup = { ...prev }
            const current = newSetup[roleId] || 0
            const newCount = Math.max(0, current + delta)

            if (newCount === 0) {
                delete newSetup[roleId]
            } else {
                newSetup[roleId] = newCount
            }

            validateSetup(newSetup)
            return newSetup
        })
    }

    // Set role count directly
    const setRoleCount = (roleId, count) => {
        setRoleSetup(prev => {
            const newSetup = { ...prev }
            const countNum = parseInt(count) || 0

            if (countNum === 0) {
                delete newSetup[roleId]
            } else {
                newSetup[roleId] = countNum
            }

            validateSetup(newSetup)
            return newSetup
        })
    }

    // Apply suggested setup
    const applySuggested = () => {
        setRoleSetup(suggestedSetup)
        validateSetup(suggestedSetup)
    }

    // Handle confirm
    const handleConfirm = () => {
        if (validateSetup(roleSetup)) {
            onConfirm(roleSetup)
        }
    }

    // Get roles by faction (chỉ hiển thị các role đã chọn khi tạo phòng)
    const allVillagerRoles = Object.values(ROLES).filter(r => r.faction === FACTION.VILLAGER)
    const allWerewolfRoles = Object.values(ROLES).filter(r => r.faction === FACTION.WEREWOLF)
    const allNeutralRoles = Object.values(ROLES).filter(r => r.faction === FACTION.NEUTRAL)

    const villagerRoles = availableRoles
        ? allVillagerRoles.filter(r => availableRoles.includes(r.id))
        : allVillagerRoles

    const werewolfRoles = availableRoles
        ? allWerewolfRoles.filter(r => availableRoles.includes(r.id))
        : allWerewolfRoles

    const neutralRoles = availableRoles
        ? allNeutralRoles.filter(r => availableRoles.includes(r.id))
        : allNeutralRoles

    const totalRoles = Object.values(roleSetup).reduce((sum, count) => sum + count, 0)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-wood-dark border-4 border-gold rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="p-6 border-b border-wood-light">
                    <h2 className="font-heading text-3xl text-parchment-text mb-2">
                        ⚙️ Thiết Lập Bộ Vai Trò
                    </h2>
                    <p className="text-gold-dim">
                        Số người chơi: <span className="font-bold text-parchment-text">{playerCount}</span>
                    </p>
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                    <div className="p-4 bg-blood-dried/50 border-l-4 border-blood-red m-4">
                        {warnings.map((warning, idx) => (
                            <p key={idx} className="text-red-300 text-sm mb-1">{warning}</p>
                        ))}
                    </div>
                )}

                {/* Total count */}
                <div className="p-4 bg-wood-light/30 m-4 rounded border border-wood-light">
                    <div className="flex justify-between items-center">
                        <span className="text-parchment-text font-bold">Tổng vai trò:</span>
                        <span className={`text-2xl font-bold ${totalRoles === playerCount ? 'text-green-400' : 'text-red-400'}`}>
                            {totalRoles} / {playerCount}
                        </span>
                    </div>
                </div>

                {/* Role Setup */}
                <div className="p-6 space-y-6">
                    {/* Phe Dân Làng */}
                    <div>
                        <h3 className="font-heading text-xl text-green-400 mb-4 flex items-center gap-2">

                            Phe Dân Làng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {villagerRoles.map(role => (
                                <div key={role.id} className="flex items-center justify-between p-3 bg-wood-dark/50 border border-wood-light rounded">
                                    <div className="flex-1">
                                        <p className="font-heading text-parchment-text">{role.name}</p>
                                        <p className="text-xs text-parchment-text/60">{role.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateRoleCount(role.id, -1)}
                                            className="w-8 h-8 flex items-center justify-center bg-blood-dried border border-blood-red rounded text-parchment-text hover:bg-blood-red transition-colors"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            value={roleSetup[role.id] || 0}
                                            onChange={(e) => setRoleCount(role.id, e.target.value)}
                                            className="w-16 text-center bg-wood-dark border border-wood-light rounded text-parchment-text font-bold"
                                        />
                                        <button
                                            onClick={() => updateRoleCount(role.id, 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-green-900 border border-green-600 rounded text-parchment-text hover:bg-green-800 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phe Ma Sói */}
                    <div>
                        <h3 className="font-heading text-xl text-red-400 mb-4 flex items-center gap-2">

                            Phe Ma Sói
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {werewolfRoles.map(role => (
                                <div key={role.id} className="flex items-center justify-between p-3 bg-wood-dark/50 border border-wood-light rounded">
                                    <div className="flex-1">
                                        <p className="font-heading text-parchment-text">{role.name}</p>
                                        <p className="text-xs text-parchment-text/60">{role.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateRoleCount(role.id, -1)}
                                            className="w-8 h-8 flex items-center justify-center bg-blood-dried border border-blood-red rounded text-parchment-text hover:bg-blood-red transition-colors"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            value={roleSetup[role.id] || 0}
                                            onChange={(e) => setRoleCount(role.id, e.target.value)}
                                            className="w-16 text-center bg-wood-dark border border-wood-light rounded text-parchment-text font-bold"
                                        />
                                        <button
                                            onClick={() => updateRoleCount(role.id, 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-green-900 border border-green-600 rounded text-parchment-text hover:bg-green-800 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phe Độc Lập */}
                    {neutralRoles.length > 0 && (
                        <div>
                            <h3 className="font-heading text-xl text-amber-300 mb-4 flex items-center gap-2">

                                Phe Độc Lập
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {neutralRoles.map(role => (
                                    <div key={role.id} className="flex items-center justify-between p-3 bg-wood-dark/50 border border-wood-light rounded">
                                        <div className="flex-1">
                                            <p className="font-heading text-parchment-text">{role.name}</p>
                                            <p className="text-xs text-parchment-text/60">{role.id}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateRoleCount(role.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center bg-blood-dried border border-blood-red rounded text-parchment-text hover:bg-blood-red transition-colors"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                value={roleSetup[role.id] || 0}
                                                onChange={(e) => setRoleCount(role.id, e.target.value)}
                                                className="w-16 text-center bg-wood-dark border border-wood-light rounded text-parchment-text font-bold"
                                            />
                                            <button
                                                onClick={() => updateRoleCount(role.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-green-900 border border-green-600 rounded text-parchment-text hover:bg-green-800 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-wood-light flex justify-between gap-4">
                    <button
                        onClick={applySuggested}
                        className="px-6 py-3 bg-wood-light border border-wood-dark rounded text-parchment-text hover:bg-wood-dark transition-colors"
                    >
                        🔄 Áp Dụng Gợi Ý
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-blood-dried border border-blood-red rounded text-parchment-text hover:bg-blood-red transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={totalRoles !== playerCount || warnings.some(w => w.includes('❌'))}
                            className="px-6 py-3 bg-gold border border-gold-dark rounded text-wood-dark font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ✅ Xác Nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

