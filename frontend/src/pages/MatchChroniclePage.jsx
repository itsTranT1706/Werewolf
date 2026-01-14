/**
 * Match Chronicle Page
 *
 * Immersive battle log after game ends.
 */

import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { BackButton, MysticBackdrop } from '@/components/ui'
import { RuneScroll, RuneQuill, RuneMoon, RuneForest, RuneSkull, CornerAccent } from '@/components/ui/AncientIcons'
import { FACTION_NAMES, ROLES, getRoleImage } from '@/constants/roles'

const phaseOrder = {
  NIGHT: 0,
  DAY: 1,
  END: 2
}

const eventTone = {
  phase: 'border-[#8b7355]/30 text-[#8b7355] bg-[#0d0a08]/60',
  story: 'border-[#8b7355]/30 text-[#c7b394] bg-[#0d0a08]/60',
  death: 'border-[#8b0000]/40 text-[#ffb3b3] bg-[#200808]/60',
  wolf: 'border-[#8b0000]/50 text-[#ffb3b3] bg-[#200808]/70',
  save: 'border-[#4ade80]/30 text-[#c0f5d2] bg-[#082008]/50',
  protect: 'border-[#c9a227]/40 text-[#f0d78a] bg-[#1a150a]/60',
  guard: 'border-[#c9a227]/40 text-[#f0d78a] bg-[#1a150a]/60',
  seer: 'border-[#8b7355]/30 text-[#d4c4a8] bg-[#0d0a08]/60',
  witch: 'border-[#4ade80]/30 text-[#c0f5d2] bg-[#082008]/60',
  vote: 'border-[#8b7355]/40 text-[#d4c4a8] bg-[#120f0a]/70',
  hunter: 'border-[#c9a227]/50 text-[#f0d78a] bg-[#1a150a]/70',
  end: 'border-[#c9a227]/50 text-[#f0d78a] bg-[#1a150a]/70'
}

const formatTime = (timestamp) => {
  if (!timestamp) return '--:--'
  try {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '--:--'
  }
}

const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '--:--'
  const durationMs = Math.max(0, endTime - startTime)
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const getPlayerName = (player) =>
  player?.username || player?.displayname || player?.name || player?.playerName || 'Một người chơi'

const sanitizeChronicleText = (text) => {
  if (!text) return ''
  return text
    .replace(/undefined/gi, '')
    .replace(/phiếu/gi, '')
    .replace(/\bvới\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export default function MatchChroniclePage() {
  const { state } = useLocation()
  const { roomId } = useParams()
  const storageKey = roomId ? `match_chronicle_${roomId}` : null

  const storedPayload = useMemo(() => {
    if (!storageKey) return null
    try {
      const raw = sessionStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [storageKey])

  const payload = state || storedPayload
  const chronicleEvents = payload?.chronicleEvents || []
  const roster = payload?.allPlayers || payload?.gameOver?.allPlayers || []

  const sections = useMemo(() => {
    if (!chronicleEvents.length) return []
    const grouped = new Map()
    chronicleEvents.forEach((event) => {
      const phase = event.phase || 'DAY'
      const day = event.day || 1
      const key = `${phase}-${day}`
      if (!grouped.has(key)) {
        grouped.set(key, { phase, day, events: [] })
      }
      grouped.get(key).events.push(event)
    })

    const list = Array.from(grouped.values())
    list.forEach((section) => {
      section.events.sort((a, b) => {
        const timeDiff = (a.timestamp || 0) - (b.timestamp || 0)
        if (timeDiff !== 0) return timeDiff
        return (a.sequence || 0) - (b.sequence || 0)
      })
    })
    list.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day
      return (phaseOrder[a.phase] || 0) - (phaseOrder[b.phase] || 0)
    })
    return list
  }, [chronicleEvents])

  const maxDayFromEvents = useMemo(() => {
    if (!chronicleEvents.length) return 0
    return chronicleEvents.reduce((maxDay, event) => Math.max(maxDay, event.day || 0), 0)
  }, [chronicleEvents])

  const winner = payload?.gameOver?.winner
  const winnerLabel = winner ? FACTION_NAMES[winner] || winner : 'Chưa rõ'
  const winnerTone =
    winner === 'VILLAGER'
      ? 'border-[#4ade80]/40 text-[#4ade80] bg-[#082008]/60'
      : winner === 'WEREWOLF'
        ? 'border-[#8b0000]/50 text-[#ff7a7a] bg-[#200808]/70'
        : 'border-[#c9a227]/50 text-[#c9a227] bg-[#1a150a]/70'

  const duration = formatDuration(payload?.startTime, payload?.endTime)
  const totalNights = payload?.day || maxDayFromEvents || 0
  const aliveCount = roster.filter((player) => player.isAlive).length

  if (!payload) {
    return (
      <MysticBackdrop>
        <div className="relative z-10 min-h-screen px-4 py-10">
          <div className="absolute top-6 left-6 z-20">
            <BackButton to="/game" label="Trở Về Sảnh" />
          </div>
          <div className="max-w-2xl mx-auto mt-16 bg-[#0d0a08]/80 border border-[#8b7355]/30 p-8 text-center">
            <h1 className="font-heading text-3xl text-[#d4c4a8] mb-4">Không tìm thấy biên niên sử</h1>
            <p className="text-sm text-[#8b7355]">
              Vui lòng quay lại phòng chơi hoặc kết thúc trận đấu để xem biên niên sử.
            </p>
          </div>
        </div>
      </MysticBackdrop>
    )
  }

  return (
    <MysticBackdrop>
      <div className="relative z-10 min-h-screen px-4 py-10">
        <div className="absolute top-6 left-6 z-20">
          <BackButton to={roomId ? `/room/${roomId}` : '/game'} label="Trở Về Phòng" />
        </div>

        <div className="text-center mb-10 pt-4">
          <div className="flex items-center justify-center gap-3 text-[#c9a227]">
            <RuneScroll className="w-7 h-7" />
            <h1 className="font-medieval text-3xl md:text-4xl tracking-[0.4em] text-[#c9a227]">
              Biên niên sử trận đấu
            </h1>
            <RuneQuill className="w-7 h-7" />
          </div>
          <p className="font-fantasy text-xs tracking-[0.5em] uppercase mt-4 text-[#6a5a4a]">
            Ghi chép trận đấu
          </p>
          <div className="flex justify-center mt-6">
            <div className="w-56 h-px theme-divider" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <div className={`p-6 border bg-[#0d0a08]/80 ${winnerTone}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-[#8b7355]">Phe thắng</span>
                <RuneSkull className="w-6 h-6 opacity-70" />
              </div>
              <h2 className="font-heading text-3xl mt-3">{winnerLabel}</h2>
              <p className="text-sm mt-3 text-[#c7b394]">{payload?.gameOver?.message}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 border border-[#8b7355]/20 bg-[#0a0808]/70 text-center">
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#8b7355]">Thời gian</div>
                <div className="font-heading text-lg text-[#d4c4a8] mt-2">{duration}</div>
              </div>
              <div className="p-4 border border-[#8b7355]/20 bg-[#0a0808]/70 text-center">
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#8b7355]">Số đêm</div>
                <div className="font-heading text-lg text-[#d4c4a8] mt-2">{totalNights || '-'}</div>
              </div>
              <div className="p-4 border border-[#8b7355]/20 bg-[#0a0808]/70 text-center">
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#8b7355]">Còn sống</div>
                <div className="font-heading text-lg text-[#d4c4a8] mt-2">
                  {aliveCount}/{roster.length || '-'}
                </div>
              </div>
            </div>

            <div className="p-5 border border-[#8b7355]/30 bg-[#0a0808]/70">
              <div className="text-xs uppercase tracking-[0.35em] text-[#8b7355] mb-4">
                Nhân vật trong làng
              </div>
              <div className="space-y-3">
                {roster.length === 0 && (
                  <div className="text-sm text-[#6a5a4a]">Chưa có dữ liệu nhân vật.</div>
                )}
                {roster.map((player) => {
                  const roleInfo = ROLES[player.role]
                  const roleName = roleInfo?.name || player.role || 'Không rõ'
                  const factionName = FACTION_NAMES[roleInfo?.faction] || 'Không rõ'
                  const roleImage = getRoleImage(player.role)
                  return (
                    <div
                      key={player.userId || player.username}
                      className="flex items-center gap-3 border border-[#8b7355]/20 bg-[#0d0a08]/70 p-3"
                    >
                      {roleImage ? (
                        <img
                          src={roleImage}
                          alt={roleName}
                          className="w-12 h-12 object-cover border border-[#8b7355]/30"
                        />
                      ) : (
                        <div className="w-12 h-12 border border-[#8b7355]/30 bg-[#120f0a] flex items-center justify-center text-xs text-[#8b7355]">
                          ??
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-heading text-sm text-[#f3e7cf]">{getPlayerName(player)}</div>
                        <div className="text-[11px] text-[#8b7355]">{roleName} • {factionName}</div>
                      </div>
                      <div
                        className={`text-[11px] uppercase tracking-[0.3em] ${
                          player.isAlive ? 'text-[#4ade80]' : 'text-[#8b0000]'
                        }`}
                      >
                        {player.isAlive ? 'Sống' : 'Tử trận'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {sections.length === 0 && (
              <div className="border border-[#8b7355]/20 bg-[#0d0a08]/70 p-6 text-sm text-[#8b7355]">
                Chưa có sự kiện hiển thị
              </div>
            )}
            {sections.map((section) => {
              const isNight = section.phase === 'NIGHT'
              const isDay = section.phase === 'DAY'
              const isEnd = section.phase === 'END'
              const title = isEnd
                ? 'Kết thúc'
                : `${isNight ? 'Đêm' : 'Ngày'} Thứ ${section.day}`
              const Icon = isNight ? RuneMoon : isDay ? RuneForest : RuneSkull
              const accent = isNight ? 'border-[#8b0000]/40' : isDay ? 'border-[#c9a227]/30' : 'border-[#c9a227]/50'

              return (
                <div key={`${section.phase}-${section.day}`} className="relative pl-12">
                  <div
                    className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border ${accent} bg-[#0b0a08] flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4 text-[#c9a227]" />
                  </div>
                  <div className="border-l border-[#8b7355]/30 pl-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm tracking-[0.45em] uppercase text-[#c9a227]">
                        {title}
                      </h3>
                      <span className="text-[11px] text-[#6a5a4a]">Biên niên sử</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {section.events.map((event) => {
                        const tone = eventTone[event.type] || eventTone.story
                        return (
                          <div key={event.id} className="relative pl-5">
                            <span className="absolute left-0 top-3 w-2 h-2 rounded-full bg-[#c9a227]" />
                            <div className={`border px-4 py-3 text-sm ${tone}`}>
                              <div className="text-[#d4c4a8]">{sanitizeChronicleText(event.text)}</div>
                              <div className="text-[11px] text-[#8b7355] mt-2">{formatTime(event.timestamp)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="fixed top-6 left-6 text-[#8b7355] opacity-10 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="top-left" />
      </div>
      <div className="fixed top-6 right-6 text-[#8b7355] opacity-10 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="top-right" />
      </div>
      <div className="fixed bottom-6 left-6 text-[#8b7355] opacity-10 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="bottom-left" />
      </div>
      <div className="fixed bottom-6 right-6 text-[#8b7355] opacity-10 pointer-events-none z-0">
        <CornerAccent className="w-20 h-20" position="bottom-right" />
      </div>
    </MysticBackdrop>
  )
}
