/**
 * Roles Modal - Ancient Tome of Souls
 * 
 * Displays role information in dark medieval fantasy style.
 * Feels like reading from a cursed grimoire.
 */

import { useState } from 'react'
import { ROLES, FACTION, FACTION_NAMES, getRoleIcon } from '@/constants/roles'
import { RuneClose, CornerAccent } from '@/components/ui/AncientIcons'
import { MedievalButton } from '@/components/ui'

export default function RolesModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('classic')
  const [expandedRole, setExpandedRole] = useState(null)

  if (!isOpen) return null

  const getFilteredRoles = () => {
    if (activeTab === 'classic') {
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
        return '#4a8a5a'
      case FACTION.WEREWOLF:
        return '#8b4040'
      case FACTION.NEUTRAL:
        return '#8b7355'
      default:
        return '#6a5a4a'
    }
  }

  const getAuraColor = (aura) => {
    switch (aura) {
      case 'Thiện':
        return '#5a7a9a'
      case 'Ác':
        return '#8b4040'
      case 'Trung Lập':
        return '#6a5a4a'
      default:
        return '#6a5a4a'
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'rgba(5,5,8,0.9)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
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
        <div className="absolute bottom-2 left-2 text-[#8b7355] opacity-40">
          <CornerAccent className="w-6 h-6" position="bottom-left" />
        </div>
        <div className="absolute bottom-2 right-2 text-[#8b7355] opacity-40">
          <CornerAccent className="w-6 h-6" position="bottom-right" />
        </div>

        {/* Header */}
        <div 
          className="p-6"
          style={{
            borderBottom: '1px solid rgba(139,115,85,0.2)',
          }}
        >
          <div className="flex justify-between items-center">
            <h2 
              className="font-medieval text-3xl tracking-wider"
              style={{
                color: '#8b7355',
                textShadow: '0 0 20px rgba(139,115,85,0.3), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              Những Linh Hồn Bị Nguyền
            </h2>
            <button
              onClick={onClose}
              className="text-[#6a5a4a] hover:text-[#8b7355] transition-colors duration-300"
            >
              <RuneClose className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="flex"
          style={{ borderBottom: '1px solid rgba(139,115,85,0.15)' }}
        >
          {[
            { id: 'classic', label: 'Cổ Điển' },
            { id: 'all', label: 'Tất Cả' },
            { id: 'settings', label: 'Thiết Lập' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-6 py-3 font-fantasy text-sm transition-all duration-300"
              style={{
                background: activeTab === tab.id 
                  ? 'rgba(139,115,85,0.15)' 
                  : 'transparent',
                color: activeTab === tab.id ? '#8b7355' : '#6a5a4a',
                borderBottom: activeTab === tab.id 
                  ? '2px solid rgba(139,115,85,0.6)' 
                  : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6">
          {activeTab === 'settings' ? (
            <div className="text-center py-12">
              <p className="font-fantasy" style={{ color: '#6a5a4a' }}>
                Thiết lập sẽ có sớm...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredRoles().map((role) => (
                <div
                  key={role.id}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    background: 'rgba(15,12,10,0.6)',
                    border: '1px solid rgba(60,50,40,0.4)',
                  }}
                >
                  {/* Role Header */}
                  <button
                    onClick={() => toggleRole(role.id)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-all duration-300"
                    style={{
                      background: expandedRole === role.id 
                        ? 'rgba(139,115,85,0.1)' 
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (expandedRole !== role.id) {
                        e.currentTarget.style.background = 'rgba(60,50,40,0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedRole !== role.id) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 flex items-center justify-center"
                        style={{
                          background: 'radial-gradient(circle, rgba(139,115,85,0.2) 0%, transparent 70%)',
                          border: '1px solid rgba(139,115,85,0.3)',
                        }}
                      >
                        <span className="text-xl">
                          {getRoleIcon(role.id)}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 
                          className="font-medieval text-lg tracking-wide"
                          style={{ color: '#a89070' }}
                        >
                          {role.name}
                        </h3>
                      </div>
                    </div>
                    <span style={{ color: '#6a5a4a' }}>
                      {expandedRole === role.id ? '▼' : '▶'}
                    </span>
                  </button>

                  {/* Role Details */}
                  {expandedRole === role.id && (
                    <div 
                      className="px-4 pb-4 pt-2"
                      style={{ borderTop: '1px solid rgba(60,50,40,0.3)' }}
                    >
                      <p 
                        className="font-fantasy text-sm leading-relaxed mb-4"
                        style={{ color: '#8a7a6a' }}
                      >
                        {role.description}
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <span 
                          className="px-3 py-1 font-fantasy text-xs"
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: `1px solid ${getFactionColor(role.faction)}50`,
                            color: getFactionColor(role.faction),
                          }}
                        >
                          Phe: {FACTION_NAMES[role.faction]}
                        </span>
                        {role.aura && (
                          <span 
                            className="px-3 py-1 font-fantasy text-xs"
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              border: `1px solid ${getAuraColor(role.aura)}50`,
                              color: getAuraColor(role.aura),
                            }}
                          >
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
        <div 
          className="p-4 flex justify-end"
          style={{ borderTop: '1px solid rgba(139,115,85,0.2)' }}
        >
          <MedievalButton onClick={onClose} variant="secondary">
            Đóng
          </MedievalButton>
        </div>
      </div>
    </div>
  )
}
