/**
 * 16 Vai trò từ UI
 */

export const FACTION = {
    VILLAGER: 'VILLAGER',
    WEREWOLF: 'WEREWOLF',
    NEUTRAL: 'NEUTRAL'
}

export const ROLES = {
    // PHE DÂN LÀNG
    VILLAGER: {
        id: 'VILLAGER',
        name: 'Dân Làng',
        faction: 'VILLAGER'
    },
    BODYGUARD: {
        id: 'BODYGUARD',
        name: 'Bảo Vệ',
        faction: 'VILLAGER'
    },
    WATCHMAN: {
        id: 'WATCHMAN',
        name: 'Người Canh Gác',
        faction: 'VILLAGER'
    },
    SEER: {
        id: 'SEER',
        name: 'Thầy Bói',
        faction: 'VILLAGER'
    },
    DETECTIVE: {
        id: 'DETECTIVE',
        name: 'Thám Tử',
        faction: 'VILLAGER'
    },
    MEDIUM: {
        id: 'MEDIUM',
        name: 'Thầy Đồng',
        faction: 'VILLAGER'
    },
    SOUL_BINDER: {
        id: 'SOUL_BINDER',
        name: 'Kẻ Gắn Hồn',
        faction: 'VILLAGER'
    },
    MAYOR: {
        id: 'MAYOR',
        name: 'Thị Trưởng',
        faction: 'VILLAGER'
    },
    WITCH: {
        id: 'WITCH',
        name: 'Phù Thủy',
        faction: 'VILLAGER'
    },
    MONSTER_HUNTER: {
        id: 'MONSTER_HUNTER',
        name: 'Thợ Săn Quái Thú',
        faction: 'VILLAGER'
    },

    // PHE MA SÓI
    TRAITOR: {
        id: 'TRAITOR',
        name: 'Bán Sói',
        faction: 'WEREWOLF'
    },
    YOUNG_WOLF: {
        id: 'YOUNG_WOLF',
        name: 'Sói Trẻ',
        faction: 'WEREWOLF'
    },
    DARK_WOLF: {
        id: 'DARK_WOLF',
        name: 'Sói Hắc Ám',
        faction: 'WEREWOLF'
    },
    ALPHA_WOLF: {
        id: 'ALPHA_WOLF',
        name: 'Sói Đầu Đàn',
        faction: 'WEREWOLF'
    },
    PROPHET_WOLF: {
        id: 'PROPHET_WOLF',
        name: 'Sói Tiên Tri',
        faction: 'WEREWOLF'
    },

    // PHE ĐỘC LẬP
    FOOL: {
        id: 'FOOL',
        name: 'Thằng Ngố',
        faction: 'NEUTRAL'
    },
    SERIAL_KILLER: {
        id: 'SERIAL_KILLER',
        name: 'Sát Nhân Hàng Loạt',
        faction: 'NEUTRAL'
    }
}

/**
 * Map role ID to faction for chat
 */
export function getFactionFromRole(roleId) {
    const role = ROLES[roleId]
    if (!role) return 'VILLAGER'

    // Traitor works for werewolves
    if (roleId === 'TRAITOR') return 'WEREWOLF'

    return role.faction
}

/**
 * Get role by ID
 */
export function getRole(roleId) {
    return ROLES[roleId] || null
}