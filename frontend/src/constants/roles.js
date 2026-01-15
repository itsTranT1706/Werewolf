/**
 * Game Roles Information
 * Thông tin chi tiết về các vai trò trong game
 */

export const FACTION = {
    VILLAGER: 'VILLAGER',
    WEREWOLF: 'WEREWOLF',
    NEUTRAL: 'NEUTRAL'
}

export const FACTION_NAMES = {
    VILLAGER: 'Dân Làng',
    WEREWOLF: 'Ma Sói',
    NEUTRAL: 'Độc Lập'
}

/**
 * Role Image Mapping
 * Maps role ID to image path in /assets/role-images/
 */
export const ROLE_IMAGES = {
    VILLAGER: '/assets/role-images/danthuong.png',
    BODYGUARD: '/assets/role-images/baove.png',
    CUPID: '/assets/role-images/cupid.png',
    WATCHMAN: '/assets/role-images/nguoicanhgac.png',
    SEER: '/assets/role-images/thayboi.png',
    DETECTIVE: '/assets/role-images/thamtu.png',
    MEDIUM: '/assets/role-images/thaydong.png',
    SOUL_BINDER: '/assets/role-images/keganhon.png',
    MAYOR: '/assets/role-images/thitruong.png',
    WITCH: '/assets/role-images/phuthuy.png',
    MONSTER_HUNTER: '/assets/role-images/thosan.png',
    TRAITOR: '/assets/role-images/bansoi.png',
    YOUNG_WOLF: '/assets/role-images/soitre.png',
    DARK_WOLF: '/assets/role-images/soihacam.png',
    ALPHA_WOLF: '/assets/role-images/soidaudan.png',
    PROPHET_WOLF: '/assets/role-images/soitientri.png',
    FOOL: '/assets/role-images/thangngo.png',
    SERIAL_KILLER: '/assets/role-images/satnhan.png',
    MODERATOR: null // Moderator không dùng card reveal
}

/**
 * Get role image path by role ID
 * @param {string} roleId - Role ID
 * @returns {string|null} Image path or null if not found
 */
export function getRoleImage(roleId) {
    return ROLE_IMAGES[roleId] || null
}

/**
 * Role Icons (emoji fallback)
 */
export const ROLE_ICONS = {
    BODYGUARD: '🛡️',
    CUPID: '💘',
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
    VILLAGER: '👤',
    MODERATOR: '📋'
}

/**
 * Get role icon by role ID
 * @param {string} roleId - Role ID
 * @returns {string} Emoji icon
 */
export function getRoleIcon(roleId) {
    return ROLE_ICONS[roleId] || '❓'
}

export const ROLES = {
    // PHE DÂN LÀNG
    VILLAGER: {
        id: 'VILLAGER',
        name: 'Dân Làng',
        faction: 'VILLAGER',
        description: 'Bạn là một dân làng bình thường, không có khả năng đặc biệt. Nhiệm vụ của bạn là tìm ra và treo cổ tất cả Ma Sói bằng cách phân tích hành vi và lời nói của các người chơi khác trong các cuộc thảo luận ban ngày.',
        aura: 'Thiện',
        isClassic: true
    },
    BODYGUARD: {
        id: 'BODYGUARD',
        name: 'Bảo Vệ',
        faction: 'VILLAGER',
        description: 'Bạn có thể chọn một người chơi để bảo vệ mỗi đêm. Người được bảo vệ không thể bị giết vào đêm đó, thay vào đó bạn sẽ bị tấn công thay họ. Vì bạn rất khỏe nên sẽ không thể bị chết trong lần tấn công đầu tiên nhưng sẽ chết trong lần tấn công thứ hai. Mỗi đêm bạn sẽ tự bảo vệ chính mình.',
        aura: 'Thiện',
        isClassic: true
    },
    CUPID: {
        id: 'CUPID',
        name: 'Thần Tình Yêu',
        faction: 'VILLAGER',
        description: 'Vào đêm đầu tiên, bạn chọn hai người chơi để trở thành cặp đôi. Họ sẽ biết nhau và thắng cùng nhau. Nếu một người chết, người kia sẽ tự sát theo. Bạn không biết ai là cặp đôi sau khi chọn.',
        aura: 'Thiện',
        isClassic: true
    },
    WATCHMAN: {
        id: 'WATCHMAN',
        name: 'Người Canh Gác',
        faction: 'VILLAGER',
        description: 'Bạn có thể chọn một người chơi để canh gác mỗi đêm. Nếu người đó bị tấn công, bạn sẽ biết và có thể cảnh báo cho mọi người vào ngày hôm sau.',
        aura: 'Thiện'
    },
    SEER: {
        id: 'SEER',
        name: 'Thầy Bói',
        faction: 'VILLAGER',
        description: 'Mỗi đêm, bạn có thể chọn một người chơi để xem vai trò của họ. Bạn sẽ biết họ thuộc phe nào (Dân Làng, Ma Sói, hoặc Độc Lập).',
        aura: 'Thiện',
        isClassic: true
    },
    DETECTIVE: {
        id: 'DETECTIVE',
        name: 'Thám Tử',
        faction: 'VILLAGER',
        description: 'Bạn có thể điều tra một người chơi mỗi đêm để xem họ có phải là Ma Sói hay không. Kết quả sẽ được báo cho bạn vào sáng hôm sau.',
        aura: 'Thiện'
    },
    MEDIUM: {
        id: 'MEDIUM',
        name: 'Thầy Đồng',
        faction: 'VILLAGER',
        description: 'Bạn có thể giao tiếp với những người chơi đã chết. Mỗi đêm, bạn có thể hỏi một người đã chết về thông tin họ biết khi còn sống.',
        aura: 'Thiện'
    },
    SOUL_BINDER: {
        id: 'SOUL_BINDER',
        name: 'Kẻ Gắn Hồn',
        faction: 'VILLAGER',
        description: 'Bạn có thể gắn hồn của mình với một người chơi khác. Nếu người đó chết, bạn cũng sẽ chết. Nhưng nếu bạn chết, người đó sẽ không bị ảnh hưởng.',
        aura: 'Thiện'
    },
    MAYOR: {
        id: 'MAYOR',
        name: 'Thị Trưởng',
        faction: 'VILLAGER',
        description: 'Bạn là người lãnh đạo của làng. Phiếu bầu của bạn có giá trị gấp đôi. Nếu bạn bị treo cổ, bạn có thể tiết lộ danh tính để sống sót, nhưng sẽ mất quyền lực.',
        aura: 'Thiện'
    },
    WITCH: {
        id: 'WITCH',
        name: 'Phù Thủy',
        faction: 'VILLAGER',
        description: 'Bạn có một lọ thuốc cứu và một lọ thuốc độc. Bạn có thể cứu một người bị tấn công vào đêm đó, hoặc giết một người chơi bằng thuốc độc. Mỗi lọ chỉ dùng được một lần.',
        aura: 'Thiện',
        isClassic: true
    },
    MONSTER_HUNTER: {
        id: 'MONSTER_HUNTER',
        name: 'Thợ Săn Quái Thú',
        faction: 'VILLAGER',
        description: 'Nếu bạn bị giết hoặc bị treo cổ, bạn có thể chọn một người chơi để bắn và giết họ trước khi chết. Bạn chỉ có một viên đạn.',
        aura: 'Thiện'
    },

    // PHE MA SÓI
    TRAITOR: {
        id: 'TRAITOR',
        name: 'Bán Sói',
        faction: 'WEREWOLF',
        description: 'Bạn là dân làng nhưng làm việc cho phe Ma Sói. Bạn không biết ai là Ma Sói, nhưng Ma Sói biết bạn. Bạn thắng cùng phe Ma Sói.',
        aura: 'Ác'
    },
    YOUNG_WOLF: {
        id: 'YOUNG_WOLF',
        name: 'Sói Trẻ',
        faction: 'WEREWOLF',
        description: 'Bạn là Ma Sói cơ bản. Mỗi đêm, bạn cùng các Ma Sói khác bầu chọn một người để giết. Bạn có thể chat riêng với các Ma Sói khác vào ban đêm.',
        aura: 'Ác',
        isClassic: true
    },
    DARK_WOLF: {
        id: 'DARK_WOLF',
        name: 'Sói Hắc Ám',
        faction: 'WEREWOLF',
        description: 'Bạn là Ma Sói mạnh mẽ. Khi bạn tấn công, nạn nhân không thể được cứu bởi Bảo Vệ hoặc Phù Thủy. Bạn có thể chat riêng với các Ma Sói khác vào ban đêm.',
        aura: 'Ác'
    },
    ALPHA_WOLF: {
        id: 'ALPHA_WOLF',
        name: 'Sói Đầu Đàn',
        faction: 'WEREWOLF',
        description: 'Bạn là thủ lĩnh của bầy Sói. Khi Thầy Bói xem bạn, họ sẽ thấy bạn là Dân Làng. Bạn có thể chat riêng với các Ma Sói khác vào ban đêm.',
        aura: 'Ác'
    },
    PROPHET_WOLF: {
        id: 'PROPHET_WOLF',
        name: 'Sói Tiên Tri',
        faction: 'WEREWOLF',
        description: 'Bạn là Ma Sói có khả năng đặc biệt. Mỗi đêm, bạn có thể xem vai trò của một người chơi, giống như Thầy Bói. Bạn có thể chat riêng với các Ma Sói khác vào ban đêm.',
        aura: 'Ác'
    },

    // PHE ĐỘC LẬP
    FOOL: {
        id: 'FOOL',
        name: 'Thằng Ngố',
        faction: 'NEUTRAL',
        description: 'Bạn muốn bị treo cổ nhưng không muốn chết. Nếu bạn bị treo cổ, bạn sẽ thắng ngay lập tức. Nếu phe Ma Sói hoặc Dân Làng thắng trước, bạn sẽ thua.',
        aura: 'Trung Lập'
    },
    SERIAL_KILLER: {
        id: 'SERIAL_KILLER',
        name: 'Sát Nhân Hàng Loạt',
        faction: 'NEUTRAL',
        description: 'Bạn muốn giết tất cả mọi người. Mỗi đêm, bạn có thể giết một người chơi. Bạn thắng khi chỉ còn lại bạn và một người khác còn sống.',
        aura: 'Ác'
    },
    // QUẢN TRÒ (Host)
    MODERATOR: {
        id: 'MODERATOR',
        name: 'Quản Trò',
        faction: 'NEUTRAL',
        description: 'Bạn là quản trò của phòng game. Bạn không tham gia chơi nhưng có thể quan sát và điều phối game.',
        aura: 'Trung Lập'
    }
}

/**
 * Get all roles by faction
 */
export function getRolesByFaction(faction) {
    return Object.values(ROLES).filter(role => role.faction === faction)
}

/**
 * Get role by ID
 */
export function getRole(roleId) {
    return ROLES[roleId] || null
}

