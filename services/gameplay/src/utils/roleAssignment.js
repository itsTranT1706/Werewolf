import { ROLES } from '../constants/roles.js'

/**
 * Phân vai trò cho người chơi dựa trên số lượng
 * 
 * @param {number} playerCount - Số lượng người chơi
 * @returns {Array<string>} - Mảng role IDs
 */
export function assignRoles(playerCount) {
    const roles = []

    // Minimum 8 players
    if (playerCount < 8) {
        throw new Error('Cần ít nhất 8 người chơi')
    }

    // Setup cơ bản cho 8-12 players
    if (playerCount >= 8 && playerCount <= 12) {
        // 2-3 Sói (tùy số người)
        const werewolfCount = playerCount <= 10 ? 2 : 3

        if (werewolfCount === 2) {
            roles.push('YOUNG_WOLF', 'ALPHA_WOLF')
        } else {
            roles.push('YOUNG_WOLF', 'ALPHA_WOLF', 'DARK_WOLF')
        }

        // Special villagers (3-4 roles)
        roles.push('SEER', 'WITCH', 'BODYGUARD')

        if (playerCount >= 10) {
            roles.push('MONSTER_HUNTER')
        }

        // Fill rest with villagers hoặc special roles
        const remaining = playerCount - roles.length
        const specialRoles = ['DETECTIVE', 'WATCHMAN', 'MEDIUM', 'MAYOR']

        // Thêm 1-2 special roles nếu còn chỗ
        for (let i = 0; i < Math.min(remaining - 1, 2); i++) {
            if (specialRoles.length > 0) {
                const randomIndex = Math.floor(Math.random() * specialRoles.length)
                roles.push(specialRoles.splice(randomIndex, 1)[0])
            }
        }

        // Fill còn lại với VILLAGER (hoặc có thể thêm SOUL_BINDER, FOOL, SERIAL_KILLER)
        const availableNeutrals = ['FOOL', 'SERIAL_KILLER']
        while (roles.length < playerCount) {
            // 10% chance cho neutral roles nếu còn chỗ và chưa dùng hết
            const remainingSlots = playerCount - roles.length
            if (remainingSlots > 1 && availableNeutrals.length > 0 && Math.random() < 0.1) {
                const randomIndex = Math.floor(Math.random() * availableNeutrals.length)
                const selectedNeutral = availableNeutrals.splice(randomIndex, 1)[0]
                roles.push(selectedNeutral)
            } else {
                // Default: VILLAGER (có thể có nhiều bản)
                roles.push('VILLAGER')
            }
        }
    }

    // Shuffle để random (Fisher-Yates algorithm)
    const shuffledRoles = shuffleArray(roles)

    // Validate không có unique roles bị trùng (trừ VILLAGER)
    const uniqueRoles = ['SEER', 'WITCH', 'BODYGUARD', 'DETECTIVE', 'WATCHMAN', 'MEDIUM', 'MAYOR', 'MONSTER_HUNTER', 'SOUL_BINDER', 'FOOL', 'SERIAL_KILLER', 'ALPHA_WOLF', 'PROPHET_WOLF', 'DARK_WOLF']
    const roleCounts = {}
    shuffledRoles.forEach(role => {
        roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    // Check các unique roles không được trùng
    for (const uniqueRole of uniqueRoles) {
        if (roleCounts[uniqueRole] > 1) {
            console.warn(`⚠️ Warning: Unique role ${uniqueRole} appears ${roleCounts[uniqueRole]} times!`)
            // Có thể throw error hoặc fix tự động
        }
    }

    return shuffledRoles
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

/**
 * Validate role assignment
 */
export function validateRoleAssignment(roles, playerCount) {
    if (roles.length !== playerCount) {
        return { valid: false, error: 'Số vai trò không khớp với số người chơi' }
    }

    // Check có ít nhất 1 Sói
    const werewolfCount = roles.filter(r =>
        ['YOUNG_WOLF', 'ALPHA_WOLF', 'DARK_WOLF', 'PROPHET_WOLF', 'TRAITOR'].includes(r)
    ).length

    if (werewolfCount === 0) {
        return { valid: false, error: 'Phải có ít nhất 1 Sói' }
    }

    // Check có ít nhất 1 Dân làng
    const villagerCount = roles.filter(r =>
        ['SEER', 'WITCH', 'BODYGUARD', 'DETECTIVE', 'WATCHMAN', 'MEDIUM', 'MAYOR', 'MONSTER_HUNTER', 'SOUL_BINDER', 'VILLAGER'].includes(r)
    ).length

    if (villagerCount === 0) {
        return { valid: false, error: 'Phải có ít nhất 1 Dân làng' }
    }

    // ✅ Check các unique roles không bị trùng (trừ VILLAGER và YOUNG_WOLF có thể có nhiều)
    const uniqueRoles = ['SEER', 'WITCH', 'BODYGUARD', 'DETECTIVE', 'WATCHMAN', 'MEDIUM', 'MAYOR', 'MONSTER_HUNTER', 'SOUL_BINDER', 'FOOL', 'SERIAL_KILLER', 'ALPHA_WOLF', 'PROPHET_WOLF', 'DARK_WOLF', 'TRAITOR']
    const roleCounts = {}
    roles.forEach(role => {
        roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    // Kiểm tra từng unique role
    for (const uniqueRole of uniqueRoles) {
        if (roleCounts[uniqueRole] > 1) {
            return {
                valid: false,
                error: `Vai trò ${uniqueRole} bị trùng (xuất hiện ${roleCounts[uniqueRole]} lần). Mỗi vai trò đặc biệt chỉ được có 1 bản.`
            }
        }
    }

    return { valid: true }
}