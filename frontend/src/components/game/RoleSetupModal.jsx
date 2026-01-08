/**
 * Role Setup Modal - Ritual Configuration
 * 
 * Dark medieval fantasy styled role setup for game master.
 * Feels like preparing the souls for the hunt.
 */

import { useState, useEffect } from 'react'
import { ROLES, FACTION } from '@/constants/roles'
import { MedievalButton } from '@/components/ui'
import { RuneClose, RuneWarning, CornerAccent } from '@/components/ui/AncientIcons'

export default function RoleSetupModal({
  isOpen,
  onClose,
  playerCount,
  onConfirm,
  initialSetup = null,
  availableRoles = null
}) {
  const [roleSetup, setRoleSetup] = useState({})
  const [suggestedSetup, setSuggestedSetup] = useState({})
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    if (playerCount && isOpen) {
      const suggested = calculateSuggestedSetup(playerCount, availableRoles)
      setSuggestedSetup(suggested)
      setRoleSetup(initialSetup || suggested)
      validateSetup(initialSetup || suggested)
    }
  }, [playerCount, isOpen, initialSetup, availableRoles])

  const calculateSuggestedSetup = (count, availableRolesList = availableRoles) => {
    const setup = {}

    const allVillagerRoles = Object.values(ROLES).filter(r => r.faction === FACTION.VILLAGER)
    const allWerewolfRoles = Object.values(ROLES).filter(r => r.faction === FACTION.WEREWOLF)

    const villagerRoles = availableRoles
      ? allVillagerRoles.filter(r => availableRoles.includes(r.id))
      : allVillagerRoles

    const werewolfRoles = availableRoles
      ? allWerewolfRoles.filter(r => availableRoles.includes(r.id))
      : allWerewolfRoles

    const werewolfCount = Math.max(1, Math.round(count * 0.25))
    
    if (werewolfRoles.length > 0) {
      const alphaWolf = werewolfRoles.find(r => r.id === 'ALPHA_WOLF')
      const youngWolf = werewolfRoles.find(r => r.id === 'YOUNG_WOLF')
      
      if (alphaWolf) {
        setup['ALPHA_WOLF'] = 1
        if (werewolfCount > 1 && youngWolf) {
          setup['YOUNG_WOLF'] = werewolfCount - 1
        } else if (werewolfCount > 1) {
          const otherWolf = werewolfRoles.find(r => r.id !== 'ALPHA_WOLF') || werewolfRoles[0]
          setup[otherWolf.id] = werewolfCount - 1
        }
      } else {
        setup[werewolfRoles[0].id] = werewolfCount
      }
    }

    const seer = villagerRoles.find(r => r.id === 'SEER')
    const witch = villagerRoles.find(r => r.id === 'WITCH')
    const bodyguard = villagerRoles.find(r => r.id === 'BODYGUARD')

    if (seer) setup['SEER'] = 1
    if (witch) setup['WITCH'] = 1
    if (bodyguard && count >= 6) setup['BODYGUARD'] = 1

    const usedSlots = Object.values(setup).reduce((sum, c) => sum + c, 0)
    const remaining = count - usedSlots
    if (remaining > 0) {
      const villager = villagerRoles.find(r => r.id === 'VILLAGER')
      if (villager) {
        setup['VILLAGER'] = remaining
      } else if (villagerRoles.length > 0) {
        const fallbackRole = villagerRoles.find(r => !setup[r.id]) || villagerRoles[0]
        setup[fallbackRole.id] = (setup[fallbackRole.id] || 0) + remaining
      }
    }

    return setup
  }

  const validateSetup = (setup) => {
    const warnings = []
    const total = Object.values(setup).reduce((sum, count) => sum + count, 0)

    if (total !== playerCount) {
      warnings.push(`Tổng vai trò (${total}) không khớp với số người chơi (${playerCount})`)
    }

    const werewolfCount = (setup['YOUNG_WOLF'] || 0) + (setup['ALPHA_WOLF'] || 0)
    const werewolfPercent = (werewolfCount / playerCount) * 100

    if (werewolfPercent < 20) {
      warnings.push(`Phe Sói quá yếu (${werewolfPercent.toFixed(1)}%)`)
    } else if (werewolfPercent > 30) {
      warnings.push(`Phe Sói quá mạnh (${werewolfPercent.toFixed(1)}%)`)
    }

    if (werewolfCount === 0) {
      warnings.push('Phải có ít nhất 1 Sói')
    }

    const villagerCount = total - werewolfCount
    if (villagerCount === 0) {
      warnings.push('Phải có ít nhất 1 Dân làng')
    }

    setWarnings(warnings)
    return warnings.length === 0 || !warnings.some(w => w.includes('Phải có') || w.includes('không khớp'))
  }

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

  const applySuggested = () => {
    setRoleSetup(suggestedSetup)
    validateSetup(suggestedSetup)
  }

  const handleConfirm = () => {
    if (validateSetup(roleSetup)) {
      onConfirm(roleSetup)
    }
  }

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.9)' }}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(20,16,12,0.98) 0%, rgba(15,12,10,0.99) 100%)',
          border: '2px solid rgba(139,115,85,0.4)',
          boxShadow: '0 0 40px rgba(139,115,85,0.15), 0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-2 left-2 text-[#8b7355] opacity-40">
          <CornerAccent className="w-6 h-6" position="top-left" />
        </div>
        <div className="absolute top-2 right-2 text-[#8b7355] opacity-40">
          <CornerAccent className="w-6 h-6" position="top-right" />
        </div>

        {/* Header */}
        <div 
          className="p-6 flex justify-between items-center"
          style={{ borderBottom: '1px solid rgba(139,115,85,0.2)' }}
        >
          <div>
            <h2 
              className="font-medieval text-2xl tracking-wider"
              style={{ color: '#8b7355' }}
            >
              Thiết Lập Vai Trò
            </h2>
            <p className="font-fantasy text-sm mt-1" style={{ color: '#6a5a4a' }}>
              Số người chơi: <span style={{ color: '#a89070' }}>{playerCount}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6a5a4a] hover:text-[#8b7355] transition-colors"
          >
            <RuneClose className="w-6 h-6" />
          </button>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div 
            className="mx-6 mt-4 p-4"
            style={{
              background: 'rgba(139,0,0,0.1)',
              border: '1px solid rgba(139,0,0,0.3)',
            }}
          >
            {warnings.map((warning, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1 last:mb-0">
                <RuneWarning className="w-4 h-4 flex-shrink-0" style={{ color: '#8b4040' }} />
                <p className="font-fantasy text-sm" style={{ color: '#a05050' }}>{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Total count */}
        <div 
          className="mx-6 mt-4 p-4 flex justify-between items-center"
          style={{
            background: 'rgba(15,12,10,0.6)',
            border: '1px solid rgba(60,50,40,0.4)',
          }}
        >
          <span className="font-medieval" style={{ color: '#8b7355' }}>Tổng vai trò:</span>
          <span 
            className="font-medieval text-2xl"
            style={{ color: totalRoles === playerCount ? '#4a8a5a' : '#8b4040' }}
          >
            {totalRoles} / {playerCount}
          </span>
        </div>

        {/* Role Setup */}
        <div className="p-6 space-y-6">
          {/* Villager Roles */}
          <RoleSection
            title="Phe Dân Làng"
            color="#4a8a5a"
            roles={villagerRoles}
            roleSetup={roleSetup}
            onUpdate={updateRoleCount}
            onSet={setRoleCount}
          />

          {/* Werewolf Roles */}
          <RoleSection
            title="Phe Ma Sói"
            color="#8b4040"
            roles={werewolfRoles}
            roleSetup={roleSetup}
            onUpdate={updateRoleCount}
            onSet={setRoleCount}
          />

          {/* Neutral Roles */}
          {neutralRoles.length > 0 && (
            <RoleSection
              title="Phe Độc Lập"
              color="#8b7355"
              roles={neutralRoles}
              roleSetup={roleSetup}
              onUpdate={updateRoleCount}
              onSet={setRoleCount}
            />
          )}
        </div>

        {/* Actions */}
        <div 
          className="p-6 flex justify-between gap-4"
          style={{ borderTop: '1px solid rgba(139,115,85,0.2)' }}
        >
          <MedievalButton onClick={applySuggested} variant="secondary">
            Áp Dụng Gợi Ý
          </MedievalButton>
          <div className="flex gap-4">
            <MedievalButton onClick={onClose} variant="secondary">
              Hủy
            </MedievalButton>
            <MedievalButton
              onClick={handleConfirm}
              disabled={totalRoles !== playerCount || warnings.some(w => w.includes('Phải có'))}
            >
              Xác Nhận
            </MedievalButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleSection({ title, color, roles, roleSetup, onUpdate, onSet }) {
  return (
    <div>
      <h3 
        className="font-medieval text-lg mb-4"
        style={{ color }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map(role => (
          <div 
            key={role.id}
            className="flex items-center justify-between p-3"
            style={{
              background: 'rgba(15,12,10,0.6)',
              border: '1px solid rgba(60,50,40,0.4)',
            }}
          >
            <div className="flex-1">
              <p className="font-medieval" style={{ color: '#a89070' }}>{role.name}</p>
              <p className="font-fantasy text-xs" style={{ color: '#5a4a3a' }}>{role.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate(role.id, -1)}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(139,0,0,0.2)',
                  border: '1px solid rgba(139,0,0,0.4)',
                  color: '#8b4040',
                }}
              >
                -
              </button>
              <input
                type="number"
                min="0"
                value={roleSetup[role.id] || 0}
                onChange={(e) => onSet(role.id, e.target.value)}
                className="w-14 text-center font-medieval bg-transparent"
                style={{
                  border: '1px solid rgba(60,50,40,0.4)',
                  color: '#a89070',
                }}
              />
              <button
                onClick={() => onUpdate(role.id, 1)}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(34,120,60,0.2)',
                  border: '1px solid rgba(34,120,60,0.4)',
                  color: '#4a8a5a',
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
