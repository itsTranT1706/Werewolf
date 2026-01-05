import { ROLES } from '../constants/roles.js'

/**
 * Phân vai trò cho người chơi dựa trên số lượng (auto mode)
 * 
 * @param {number} playerCount - Số lượng người chơi
 * @returns {Array<string>} - Mảng role IDs
 */
export function assignRoles(playerCount) {
    const roles = []

    // Minimum 3 players, maximum 75 players
    if (playerCount < 3) {
        throw new Error('Cần ít nhất 3 người chơi')
    }

    if (playerCount > 75) {
        throw new Error('Tối đa 75 người chơi')
    }

    // Thiết kế cân bằng cho 3-75 players
    // Game 6 người: 2 Sói + 4 Dân làng (SEER, WITCH, BODYGUARD, VILLAGER)
    if (playerCount >= 3 && playerCount <= 75) {
        // Tính số lượng Sói theo tỷ lệ cân bằng (20-30%)
        let finalWerewolfCount
        if (playerCount === 3) {
            finalWerewolfCount = 1  // 3 người: 1 Sói
        } else if (playerCount <= 5) {
            finalWerewolfCount = 1  // 4-5 người: 1 Sói
        } else if (playerCount === 6) {
            finalWerewolfCount = 2  // Chính xác 2 Sói cho game 6 người
        } else if (playerCount <= 8) {
            finalWerewolfCount = 2
        } else if (playerCount === 9) {
            finalWerewolfCount = 3
        } else {
            // 10-75 players: ~25% Sói (làm tròn)
            finalWerewolfCount = Math.max(2, Math.round(playerCount * 0.25))
        }

        // Thêm Sói
        if (finalWerewolfCount === 1) {
            roles.push('ALPHA_WOLF')
        } else if (finalWerewolfCount === 2) {
            roles.push('YOUNG_WOLF', 'ALPHA_WOLF')
        } else {
            // 3+ Sói: 1 ALPHA_WOLF + các YOUNG_WOLF
            roles.push('ALPHA_WOLF')
            for (let i = 1; i < finalWerewolfCount; i++) {
                roles.push('YOUNG_WOLF')
            }
        }

        // Số lượng Dân làng còn lại
        const villagerCount = playerCount - finalWerewolfCount

        // Luôn có SEER và WITCH (roles quan trọng nhất)
        roles.push('SEER', 'WITCH')

        // Thêm BODYGUARD cho game >= 6 players
        if (villagerCount >= 3) {
            roles.push('BODYGUARD')
        }

        // Fill còn lại với VILLAGER
        const specialVillagers = roles.filter(r =>
            ['SEER', 'WITCH', 'BODYGUARD'].includes(r)
        ).length
        const remainingVillagers = villagerCount - specialVillagers

        for (let i = 0; i < remainingVillagers; i++) {
            roles.push('VILLAGER')
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
 * Phân vai trò từ custom role setup của quản trò
 * 
 * @param {Object} roleSetup - Object chứa số lượng từng role: { 'VILLAGER': 5, 'SEER': 1, ... }
 * @param {number} playerCount - Số lượng người chơi
 * @param {Array<string>} availableRoles - Optional: Chỉ dùng các role này (từ room settings)
 * @returns {Array<string>} - Mảng role IDs
 */
export function assignRolesFromSetup(roleSetup, playerCount, availableRoles = null) {
    const roles = []

    // Validate tổng số vai trò
    const totalRoles = Object.values(roleSetup).reduce((sum, count) => sum + count, 0)
    if (totalRoles !== playerCount) {
        throw new Error(`Tổng số vai trò (${totalRoles}) không khớp với số người chơi (${playerCount})`)
    }

    // Tạo mảng roles từ setup
    for (const [roleId, count] of Object.entries(roleSetup)) {
        // Validate role ID tồn tại
        if (!ROLES[roleId]) {
            throw new Error(`Vai trò không hợp lệ: ${roleId}`)
        }

        // Nếu có availableRoles, chỉ dùng các role đã chọn khi tạo phòng
        if (availableRoles && !availableRoles.includes(roleId)) {
            throw new Error(`Vai trò ${roleId} không có trong danh sách role của phòng`)
        }

        // Thêm role vào mảng
        for (let i = 0; i < count; i++) {
            roles.push(roleId)
        }
    }

    // Shuffle để random
    const shuffledRoles = shuffleArray(roles)

    // Validate cân bằng
    const validation = validateRoleAssignment(shuffledRoles, playerCount)
    if (!validation.valid) {
        throw new Error(validation.error)
    }

    return shuffledRoles
}

/**
 * Phân vai trò từ availableRoles của phòng (auto mode)
 * 
 * @param {number} playerCount - Số lượng người chơi thực tế
 * @param {Array<string>} availableRoles - Các role đã chọn khi tạo phòng
 * @returns {Array<string>} - Mảng role IDs
 */
export function assignRolesFromAvailable(playerCount, availableRoles) {
    if (!availableRoles || availableRoles.length === 0) {
        throw new Error('Phải có ít nhất 1 role trong danh sách')
    }

    const roles = []

    // Validate số người chơi
    if (playerCount < 3) {
        throw new Error('Cần ít nhất 3 người chơi')
    }

    if (playerCount > 75) {
        throw new Error('Tối đa 75 người chơi')
    }

    // Phân loại roles
    const werewolfRoles = availableRoles.filter(r => {
        const role = ROLES[r]
        return role && role.faction === 'WEREWOLF'
    })
    const villagerRoles = availableRoles.filter(r => {
        const role = ROLES[r]
        return role && role.faction === 'VILLAGER'
    })

    if (werewolfRoles.length === 0) {
        throw new Error('Phải có ít nhất 1 role phe Ma Sói')
    }

    if (villagerRoles.length === 0) {
        throw new Error('Phải có ít nhất 1 role phe Dân Làng')
    }

    // Tính số lượng Sói (20-30%)
    let finalWerewolfCount
    if (playerCount === 3) {
        finalWerewolfCount = 1
    } else if (playerCount <= 5) {
        finalWerewolfCount = 1
    } else if (playerCount === 6) {
        finalWerewolfCount = 2
    } else if (playerCount <= 8) {
        finalWerewolfCount = 2
    } else if (playerCount === 9) {
        finalWerewolfCount = 3
    } else {
        finalWerewolfCount = Math.max(2, Math.round(playerCount * 0.25))
    }

    // Thêm Sói từ availableRoles
    if (werewolfRoles.includes('ALPHA_WOLF')) {
        roles.push('ALPHA_WOLF')
        finalWerewolfCount--
    }

    for (let i = 0; i < finalWerewolfCount; i++) {
        if (werewolfRoles.includes('YOUNG_WOLF')) {
            roles.push('YOUNG_WOLF')
        } else if (werewolfRoles.length > 0) {
            // Dùng role Sói đầu tiên có sẵn
            roles.push(werewolfRoles[0])
        }
    }

    // Thêm Dân làng từ availableRoles
    const villagerCount = playerCount - roles.length

    // Ưu tiên: SEER, WITCH, BODYGUARD
    if (villagerRoles.includes('SEER') && villagerCount > 0) {
        roles.push('SEER')
    }
    if (villagerRoles.includes('WITCH') && roles.length < playerCount) {
        roles.push('WITCH')
    }
    if (villagerRoles.includes('BODYGUARD') && roles.length < playerCount && villagerCount >= 3) {
        roles.push('BODYGUARD')
    }

    // Fill còn lại với VILLAGER hoặc role dân làng khác
    while (roles.length < playerCount) {
        if (villagerRoles.includes('VILLAGER')) {
            roles.push('VILLAGER')
        } else if (villagerRoles.length > 0) {
            // Dùng role dân làng đầu tiên có sẵn
            roles.push(villagerRoles[0])
        } else {
            throw new Error('Không đủ role để phân cho tất cả người chơi')
        }
    }

    // Shuffle
    return shuffleArray(roles)
}

/**
 * Tính toán gợi ý tỉ lệ vai trò theo số người chơi
 * 
 * @param {number} playerCount - Số lượng người chơi
 * @returns {Object} - Object chứa gợi ý số lượng từng role
 */
export function suggestRoleSetup(playerCount) {
    const setup = {}

    // Tính số lượng Sói (20-30% số người)
    const werewolfCount = Math.max(1, Math.round(playerCount * 0.25))
    setup['ALPHA_WOLF'] = 1
    if (werewolfCount > 1) {
        setup['YOUNG_WOLF'] = werewolfCount - 1
    }

    // Luôn có SEER và WITCH
    setup['SEER'] = 1
    setup['WITCH'] = 1

    // Thêm BODYGUARD nếu có >= 6 người
    if (playerCount >= 6) {
        setup['BODYGUARD'] = 1
    }

    // Fill còn lại với VILLAGER
    const usedSlots = Object.values(setup).reduce((sum, count) => sum + count, 0)
    const remainingVillagers = playerCount - usedSlots
    if (remainingVillagers > 0) {
        setup['VILLAGER'] = remainingVillagers
    }

    return setup
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