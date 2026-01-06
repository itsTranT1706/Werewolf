/**
 * Room Page - Lobby và bắt đầu game
 * UI mới với thiết kế medieval
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameApi, roomApi } from '@/api'
import { getSocket } from '@/api/socket'
import RoleSetupModal from '@/components/game/RoleSetupModal'
import { ROLES, FACTION_NAMES } from '@/constants/roles'
import { getOrCreateGuestUserId, getOrCreateGuestUsername } from '@/utils/guestUtils'

export default function RoomPage() {
    const { roomId } = useParams()
    const navigate = useNavigate()

    // State
    const [players, setPlayers] = useState([])
    const [myRole, setMyRole] = useState(null)
    const [gameStarted, setGameStarted] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [socketConnected, setSocketConnected] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [isHost, setIsHost] = useState(false) // Quản trò (cờ cho chính user hiện tại)
    const [hostId, setHostId] = useState(null)  // userId của quản trò để mọi người đều thấy
    const [showRoleSetup, setShowRoleSetup] = useState(false)
    const [roleSetup, setRoleSetup] = useState(null)
    const [roleAssignment, setRoleAssignment] = useState(null)
    const [maxPlayers, setMaxPlayers] = useState(12)
    const [availableRoles, setAvailableRoles] = useState(null)
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState('')

    // Get current user ID (hoặc guest ID nếu chưa đăng nhập)
    // QUAN TRỌNG: Ưu tiên dùng userId đã lưu khi tạo phòng để đảm bảo nhất quán
    useEffect(() => {
        try {
            // Kiểm tra xem có userId đã lưu khi tạo phòng không
            const creatorUserId = localStorage.getItem(`room_${roomId}_creator_userId`)

            if (creatorUserId) {
                // Nếu có, dùng userId này để đảm bảo khớp với hostId
                console.log(`🎯 Using creator userId from localStorage: ${creatorUserId}`)
                setCurrentUserId(creatorUserId)
                return
            }

            // Nếu không có, lấy userId như bình thường
            const token = localStorage.getItem('token')
            let userId = null

            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                userId = payload.userId || payload.id || 'current-user'
                console.log(`🔐 Authenticated user - userId: ${userId}`)
                console.log(`   ⚠️ LƯU Ý: Nếu test với 2 trình duyệt, cần đăng nhập với 2 tài khoản khác nhau hoặc 1 trình duyệt đăng nhập, 1 trình duyệt guest`)
            } else {
                // Nếu không có token, tạo guest userId (lưu vào localStorage để giữ nguyên)
                userId = getOrCreateGuestUserId()
                console.log(`👤 Guest user - userId: ${userId}`)
                console.log(`   ✅ Mỗi trình duyệt sẽ có guest userId riêng`)
            }

            setCurrentUserId(userId)
        } catch (err) {
            console.warn('Could not get userId from token:', err)
            // Fallback: tạo guest userId
            const userId = getOrCreateGuestUserId()
            setCurrentUserId(userId)
        }
    }, [roomId])

    // Load room info và join phòng
    useEffect(() => {
        if (!roomId || !currentUserId) return

        let isUnmounted = false

        const updateRoomState = (room) => {
            if (!room || isUnmounted) return

            setMaxPlayers(room.maxPlayers || 12)
            setAvailableRoles(room.availableRoles || null)

            const hostIdFromStorage = localStorage.getItem(`room_${roomId}_host`)
            // Nếu backend chưa trả hostId nhưng còn người chơi, tạm chọn player đầu làm host (UI fallback)
            const fallbackHostId = (!room.hostId && room.players?.length) ? room.players[0].userId : null
            const actualHostId = room.hostId || fallbackHostId || hostIdFromStorage

            // Đồng bộ lại hostId vào localStorage nếu backend đã đổi
            if (room.hostId || fallbackHostId) {
                localStorage.setItem(`room_${roomId}_host`, room.hostId || fallbackHostId)
            }

            setHostId(actualHostId || null)
            const isHostUser = String(actualHostId) === String(currentUserId)
            setIsHost(isHostUser)

            if (room.players && room.players.length > 0) {
                setPlayers(room.players.map(p => ({
                    userId: p.userId,
                    username: p.username || `Người_Chơi_${p.userId}`,
                    isGuest: p.isGuest || p.userId?.startsWith('guest-')
                })))
            }
        }

        const fetchRoomState = async () => {
            try {
                const result = await roomApi.get(roomId)
                updateRoomState(result.room)
            } catch (err) {
                console.warn('Không thể đồng bộ phòng:', err)

                // Nếu phòng không còn tồn tại trong lúc đang ở phòng → quay về /game với thông báo lỗi
                if (err.status === 404) {
                    navigate(`/game?error=${encodeURIComponent('Phòng không tồn tại hoặc đã bị xoá')}`)
                }
            }
        }

        const loadAndJoinRoom = async () => {
            try {
                // Lấy username cho guest player
                const token = localStorage.getItem('token')
                let username = null
                if (!token) {
                    // Guest: dùng username random/đã lưu
                    username = getOrCreateGuestUsername()
                    // Đảm bảo guest userId được lưu vào localStorage trước khi gửi request
                    const guestUserId = getOrCreateGuestUserId()
                    console.log(`🔑 Guest user - userId: ${guestUserId}, username: ${username}`)
                } else {
                    // User đã đăng nhập: lấy username từ JWT (trùng với username ở hồ sơ)
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        username = payload.username || payload.displayname || null
                        console.log(`🔑 Authenticated user - userId: ${currentUserId}, username: ${username}`)
                    } catch (err) {
                        console.warn('Could not get username from token:', err)
                    }
                }

                // Thử get room info trước để kiểm tra xem đã join chưa
                let room = null
                try {
                    const result = await roomApi.get(roomId)
                    room = result.room

                    if (room) {
                        // Kiểm tra xem user đã có trong danh sách players chưa
                        // So sánh bằng String để đảm bảo chính xác
                        const existingPlayer = room.players?.find(p => String(p.userId) === String(currentUserId))

                        console.log(`🔍 Checking existing player - currentUserId: ${currentUserId}, players:`, room.players?.map(p => p.userId))

                        if (!existingPlayer) {
                            // Nếu chưa join, mới join
                            console.log(`➕ User ${currentUserId} not in room, joining...`)
                            console.log(`   Sending join request with userId: ${currentUserId}, username: ${username}`)
                            try {
                                const joinResult = await roomApi.join(roomId, null, username)
                                room = joinResult.room
                                console.log(`✅ Successfully joined room - Players count: ${room.players?.length || 0}`)
                                console.log(`   Players:`, room.players?.map(p => ({ userId: p.userId, username: p.username })))

                                // Force update players list ngay lập tức
                                if (room.players && room.players.length > 0) {
                                    setPlayers(room.players.map(p => ({
                                        userId: p.userId,
                                        username: p.username || `Người_Chơi_${p.userId}`,
                                        isGuest: p.isGuest || p.userId?.startsWith('guest-')
                                    })))
                                }
                            } catch (joinErr) {
                                console.error('❌ Join failed:', joinErr)
                                console.error('   Error details:', joinErr.response?.data || joinErr.message)
                                // Nếu join lỗi, vẫn dùng room info đã lấy
                            }
                        } else {
                            console.log(`✅ User ${currentUserId} already in room`)
                            console.log(`   Current players in room:`, room.players?.map(p => ({ userId: p.userId, username: p.username })))
                        }
                    }
                } catch (getErr) {
                    console.warn('Get room failed, room does not exist or service unavailable:', getErr)
                    // Điều hướng về /game kèm thông báo lỗi để hiển thị rõ ràng
                    navigate(`/game?error=${encodeURIComponent('Phòng không tồn tại hoặc đã bị xoá')}`)
                    return
                }

                if (room) {
                    updateRoomState(room)

                    // Lưu hostId mới ngay khi lấy được từ backend
                    if (room.hostId) {
                        localStorage.setItem(`room_${roomId}_host`, room.hostId)
                    }
                }
            } catch (err) {
                console.warn('Error loading room from API:', err)
                navigate(`/game?error=${encodeURIComponent('Phòng không tồn tại hoặc không thể truy cập')}`)
            }
        }

        loadAndJoinRoom()

        const intervalId = setInterval(fetchRoomState, 3000)

        return () => {
            isUnmounted = true
            clearInterval(intervalId)
        }
    }, [roomId, currentUserId])

    // Check socket connection và join room
    useEffect(() => {
        const socket = getSocket()
        setSocketConnected(socket.connected)

        const onConnect = () => {
            console.log('✅ Socket connected')
            setSocketConnected(true)

            // Emit ROOM_JOIN khi socket connected
            if (roomId && currentUserId) {
                socket.emit('ROOM_JOIN', { roomId })
                console.log('📥 Đã join phòng:', roomId)
            }
        }

        const onDisconnect = () => {
            console.log('❌ Socket disconnected')
            setSocketConnected(false)
        }

        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)

        // Nếu đã connected, join room ngay
        if (socket.connected && roomId && currentUserId) {
            socket.emit('ROOM_JOIN', { roomId })
            console.log('📥 Đã join phòng:', roomId)
        }

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
        }
    }, [roomId, currentUserId])


    // Listen for role assignment và game events
    useEffect(() => {
        const unsubscribeRole = gameApi.onRoleAssigned((data) => {
            console.log('🎭 Nhận vai trò:', data)
            setMyRole(data)
            gameApi.updateFaction(roomId, data.faction)
        })

        const unsubscribeStarted = gameApi.onGameStarted((data) => {
            console.log('🎮 Game đã bắt đầu!', data)
            setGameStarted(true)
        })

        const unsubscribeError = gameApi.onGameStartError((error) => {
            console.error('❌ Lỗi:', error.message)
            setError(error.message)
            setLoading(false)
        })

        const unsubscribeRoleList = gameApi.onRoleAssignmentList((data) => {
            console.log('📋 Danh sách vai trò đã xáo:', data)
            setRoleAssignment(data.assignment)
            setLoading(false)
        })

        return () => {
            unsubscribeRole()
            unsubscribeStarted()
            unsubscribeError()
            unsubscribeRoleList()
        }
    }, [roomId])

    const handleStartGame = () => {
        if (players.length < 3) {
            setError('Cần ít nhất 3 người chơi để bắt đầu game')
            return
        }

        if (players.length > 75) {
            setError('Tối đa 75 người chơi trong một ván')
            return
        }

        if (!socketConnected) {
            setError('Socket chưa kết nối. Vui lòng đợi...')
            return
        }

        setShowRoleSetup(true)
    }

    const handleRoleSetupConfirm = (setup) => {
        setRoleSetup(setup)
        setShowRoleSetup(false)
        setError(null)
        setLoading(true)

        console.log('🎮 Starting game with role setup:', setup)

        try {
            gameApi.startGame(roomId, players, setup, availableRoles)
            console.log('✅ GAME_START event đã được gửi')
        } catch (err) {
            console.error('❌ Error starting game:', err)
            setError('Lỗi khi bắt đầu game: ' + err.message)
            setLoading(false)
        }
    }

    const handleLeaveRoom = async () => {
        if (!roomId || !currentUserId) {
            navigate('/game')
            return
        }

        try {
            setLoading(true)
            await roomApi.leave(roomId, currentUserId)
            setPlayers(prev => {
                const remaining = prev.filter(p => String(p.userId) !== String(currentUserId))

                // Nếu mình là quản trò và vẫn còn người chơi, gán tạm người đầu tiên làm quản trò
                if (isHost && remaining.length > 0) {
                    const [newHost, ...rest] = remaining
                    return [
                        { ...newHost, isHost: true },
                        ...rest.map(p => ({ ...p, isHost: false }))
                    ]
                }

                return remaining
            })
            if (isHost) {
                setIsHost(false)
            }
            // Dọn localStorage để tránh giữ host cũ
            localStorage.removeItem(`room_${roomId}_host`)
            localStorage.removeItem(`room_${roomId}_creator_userId`)
            navigate('/game')
        } catch (err) {
            console.error('❌ Rời phòng thất bại:', err)
            setError('Không thể rời phòng, thử lại sau.')
        } finally {
            setLoading(false)
        }
    }

    const handleSendChat = () => {
        if (!chatInput.trim()) return
        // TODO: Gửi chat message qua socket
        setChatMessages(prev => [...prev, {
            userId: currentUserId,
            username: 'Bạn',
            text: chatInput,
            timestamp: Date.now()
        }])
        setChatInput('')
    }

    const getPlayerStatus = (player) => {
        // Kiểm tra xem player đã có role chưa
        if (roleAssignment) {
            const assigned = roleAssignment.find(a => a.player?.userId === player.userId)
            if (assigned) {
                return 'prepared'
            }
        }
        return 'unprepared'
    }

    const getPlayerRole = (player) => {
        if (roleAssignment) {
            const assigned = roleAssignment.find(a => a.player?.userId === player.userId)
            if (assigned) {
                return assigned.roleName || assigned.role
            }
        }
        return null
    }

    const isElder = (player) => {
        // Quản trò là player có userId === hostId (ai cũng thấy được),
        // riêng client của quản trò còn có thêm cờ isHost để mở nút bắt đầu game
        return hostId && String(player.userId) === String(hostId)
    }

    return (
        <div className="min-h-screen bg-midnight text-parchment-text overflow-hidden selection:bg-blood-red selection:text-white">
            <div className="fixed inset-0 vignette z-50 pointer-events-none"></div>
            <div className="relative flex h-screen w-full flex-col bg-fog-texture bg-fixed overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-wood-light px-8 py-5 bg-[#080608]/95 backdrop-blur-md z-40 shadow-2xl">
                    <div className="flex items-center gap-5">
                        <div className="relative flex items-center justify-center size-12 rounded-full bg-wood-dark border-2 border-wood-light shadow-glow-candle group cursor-pointer transition-all duration-700 hover:border-blood-red">
                            <span className="material-symbols-outlined text-3xl text-blood-red/80 group-hover:text-blood-red transition-colors duration-500">skull</span>
                            <div className="absolute inset-0 rounded-full bg-orange-900/10 animate-flicker"></div>
                        </div>
                        <div>
                            <h2 className="font-heading text-2xl font-bold tracking-widest text-parchment-text/90 drop-shadow-md">Ma Sói</h2>
                            <p className="text-xs text-blood-red font-serif italic tracking-wider opacity-70 uppercase">Làng Bị Nguyền Rủa</p>
                        </div>
                    </div>
                    <div className="flex gap-4">

                        <button
                            onClick={handleLeaveRoom}
                            className="flex size-10 cursor-pointer items-center justify-center rounded border border-wood-light bg-wood-dark/50 text-parchment-text hover:bg-blood-dried hover:border-blood-red/50 transition-all duration-500"
                        >
                            <span className="material-symbols-outlined text-lg">Quay lại</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col lg:flex-row h-full max-w-[1920px] mx-auto w-full">
                        {/* Left Section - Players Grid */}
                        <section className="flex flex-col flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar relative z-10">
                            <div className="flex flex-col gap-4 mb-10">
                                <div className="flex flex-wrap items-end justify-between gap-6 border-b border-wood-light/30 pb-6">
                                    <div>
                                        <h1 className="font-heading text-4xl lg:text-6xl text-parchment-text drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                            Phòng {roomId || 'Không xác định'}
                                        </h1>
                                        <p className="text-gold-dim text-lg font-serif italic flex items-center gap-2 mt-2">
                                            <span className="material-symbols-outlined text-base">forest</span>
                                            Rừng Tối
                                            <span className="mx-2 text-wood-light text-xs">◆</span>
                                            <span className="text-parchment-text font-bold">{players.length}/{maxPlayers || 75}</span> Linh Hồn Hiện Diện
                                        </p>
                                    </div>
                                    <div className="relative group cursor-pointer">
                                        <div className="absolute inset-0 bg-blood-red/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                        <div className="flex items-center gap-4 bg-wood-dark border border-wood-light px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative">
                                            <div className="absolute -top-3 -right-3 size-8 rounded-full bg-blood-red border-2 border-blood-dried shadow-md flex items-center justify-center z-20">
                                                <span className="material-symbols-outlined text-white/80 text-xs">share</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gold-dim uppercase font-bold tracking-[0.2em]">Mã Triệu Hồi</span>
                                                <span className="font-heading text-2xl text-parchment-text tracking-widest">{roomId || '8291'}</span>
                                            </div>
                                            <div className="h-8 w-[1px] bg-wood-light/50 mx-1"></div>
                                            <span
                                                className="material-symbols-outlined text-parchment-text/50 group-hover:text-parchment-text transition-colors cursor-pointer"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(roomId || '8291')
                                                }}
                                            >sao chép</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Players Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                                {players.map((player, index) => {
                                    const status = getPlayerStatus(player)
                                    const role = getPlayerRole(player)
                                    const elder = isElder(player)

                                    return (
                                        <div
                                            key={player.userId}
                                            className={`group relative flex flex-col p-1 bg-wood-dark/80 border ${elder ? 'border-gold-dim/40 shadow-[0_0_15px_rgba(138,126,95,0.1)]' :
                                                status === 'prepared' ? 'border-wood-light' : 'border-wood-light'
                                                } shadow-2xl transition-all duration-500 hover:border-gold-dim hover:-translate-y-1`}
                                        >
                                            {elder && (
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-wood-dark px-3 py-0.5 border border-gold-dim/40 shadow-md">
                                                    <span className="text-[9px] font-heading text-gold-dim uppercase tracking-widest">Quản Trò</span>
                                                </div>
                                            )}
                                            <div className="w-full aspect-[4/5] bg-black relative overflow-hidden sepia-[0.3] contrast-125 saturate-50 group-hover:sepia-0 group-hover:saturate-100 transition-all duration-700">
                                                <img
                                                    alt={player.username}
                                                    className="w-full h-full object-cover opacity-80"
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.userId}`}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                                    <span className="material-symbols-outlined text-6xl text-white/20 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                                        {role ? 'visibility_off' : 'person'}
                                                    </span>
                                                </div>
                                                {status === 'prepared' && (
                                                    <div className="absolute top-2 right-2">
                                                        <span
                                                            className="material-symbols-outlined drop-shadow-md text-lg text-green-700/80"
                                                            title="Sẵn Sàng"
                                                        >
                                                            check_circle
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 text-center bg-gradient-to-t from-[#151210] to-[#1f1a16] border-t border-wood-light/20 relative">
                                                <p className={`font-heading text-sm tracking-wide truncate ${elder ? 'text-gold-dim' : 'text-parchment-text'
                                                    } group-hover:text-white transition-colors`}>
                                                    {player.username}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Empty slots */}
                                {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, index) => (
                                    <div
                                        key={`empty-${index}`}
                                        className="flex flex-col items-center justify-center gap-3 p-3 bg-wood-dark/30 border border-dashed border-wood-light/30 transition-colors hover:bg-wood-dark/50 hover:border-wood-light/50 group"
                                    >
                                        <div className="flex items-center justify-center size-14 rounded-full bg-wood-light/20 text-wood-light group-hover:text-parchment-text/50 transition-colors">
                                            <span className="material-symbols-outlined text-2xl">person_off</span>
                                        </div>
                                        <p className="text-wood-light text-xs font-serif italic group-hover:text-parchment-text/50">Mộ Trống...</p>
                                    </div>
                                ))}
                            </div>

                            {/* Start Game Button (chỉ hiển thị cho quản trò) */}
                            {!gameStarted && isHost && (
                                <div className="mt-auto pt-4 flex gap-6">
                                    <button
                                        onClick={handleStartGame}
                                        disabled={loading || players.length < 3 || players.length > 75}
                                        className="flex-1 max-w-sm h-16 bg-[#1a0f1f] border border-purple-900 hover:border-purple-600 text-purple-200 font-heading text-lg tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(88,28,135,0.2)] transition-all duration-500 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                        <span className="z-10">{loading ? 'Đang khởi tạo...' : 'BẮt đầu đi săn'}</span>
                                    </button>
                                    <button
                                        onClick={handleLeaveRoom}
                                        className="h-16 aspect-square bg-wood-dark border border-wood-light hover:border-blood-red hover:bg-blood-dried/20 text-parchment-text flex items-center justify-center transition-all duration-300"
                                    >
                                        <span className="material-symbols-outlined text-2xl">Quay lại</span>
                                    </button>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-4 bg-blood-dried border border-blood-red rounded-lg">
                                    <p className="text-red-300">{error}</p>
                                </div>
                            )}

                            {/* Game Started Message */}
                            {gameStarted && (
                                <div className="mt-4 text-center p-6 bg-wood-dark border border-gold-dim rounded-lg">
                                    <p className="text-xl text-gold-dim font-heading">
                                        🎮 Game đã bắt đầu!
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Right Section - Chat Sidebar */}
                        <aside className="w-full lg:w-[420px] xl:w-[480px] bg-wood-grain border-l border-wood-light/50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-20">
                            <div className="bg-[#15110e] px-6 py-5 border-b border-wood-light/50 flex items-center justify-between shadow-lg z-10">
                                <h3 className="font-heading text-parchment-text text-xl flex items-center gap-3 drop-shadow-md">
                                    <span className="material-symbols-outlined text-blood-red/70">history_edu</span>
                                    Biên Niên Sử Làng
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className={`size-2 rounded-full ${socketConnected ? 'bg-green-900 animate-pulse' : 'bg-red-900'}`}></div>
                                    <span className="text-[10px] font-serif uppercase tracking-widest text-stone-500">
                                        {socketConnected ? 'Đang Thì Thầm' : 'Im Lặng'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 bg-[#0c0907] relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                                <div className="flex justify-center my-4">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-wood-light text-xl mb-1 opacity-50">church</span>
                                        <p className="font-serif italic text-sm text-stone-500">Làng tụ họp trong im lặng...</p>
                                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-wood-light/30 to-transparent mx-auto mt-2"></div>
                                    </div>
                                </div>

                                {chatMessages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col gap-1 max-w-[90%] group ${msg.userId === currentUserId ? 'items-end ml-auto' : 'items-start'
                                            }`}
                                    >
                                        <span className={`text-[11px] text-wood-light font-heading tracking-wider ${msg.userId === currentUserId ? 'mr-2' : 'ml-2'
                                            }`}>
                                            {msg.username}
                                        </span>
                                        <div className={`bg-wood-dark border border-[#3e342b] text-parchment-text/90 px-5 py-3 shadow-lg relative torn-edge ${msg.userId === currentUserId ? 'bg-[#241c16] border-blood-red/20' : ''
                                            }`}>
                                            <p className="text-base font-serif italic leading-relaxed ink-blot">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-[#15110e] border-t border-wood-light/30 z-20">
                                <div className="relative flex items-center group">
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-wood-light opacity-50 group-focus-within:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-3xl font-thin rotate-12">flight</span>
                                    </div>
                                    <input
                                        className="w-full h-14 pl-10 pr-12 bg-transparent border-b-2 border-wood-light text-parchment-text font-serif italic text-lg placeholder-stone-600 focus:outline-none focus:border-blood-red transition-all duration-500"
                                        placeholder="Viết tin nhắn của bạn ở đây..."
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        className="absolute right-2 p-2 text-stone-500 hover:text-parchment-text transition-colors duration-300"
                                    >
                                        <span className="material-symbols-outlined text-2xl">send</span>
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>

            {/* Role Setup Modal */}
            <RoleSetupModal
                isOpen={showRoleSetup}
                onClose={() => setShowRoleSetup(false)}
                playerCount={players.length}
                onConfirm={handleRoleSetupConfirm}
                initialSetup={roleSetup}
                availableRoles={availableRoles}
            />

            {/* Role Reveal Modal - cho từng người chơi biết vai trò của mình */}
            {myRole && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4">
                    <div className="bg-wood-dark border-4 border-gold rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <h3 className="font-heading text-2xl text-gold-dim mb-4 text-center">
                            🎭 Vai Trò Của Bạn
                        </h3>
                        <p className="text-center text-sm text-parchment-text/70 mb-2">
                            Chỉ bạn mới thấy được màn hình này
                        </p>
                        <div className="mt-4 text-center space-y-3">
                            <p className="text-sm text-gold-dim/80 uppercase tracking-[0.2em]">
                                {FACTION_NAMES[myRole.faction] || myRole.faction}
                            </p>
                            <p className="font-heading text-3xl text-parchment-text">
                                {myRole.roleName || myRole.role}
                            </p>
                        </div>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setMyRole({ ...myRole, acknowledged: true })}
                                className="px-6 py-3 bg-gold border border-gold-dark rounded text-wood-dark font-bold hover:bg-gold-light transition-colors"
                            >
                                Đã Hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
