/**
 * Game Phase State Machine
 * Dark Medieval Fantasy - Werewolf Game Master Interface
 * 
 * This defines the complete state machine for game flow,
 * ensuring the moderator follows the sacred ritual order.
 */

// ═══════════════════════════════════════════════════════════════
// GAME PHASE ENUM - The Sacred Cycle
// ═══════════════════════════════════════════════════════════════

export const GAME_PHASE = {
  // Pre-game states
  LOBBY: 'LOBBY',
  ROLE_ASSIGNMENT: 'ROLE_ASSIGNMENT',
  
  // Night Phase - The Dark Hours
  NIGHT_START: 'NIGHT_START',
  NIGHT_CUPID: 'NIGHT_CUPID',           // Night 1 only - Cupid binds lovers
  NIGHT_BODYGUARD: 'NIGHT_BODYGUARD',   // Bodyguard chooses protection
  NIGHT_WEREWOLF: 'NIGHT_WEREWOLF',     // Werewolves choose victim
  NIGHT_SEER: 'NIGHT_SEER',             // Seer investigates
  NIGHT_WITCH: 'NIGHT_WITCH',           // Witch decides save/poison
  NIGHT_END: 'NIGHT_END',               // Calculate night results
  
  // Day Phase - The Reckoning
  DAY_DAWN: 'DAY_DAWN',                 // Announce deaths, narrative
  DAY_DISCUSSION: 'DAY_DISCUSSION',     // Players discuss
  DAY_VOTE: 'DAY_VOTE',                 // Voting phase
  DAY_EXECUTION: 'DAY_EXECUTION',       // Execute voted player
  DAY_HUNTER: 'DAY_HUNTER',             // Hunter's revenge (if applicable)
  DAY_END: 'DAY_END',                   // Check win condition
  
  // End states
  GAME_OVER: 'GAME_OVER'
}

// ═══════════════════════════════════════════════════════════════
// PHASE METADATA - Ritual Descriptions
// ═══════════════════════════════════════════════════════════════

export const PHASE_META = {
  [GAME_PHASE.LOBBY]: {
    name: 'Phòng Chờ',
    description: 'Các linh hồn đang tụ họp...',
    icon: 'door',
    category: 'setup'
  },
  [GAME_PHASE.ROLE_ASSIGNMENT]: {
    name: 'Phân Định Số Mệnh',
    description: 'Các vai trò được định đoạt bởi số phận',
    icon: 'scroll',
    category: 'setup'
  },
  [GAME_PHASE.NIGHT_START]: {
    name: 'Màn Đêm Buông Xuống',
    description: 'Bóng tối bao trùm ngôi làng...',
    icon: 'moon',
    category: 'night'
  },
  [GAME_PHASE.NIGHT_CUPID]: {
    name: 'Thần Tình Yêu Thức Giấc',
    description: 'Cupid chọn hai linh hồn để ràng buộc',
    icon: 'heart',
    category: 'night',
    roleRequired: 'CUPID'
  },
  [GAME_PHASE.NIGHT_BODYGUARD]: {
    name: 'Người Bảo Vệ Canh Gác',
    description: 'Bảo vệ chọn người để che chở',
    icon: 'shield',
    category: 'night',
    roleRequired: 'BODYGUARD'
  },
  [GAME_PHASE.NIGHT_WEREWOLF]: {
    name: 'Bầy Sói Săn Mồi',
    description: 'Ma sói thức dậy và chọn con mồi...',
    icon: 'wolf',
    category: 'night',
    roleRequired: ['ALPHA_WOLF', 'YOUNG_WOLF', 'DARK_WOLF', 'PROPHET_WOLF']
  },
  [GAME_PHASE.NIGHT_SEER]: {
    name: 'Thầy Bói Nhìn Thấu',
    description: 'Thầy bói mở mắt và chọn người để soi',
    icon: 'eye',
    category: 'night',
    roleRequired: 'SEER'
  },
  [GAME_PHASE.NIGHT_WITCH]: {
    name: 'Phù Thủy Hành Động',
    description: 'Phù thủy quyết định cứu hay giết',
    icon: 'potion',
    category: 'night',
    roleRequired: 'WITCH'
  },
  [GAME_PHASE.NIGHT_END]: {
    name: 'Đêm Kết Thúc',
    description: 'Tính toán kết quả của đêm tối...',
    icon: 'calculate',
    category: 'night'
  },
  [GAME_PHASE.DAY_DAWN]: {
    name: 'Bình Minh Ló Dạng',
    description: 'Mặt trời mọc, sự thật được phơi bày',
    icon: 'sun',
    category: 'day'
  },
  [GAME_PHASE.DAY_DISCUSSION]: {
    name: 'Thời Khắc Luận Tội',
    description: 'Dân làng thảo luận và tìm kẻ đáng ngờ',
    icon: 'chat',
    category: 'day'
  },
  [GAME_PHASE.DAY_VOTE]: {
    name: 'Bỏ Phiếu Trừng Phạt',
    description: 'Dân làng bỏ phiếu treo cổ',
    icon: 'vote',
    category: 'day'
  },
  [GAME_PHASE.DAY_EXECUTION]: {
    name: 'Hành Quyết',
    description: 'Kẻ bị kết tội phải đền mạng',
    icon: 'gallows',
    category: 'day'
  },
  [GAME_PHASE.DAY_HUNTER]: {
    name: 'Thợ Săn Báo Thù',
    description: 'Thợ săn bắn mũi tên cuối cùng',
    icon: 'arrow',
    category: 'day',
    roleRequired: 'MONSTER_HUNTER'
  },
  [GAME_PHASE.DAY_END]: {
    name: 'Ngày Kết Thúc',
    description: 'Kiểm tra điều kiện chiến thắng',
    icon: 'hourglass',
    category: 'day'
  },
  [GAME_PHASE.GAME_OVER]: {
    name: 'Kết Thúc',
    description: 'Trận chiến đã ngã ngũ',
    icon: 'crown',
    category: 'end'
  }
}

// ═══════════════════════════════════════════════════════════════
// STATE MACHINE TRANSITIONS
// ═══════════════════════════════════════════════════════════════

export const PHASE_TRANSITIONS = {
  [GAME_PHASE.LOBBY]: [GAME_PHASE.ROLE_ASSIGNMENT],
  [GAME_PHASE.ROLE_ASSIGNMENT]: [GAME_PHASE.NIGHT_START],
  
  // Night flow
  [GAME_PHASE.NIGHT_START]: [GAME_PHASE.NIGHT_CUPID, GAME_PHASE.NIGHT_BODYGUARD],
  [GAME_PHASE.NIGHT_CUPID]: [GAME_PHASE.NIGHT_BODYGUARD],
  [GAME_PHASE.NIGHT_BODYGUARD]: [GAME_PHASE.NIGHT_WEREWOLF],
  [GAME_PHASE.NIGHT_WEREWOLF]: [GAME_PHASE.NIGHT_SEER],
  [GAME_PHASE.NIGHT_SEER]: [GAME_PHASE.NIGHT_WITCH],
  [GAME_PHASE.NIGHT_WITCH]: [GAME_PHASE.NIGHT_END],
  [GAME_PHASE.NIGHT_END]: [GAME_PHASE.DAY_DAWN],
  
  // Day flow
  [GAME_PHASE.DAY_DAWN]: [GAME_PHASE.DAY_DISCUSSION],
  [GAME_PHASE.DAY_DISCUSSION]: [GAME_PHASE.DAY_VOTE],
  [GAME_PHASE.DAY_VOTE]: [GAME_PHASE.DAY_EXECUTION, GAME_PHASE.DAY_END], // No execution if tie
  [GAME_PHASE.DAY_EXECUTION]: [GAME_PHASE.DAY_HUNTER, GAME_PHASE.DAY_END],
  [GAME_PHASE.DAY_HUNTER]: [GAME_PHASE.DAY_END],
  [GAME_PHASE.DAY_END]: [GAME_PHASE.NIGHT_START, GAME_PHASE.GAME_OVER],
  
  [GAME_PHASE.GAME_OVER]: []
}

// ═══════════════════════════════════════════════════════════════
// NIGHT PHASE ORDER - The Sacred Sequence
// ═══════════════════════════════════════════════════════════════

export const NIGHT_PHASE_ORDER = [
  GAME_PHASE.NIGHT_START,
  GAME_PHASE.NIGHT_CUPID,      // Night 1 only
  GAME_PHASE.NIGHT_BODYGUARD,
  GAME_PHASE.NIGHT_WEREWOLF,
  GAME_PHASE.NIGHT_SEER,
  GAME_PHASE.NIGHT_WITCH,
  GAME_PHASE.NIGHT_END
]

export const DAY_PHASE_ORDER = [
  GAME_PHASE.DAY_DAWN,
  GAME_PHASE.DAY_DISCUSSION,
  GAME_PHASE.DAY_VOTE,
  GAME_PHASE.DAY_EXECUTION,
  GAME_PHASE.DAY_HUNTER,
  GAME_PHASE.DAY_END
]

// ═══════════════════════════════════════════════════════════════
// PLAYER STATUS FLAGS - Ritual Marks
// ═══════════════════════════════════════════════════════════════

export const PLAYER_STATUS = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD',
  
  // Night effect badges
  PROTECTED: 'PROTECTED',       // Shield by Bodyguard
  ATTACKED: 'ATTACKED',         // Targeted by Werewolves
  POISONED: 'POISONED',         // Witch's poison
  SAVED: 'SAVED',               // Witch's heal
  INVESTIGATED: 'INVESTIGATED', // Checked by Seer
  LOVER: 'LOVER',               // Bound by Cupid
  MARKED: 'MARKED'              // Hunter's target
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a phase transition is valid
 */
export function canTransitionTo(currentPhase, targetPhase) {
  const validTransitions = PHASE_TRANSITIONS[currentPhase] || []
  return validTransitions.includes(targetPhase)
}

/**
 * Get next valid phases from current
 */
export function getNextPhases(currentPhase) {
  return PHASE_TRANSITIONS[currentPhase] || []
}

/**
 * Check if phase is a night phase
 */
export function isNightPhase(phase) {
  return PHASE_META[phase]?.category === 'night'
}

/**
 * Check if phase is a day phase
 */
export function isDayPhase(phase) {
  return PHASE_META[phase]?.category === 'day'
}

/**
 * Get phases that require specific roles
 */
export function getRequiredRole(phase) {
  return PHASE_META[phase]?.roleRequired || null
}

/**
 * Filter night phases based on available roles
 */
export function getActiveNightPhases(availableRoles, isFirstNight = false) {
  return NIGHT_PHASE_ORDER.filter(phase => {
    // Always include start and end
    if (phase === GAME_PHASE.NIGHT_START || phase === GAME_PHASE.NIGHT_END) {
      return true
    }
    
    // Cupid only on first night
    if (phase === GAME_PHASE.NIGHT_CUPID && !isFirstNight) {
      return false
    }
    
    const required = getRequiredRole(phase)
    if (!required) return true
    
    if (Array.isArray(required)) {
      return required.some(role => availableRoles.includes(role))
    }
    
    return availableRoles.includes(required)
  })
}

/**
 * Generate narrative script for dawn announcement
 */
export function generateDawnNarrative(nightResult) {
  const { deaths, saved, protected: protectedPlayers } = nightResult
  
  if (deaths.length === 0) {
    return {
      title: 'Một Đêm Bình Yên',
      script: 'Mặt trời mọc lên, soi sáng ngôi làng. Thật kỳ diệu, đêm qua không ai bị hại. Có lẽ các thế lực bóng tối đã bị ngăn chặn...',
      deaths: []
    }
  }
  
  const deathDescriptions = deaths.map(d => {
    const causeText = {
      'WEREWOLF_KILL': 'bị xé xác bởi móng vuốt quái thú',
      'POISONED': 'chết trong giấc ngủ vì chất độc bí ẩn',
      'LOVER_DEATH': 'chết vì trái tim tan vỡ khi mất đi người yêu',
      'HUNTER_SHOT': 'bị bắn bởi mũi tên của thợ săn'
    }
    return `${d.username} đã ${causeText[d.cause] || 'ra đi trong đêm tối'}`
  })
  
  return {
    title: deaths.length === 1 ? 'Bi Kịch Đêm Qua' : 'Thảm Kịch Đêm Qua',
    script: `Khi bình minh ló dạng, dân làng phát hiện ra sự thật kinh hoàng. ${deathDescriptions.join('. ')}. Linh hồn họ đã rời bỏ thế gian này...`,
    deaths
  }
}
