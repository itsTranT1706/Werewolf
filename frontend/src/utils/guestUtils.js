/**
 * Guest Player Utilities
 * Hỗ trợ tạo username và userId cho người chơi không đăng nhập
 */

/**
 * Generate random Vietnamese username for guest player
 * @returns {string} Random username
 */
export function generateGuestUsername() {
    const adjectives = [
        'Bí_Ẩn', 'Đêm_Tối', 'Bóng_Tối', 'Lặng_Lẽ', 'Cô_Đơn',
        'Dũng_Cảm', 'Thông_Minh', 'Nhanh_Nhẹn', 'Kiên_Cường', 'Mạnh_Mẽ',
        'Khôn_Ngoan', 'Tinh_Anh', 'Linh_Hoạt', 'Quyết_Đoán', 'Bền_Bỉ',
        'Tinh_Tế', 'Sắc_Bén', 'Nhanh_Trí', 'Linh_Lợi', 'Nhạy_Bén'
    ]

    const nouns = [
        'Sói', 'Dân_Làng', 'Thợ_Săn', 'Phù_Thủy', 'Thầy_Bói',
        'Bảo_Vệ', 'Thợ_Rèn', 'Thương_Gia', 'Nông_Dân', 'Thợ_Mộc',
        'Lữ_Khách', 'Hiệp_Sĩ', 'Pháp_Sư', 'Đạo_Tặc', 'Cung_Thủ',
        'Chiến_Binh', 'Tu_Sĩ', 'Học_Giả', 'Nghệ_Sĩ', 'Thợ_Lặn'
    ]

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomNumber = Math.floor(Math.random() * 999) + 1

    return `${randomAdjective}_${randomNoun}_${randomNumber}`
}

/**
 * Generate guest userId
 * @returns {string} Guest userId
 */
export function generateGuestUserId() {
    return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get or create guest userId from localStorage
 * @returns {string} Guest userId
 */
export function getOrCreateGuestUserId() {
    const key = 'guest_user_id'
    let guestId = localStorage.getItem(key)

    if (!guestId) {
        guestId = generateGuestUserId()
        localStorage.setItem(key, guestId)
    }

    return guestId
}

/**
 * Get or create guest username from localStorage
 * @returns {string} Guest username
 */
export function getOrCreateGuestUsername() {
    const key = 'guest_username'
    let username = localStorage.getItem(key)

    if (!username) {
        username = generateGuestUsername()
        localStorage.setItem(key, username)
    }

    return username
}







