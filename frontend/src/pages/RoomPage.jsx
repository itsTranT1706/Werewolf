/**
 * Room Page - Lobby và bắt đầu game
 * Dark medieval fantasy theme - Cursed gathering hall
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameApi } from '@/api'
import { getSocket } from '@/api/socket'
import { getRoomSocket } from '@/api/roomSocket'
import RoleSetupModal from '@/components/game/RoleSetupModal'
import RoleRevealCard from '@/components/game/RoleRevealCard'
import { ROLES, FACTION_NAMES } from '@/constants/roles'
import { notify } from '@/components/ui'
import { getOrCreateGuestUserId, getOrCreateGuestUsername } from '@/utils/guestUtils'
import { 
  RuneSkull, 
  RuneArrowLeft, 
  RuneForest, 
  RuneShare, 
  RuneCopy, 
  RuneUser, 
  RuneCheck, 
  RuneEye, 
  RuneChat, 
  RuneSend,
  RuneMoon,
  CornerAccent 
} from '@/components/ui/AncientIcons'

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
    const [hostPlayerId, setHostPlayerId] = useState(null)  // playerId của quản trò (cho anonymous users)
    const [showRoleSetup, setShowRoleSetup] = useState(false)
    const [roleSetup, setRoleSetup] = useState(null)
    const [roleAssignment, setRoleAssignment] = useState(null)
    const [maxPlayers, setMaxPlayers] = useState(12)
    const [availableRoles, setAvailableRoles] = useState(null)
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [roomCode, setRoomCode] = useState(null) // Room code (4 digits)
    const [roomSocket, setRoomSocket] = useState(null)
    const [shareOpen, setShareOpen] = useState(false)
    const joinLink = useMemo(() => {
        const code = roomCode || (/^\d{4}$/.test(roomId || '') ? roomId : '')
        if (!code) return ''
        return `${window.location.origin}/game?room=${code}`
    }, [roomCode, roomId])

    const qrUrl = useMemo(() => {
        if (!joinLink) return ''
        return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(joinLink)}`
    }, [joinLink])

    const handleCopyLink = async () => {
        if (!joinLink) return
        try {
            await navigator.clipboard.writeText(joinLink)
            notify.success('Link copied', 'Share')
        } catch {
            notify.error('Failed to copy link', 'Share')
        }
    }

    const handleOpenChronicle = () => {
        if (!roomId || !gameOver) return
        const payload = {
            gameOver,
            chronicleEvents,
            allPlayers: gameOver?.allPlayers || [],
            startTime: gameStartTime,
            endTime: gameEndTime,
            day: gameStateRef.current.day,
            roomCode
        }
        if (chronicleStorageKey) {
            sessionStorage.setItem(chronicleStorageKey, JSON.stringify(payload))
        }
        navigate(`/room/${roomId}/chronicle`, { state: payload })
    }
    const [currentRoomId, setCurrentRoomId] = useState(null) // Room ID (UUID) từ backend
    const [currentPlayerId, setCurrentPlayerId] = useState(null) // Player ID của user hiện tại
    const [currentDisplayname, setCurrentDisplayname] = useState(null) // Displayname của user hiện tại

    // ============================================
    // Game State - Driven by Game Service
    // The frontend NEVER calculates game outcomes.
    // All state below is populated from service responses.
    // ============================================
    
    // Core game state from service
    const [gameState, setGameState] = useState({
        phase: 'LOBBY',           // 'LOBBY' | 'NIGHT' | 'DAY' | 'ENDED'
        day: 0,                   // Current day number
        currentStep: null,        // Current night step or day action
        alivePlayers: [],         // Array of alive player IDs
        deadPlayers: [],          // Array of { odlayerId, username, role, cause }
        witchSkills: { saveUsed: false, poisonUsed: false },
        pendingAction: null,      // What action the GM needs to take next
    })
    
    // UI state (local only - for rendering)
    const [selectedPlayerId, setSelectedPlayerId] = useState(null) // GM selected player for actions
    const [witchAction, setWitchAction] = useState(null) // 'HEAL' | 'POISON' | 'NOTHING' | null
    const [witchHealedThisNight, setWitchHealedThisNight] = useState(false) // Track if witch healed this night
    
    // Service response displays (populated by service, cleared after display)
    const [seerResult, setSeerResult] = useState(null) // { playerName, result: 'WEREWOLF' | 'VILLAGER' }
    const [nightResult, setNightResult] = useState(null) // { deaths: [], saved: [], message: string }
    const [narrative, setNarrative] = useState(null) // { message: string, deaths: [] } - GM reads aloud
    const [hunterCanShoot, setHunterCanShoot] = useState(null) // { hunterId, hunterName }
    const [voteResult, setVoteResult] = useState(null) // { hangedPlayer, voteResults, message }
    const [gameOver, setGameOver] = useState(null) // { winner, message, allPlayers }
    const [chronicleEvents, setChronicleEvents] = useState([])
    const [gameStartTime, setGameStartTime] = useState(null)
    const [gameEndTime, setGameEndTime] = useState(null)
    const [executionPending, setExecutionPending] = useState(null) // { playerId, playerName } - Pending execution confirmation
    
    // Bitten player info from service (for Witch step)
    const [bittenPlayer, setBittenPlayer] = useState(null) // { playerId, playerName }
    
    // Derived state for convenience
    const gameStatus = gameState.phase
    const currentNightStep = gameState.currentStep
    const deadPlayers = gameState.deadPlayers.map(d => d.userId || d.playerId)
    const witchPotions = gameState.witchSkills
    const gameStateRef = useRef(gameState)
    const chronicleStorageKey = roomId ? `match_chronicle_${roomId}` : null
    const chronicleIndexRef = useRef(0)

    useEffect(() => {
        gameStateRef.current = gameState
    }, [gameState])

    const getPlayerName = (player) =>
        player?.username || player?.displayname || player?.name || player?.playerName || 'M?Tt ng’?i ch’i'

    const addChronicleEntries = (entries) => {
        if (!entries || entries.length === 0) return
        const timestamp = Date.now()
        const baseIndex = chronicleIndexRef.current
        setChronicleEvents((prev) => [
            ...prev,
            ...entries.map((entry, index) => ({
                id: `chron-${timestamp}-${index}-${Math.random().toString(36).slice(2, 8)}`,
                timestamp,
                sequence: baseIndex + index,
                ...entry
            }))
        ])
        chronicleIndexRef.current = baseIndex + entries.length
    }

    useEffect(() => {
        if (!chronicleStorageKey || !gameOver) return
        const payload = {
            gameOver,
            chronicleEvents,
            allPlayers: gameOver?.allPlayers || [],
            startTime: gameStartTime,
            endTime: gameEndTime,
            day: gameState.day,
            roomCode
        }
        sessionStorage.setItem(chronicleStorageKey, JSON.stringify(payload))
    }, [chronicleStorageKey, gameOver, chronicleEvents, gameStartTime, gameEndTime, gameState.day, roomCode])

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

    // Khởi tạo room socket và join room
    useEffect(() => {
        if (!roomId || !currentUserId) return

        const socket = getRoomSocket()
        setRoomSocket(socket)

        let isUnmounted = false

        const updateRoomState = (room, myPlayerId = null) => {
            if (!room || isUnmounted) return

            setMaxPlayers(prev => (room.maxPlayers ?? prev ?? 12))
            setAvailableRoles(room.settings?.availableRoles || room.availableRoles || null)
            setRoomCode(room.code || null)

            // Tìm host player
            const hostPlayer = room.players?.find(p => p.isHost)
            const actualHostId = hostPlayer?.userId || null
            const hostPlayerId = hostPlayer?.id || null

            // Dùng myPlayerId nếu có (truyền vào), nếu không thì dùng currentPlayerId từ state
            const playerIdToCheck = myPlayerId || currentPlayerId

            console.log('🔍 Checking host status:', {
                hostPlayer: hostPlayer ? { id: hostPlayer.id, userId: hostPlayer.userId, displayname: hostPlayer.displayname, isHost: hostPlayer.isHost } : null,
                actualHostId,
                hostPlayerId,
                currentUserId,
                currentPlayerId,
                myPlayerId,
                playerIdToCheck,
                roomId
            })

            if (actualHostId) {
                localStorage.setItem(`room_${roomId}_host`, actualHostId)
            }
            if (hostPlayerId) {
                localStorage.setItem(`room_${roomId}_hostPlayerId`, hostPlayerId)
            }

            setHostId(actualHostId || null)
            setHostPlayerId(hostPlayerId || null)

            // Check host when we have enough info to avoid stale isHost state
            if (actualHostId !== null || playerIdToCheck) {
                // Check host: Với anonymous users (userId = null), check bằng playerId
                let isHostUser = false
                if (actualHostId !== null) {
                    // Authenticated user: check bằng userId
                    isHostUser = String(actualHostId) === String(currentUserId)
                } else if (hostPlayerId && playerIdToCheck) {
                    // Anonymous user: check bằng playerId
                    isHostUser = String(hostPlayerId) === String(playerIdToCheck)
                }

                console.log('🔍 Host check result:', {
                    actualHostId,
                    hostPlayerId,
                    currentUserId,
                    currentPlayerId,
                    myPlayerId,
                    playerIdToCheck,
                    isHostUser,
                    comparison: actualHostId !== null
                        ? `"${actualHostId}" === "${currentUserId}"`
                        : `"${hostPlayerId}" === "${playerIdToCheck}"`
                })
                setIsHost(isHostUser)
            } else {
                // Nếu không có myPlayerId, chỉ update state khác, giữ nguyên isHost
                console.log('🔍 Skipping host check (no myPlayerId provided, keeping current isHost state)')
            }

            if (room.players && room.players.length > 0) {
                setPlayers(room.players.map(p => ({
                    id: p.id, // Thêm playerId
                    userId: p.userId,
                    username: p.displayname || p.username || `Người_Chơi_${p.userId}`,
                    isGuest: p.isGuest || p.userId?.startsWith('guest-'),
                    isHost: p.isHost // Thêm isHost flag
                })))
            }
        }

        // Lấy username/displayname
        const token = localStorage.getItem('token')
        let displayname = null
        if (!token) {
            displayname = getOrCreateGuestUsername()
        } else {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                displayname = payload.username || payload.displayname || null
            } catch (err) {
                console.warn('Could not get username from token:', err)
            }
        }

        // Kiểm tra room trước khi join
        const checkRoomBeforeJoin = async (roomCode) => {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: Không thể kiểm tra trạng thái phòng'))
                }, 5000)

                const handleRoomInfo = (data) => {
                    clearTimeout(timeout)
                    socket.off('ROOM_INFO', handleRoomInfo)
                    socket.off('ERROR', handleError)

                    const room = data.room

                    // Kiểm tra các điều kiện
                    if (room.status !== 'WAITING') {
                        reject(new Error('Game has already started'))
                        return
                    }

                    if (room.currentPlayers >= room.maxPlayers) {
                        reject(new Error('Room is full'))
                        return
                    }

                    resolve(room)
                }

                const handleError = (errorData) => {
                    clearTimeout(timeout)
                    socket.off('ROOM_INFO', handleRoomInfo)
                    socket.off('ERROR', handleError)

                    if (errorData.message === 'Room not found') {
                        reject(new Error('Room not found'))
                    } else {
                        reject(new Error(errorData.message || 'Không thể kiểm tra phòng'))
                    }
                }

                socket.once('ROOM_INFO', handleRoomInfo)
                socket.once('ERROR', handleError)

                // Gửi request để lấy thông tin room
                console.log('📤 Emitting GET_ROOM_INFO with code:', roomCode)
                socket.emit('GET_ROOM_INFO', { code: roomCode })
            })
        }

        // Join room qua socket khi connected
        const handleConnect = async () => {
            console.log('✅ Room socket connected, checking room before joining...')
            console.log('🔍 RoomId:', roomId, 'Type:', /^\d{4}$/.test(roomId) ? 'CODE' : 'UUID')
            console.log('🔍 Displayname:', displayname || 'Anonymous Player')

            let roomCode = null

            // Xác định room code
            if (roomId && /^\d{4}$/.test(roomId)) {
                roomCode = roomId
            } else {
                const savedCode = localStorage.getItem(`room_uuid_${roomId}`)
                if (savedCode) {
                    roomCode = savedCode
                } else {
                    console.warn('⚠️ No room code found in localStorage for UUID:', roomId)
                    setError('Không tìm thấy mã phòng. Vui lòng tạo phòng mới hoặc join bằng mã phòng 4 chữ số.')
                    setLoading(false)
                    return
                }
            }

            // Lấy userId để gửi lên backend
            let userId = currentUserId
            if (!userId) {
                const token = localStorage.getItem('token')
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        userId = payload.userId || payload.id
                    } catch (err) {
                        userId = getOrCreateGuestUserId()
                    }
                } else {
                    userId = getOrCreateGuestUserId()
                }
            }

            try {
                // Kiểm tra room trước khi join
                console.log('🔍 Checking room status before joining:', roomCode)
                await checkRoomBeforeJoin(roomCode)
                console.log('✅ Room check passed, joining room...')

                // Nếu check thành công, join room
                socket.emit('JOIN_ROOM', {
                    code: roomCode,
                    displayname: displayname || 'Anonymous Player',
                    userId: userId
                })
            } catch (checkError) {
                console.error('❌ Room check failed:', checkError.message)
                setError(getErrorMessage(checkError.message))
                setLoading(false)

                // Navigate về game page nếu có lỗi nghiêm trọng
                if (checkError.message === 'Room not found' || checkError.message === 'Game has already started') {
                    setTimeout(() => {
                        navigate('/game')
                    }, 3000)
                }
            }
        }

        // Hàm chuyển đổi error message sang tiếng Việt
        const getErrorMessage = (errorMessage) => {
            const errorMap = {
                'Game has already started': 'Game đã bắt đầu. Không thể tham gia phòng này.',
                'Room is full': 'Phòng đã đầy. Vui lòng chọn phòng khác.',
                'Room not found': 'Không tìm thấy phòng. Mã phòng có thể không đúng hoặc phòng đã bị xóa.',
                'You are already in another room': 'Bạn đang ở phòng khác. Vui lòng rời phòng hiện tại trước.',
                'Timeout: Không thể kiểm tra trạng thái phòng': 'Không thể kết nối với server. Vui lòng thử lại.'
            }
            return errorMap[errorMessage] || errorMessage
        }

        // Handle ROOM_JOINED event
        const handleRoomJoined = (data) => {
            console.log('✅ Joined room via socket:', data)
            const room = data.room
            const player = data.player

            console.log('👤 Player info from ROOM_JOINED:', {
                playerId: player?.id,
                userId: player?.userId,
                displayname: player?.displayname,
                isHost: player?.isHost
            })

            // Lưu room ID để dùng khi leave
            if (room.id) {
                setCurrentRoomId(room.id)
                console.log(`💾 Saved currentRoomId: ${room.id}`)
            }

            // Lưu player ID của user hiện tại
            if (player?.id) {
                setCurrentPlayerId(player.id)
                // Lưu playerId vào localStorage để reuse khi reload
                if (room.id) {
                    localStorage.setItem(`room_${room.id}_playerId`, player.id)
                    console.log(`💾 Saved playerId to localStorage: ${player.id} for room ${room.id}`)
                }
                console.log(`💾 Saved currentPlayerId: ${player.id}`)
            }

            // Lưu displayname của user hiện tại
            if (player?.displayname) {
                setCurrentDisplayname(player.displayname)
                console.log(`💾 Saved currentDisplayname: ${player.displayname}`)
            }

            // Lưu code vào localStorage để dùng lại sau
            if (room.code && room.id) {
                localStorage.setItem(`room_uuid_${room.id}`, room.code)
                localStorage.setItem(`room_id_${room.code}`, room.id) // Lưu room ID theo code
                console.log(`💾 Saved room code to localStorage: ${room.code} for room ${room.id}`)
            }

            // Truyền playerId vào updateRoomState để check host ngay (vì setState là async)
            updateRoomState(room, player?.id)
        }

        // Handle PLAYER_JOINED event
        const handlePlayerJoined = (data) => {
            console.log('➕ Player joined:', data)
            updateRoomState(data.room)
        }

        // Handle PLAYER_LEFT event
        const handlePlayerLeft = (data) => {
            console.log('➖ Player left:', data)
            updateRoomState(data.room)
        }

        // Handle NEW_HOST event (khi host rời phòng và host mới được gán)
        const handleNewHost = (data) => {
            console.log('👑 New host assigned:', data)
            const { newHost, room } = data

            // Tìm currentPlayerId từ state, localStorage, hoặc room.players
            let myPlayerId = currentPlayerId
            if (!myPlayerId && room.id) {
                // Thử lấy từ localStorage
                myPlayerId = localStorage.getItem(`room_${room.id}_playerId`)
            }
            if (!myPlayerId && room.players) {
                // Tìm player hiện tại trong room dựa trên userId
                const currentPlayer = room.players.find(p => {
                    if (currentUserId) {
                        return p.userId && String(p.userId) === String(currentUserId)
                    }
                    return false
                })
                if (currentPlayer) {
                    myPlayerId = currentPlayer.id
                }
            }

            // Update room state với room data mới - truyền myPlayerId để update isHost
            updateRoomState(room, myPlayerId)

            // Đảm bảo isHost state được update đúng
            // Check lại một lần nữa để force update (vì setState là async và có thể bị override)
            if (newHost && myPlayerId) {
                let isNewHost = false
                if (newHost.userId !== null && newHost.userId !== undefined) {
                    // Authenticated user: check bằng userId
                    isNewHost = String(newHost.userId) === String(currentUserId)
                } else if (newHost.id) {
                    // Anonymous user: check bằng playerId
                    isNewHost = String(newHost.id) === String(myPlayerId)
                }

                console.log('👑 Checking if current user is new host:', {
                    newHost: newHost ? { id: newHost.id, userId: newHost.userId, displayname: newHost.displayname } : null,
                    currentUserId,
                    currentPlayerId: myPlayerId,
                    isNewHost
                })

                // Force update isHost state ngay lập tức
                // updateRoomState đã được gọi với myPlayerId, nhưng để đảm bảo, force update một lần nữa
                if (isNewHost) {
                    console.log('✅ Current user is the new host, updating isHost state to true')
                    setIsHost(true)
                } else {
                    console.log('ℹ️ Current user is not the new host, setting isHost to false')
                    setIsHost(false)
                }
            }
        }

        // Handle ROOM_INFO event
        const handleRoomInfo = (data) => {
            console.log('📋 Room info:', data)
            const room = data.room

            // Lưu code vào localStorage nếu chưa có
            if (room.code && room.id) {
                const existingCode = localStorage.getItem(`room_uuid_${room.id}`)
                if (!existingCode) {
                    localStorage.setItem(`room_uuid_${room.id}`, room.code)
                    console.log(`💾 Saved room code to localStorage: ${room.code} for room ${room.id}`)
                }
            }

            updateRoomState(room)
        }

        // Handle GAME_STARTED event
        const handleGameStarted = (data) => {
            console.log('🎮 Game started via socket:', data)
            setGameStarted(true)
            updateRoomState(data.room)
            setChronicleEvents([])
            setGameStartTime(Date.now())
            setGameEndTime(null)
            if (chronicleStorageKey) {
                sessionStorage.removeItem(chronicleStorageKey)
            }
            
            // Join game room on API Gateway socket for receiving game events
            const apiSocket = getSocket()
            const gameRoomId = data.room?.id || currentRoomId || roomId
            if (apiSocket && gameRoomId) {
                console.log(`🔗 Joining game room ${gameRoomId} on API Gateway socket`)
                apiSocket.emit('JOIN_GAME_ROOM', { roomId: gameRoomId })
            }
            
            // Transition to NIGHT phase with first step
            // This enables GM mode (isGMMode = isHost && gameStatus !== 'LOBBY')
            setGameState(prev => ({
                ...prev,
                phase: 'NIGHT',
                day: 1,
                currentStep: 'BODYGUARD'
            }))
            setLoading(false)
        }

        // Handle ERROR event
        const handleError = (error) => {
            console.error('❌ Room socket error:', error)
            console.error('❌ Error details:', JSON.stringify(error, null, 2))
            const errorMessage = error?.message || error?.error || 'Có lỗi xảy ra'

            // Ignore "You are already in a room" error if we're already in the room
            // This can happen on reconnect when socket tracking is inconsistent
            if (errorMessage === 'You are already in a room' && currentRoomId) {
                console.log('ℹ️ Ignoring "You are already in a room" error - user is already connected to room')
                return
            }

            setError(errorMessage)
            setLoading(false)
        }

        // Register event listeners
        socket.on('connect', handleConnect)
        socket.on('ROOM_JOINED', handleRoomJoined)
        socket.on('PLAYER_JOINED', handlePlayerJoined)
        socket.on('PLAYER_LEFT', handlePlayerLeft)
        socket.on('NEW_HOST', handleNewHost)
        socket.on('ROOM_INFO', handleRoomInfo)
        socket.on('GAME_STARTED', handleGameStarted)
        socket.on('ERROR', handleError)

        // Join room nếu đã connected
        if (socket.connected) {
            handleConnect()
        }

        return () => {
            isUnmounted = true
            socket.off('connect', handleConnect)
            socket.off('ROOM_JOINED', handleRoomJoined)
            socket.off('PLAYER_JOINED', handlePlayerJoined)
            socket.off('PLAYER_LEFT', handlePlayerLeft)
            socket.off('NEW_HOST', handleNewHost)
            socket.off('ROOM_INFO', handleRoomInfo)
            socket.off('GAME_STARTED', handleGameStarted)
            socket.off('ERROR', handleError)
        }
    }, [roomId, currentUserId])

    // Check API Gateway socket connection (cho game events)
    useEffect(() => {
        const socket = getSocket()
        setSocketConnected(socket.connected)

        const onConnect = () => {
            console.log('✅ API Gateway socket connected')
            setSocketConnected(true)
        }

        const onDisconnect = () => {
            console.log('❌ API Gateway socket disconnected')
            setSocketConnected(false)
        }

        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
        }
    }, [])


    // Listen for role assignment và game events
    useEffect(() => {
        // Listen từ API Gateway socket (gameApi)
        const unsubscribeRole = gameApi.onRoleAssigned((data) => {
            console.log('🎭 Nhận vai trò từ API Gateway:', data)
            console.log(`   Current userId: ${currentUserId}, Role userId: ${data.userId}`)

            // Get current user's displayname từ state hoặc localStorage
            const userDisplayname = currentDisplayname || localStorage.getItem('guestUsername') || null

            // Match logic:
            // 1. Nếu có userId (authenticated): match bằng userId
            // 2. Nếu không có userId (anonymous): match bằng username/displayname
            let shouldAccept = false

            if (data.userId) {
                // Authenticated user: match bằng userId
                shouldAccept = String(currentUserId) === String(data.userId)
            } else {
                // Anonymous user: match bằng username/displayname
                shouldAccept = userDisplayname && data.username &&
                    String(userDisplayname) === String(data.username)
            }

            if (shouldAccept) {
                console.log('✅ Setting role:', data.role)
                setMyRole(data)
                gameApi.updateFaction(roomId, data.faction)
            } else {
                console.warn(`⚠️ Role assignment mismatch: userId=${data.userId}, username=${data.username}, userDisplayname=${userDisplayname}`)
            }
        })

        // Also listen directly from socket (fallback)
        const apiSocket = getSocket()
        const directHandler = (data) => {
            console.log('🎭 Nhận vai trò trực tiếp từ socket:', data)
            const roleData = data.payload || data

            // Get current user's displayname từ state hoặc localStorage
            const userDisplayname = currentDisplayname || localStorage.getItem('guestUsername') || null

            // Match logic: tương tự như handleRoomRoleAssigned
            let shouldAccept = false

            if (roleData.userId) {
                // Authenticated user: match bằng userId
                shouldAccept = String(currentUserId) === String(roleData.userId)
            } else {
                // Anonymous user: match bằng username/displayname
                shouldAccept = userDisplayname && roleData.username &&
                    String(userDisplayname) === String(roleData.username)
            }

            if (shouldAccept) {
                console.log('✅ Setting role from direct socket:', roleData.role)
                setMyRole({
                    role: roleData.role,
                    roleName: roleData.roleName,
                    faction: roleData.faction,
                    userId: roleData.userId,
                    username: roleData.username
                })
                gameApi.updateFaction(roomId, roleData.faction)
            }
        }
        if (apiSocket) {
            apiSocket.on('GAME_ROLE_ASSIGNED', directHandler)
        }

        // Listen từ Room socket (roomSocket) - fallback cho players join sau
        const handleRoomRoleAssigned = (data) => {
            console.log('🎭 Nhận vai trò từ Room socket:', data)
            const roleData = {
                role: data.payload.role,
                roleName: data.payload.roleName,
                faction: data.payload.faction,
                userId: data.payload.userId,
                username: data.payload.username
            }

            // Get current user's displayname từ state hoặc localStorage
            const userDisplayname = currentDisplayname || localStorage.getItem('guestUsername') || null

            console.log(`   Current userId: ${currentUserId}, Role userId: ${roleData.userId}`)
            console.log(`   Current displayname: ${userDisplayname}, Role username: ${roleData.username}`)

            // Match logic:
            // 1. Nếu có userId (authenticated): match bằng userId
            // 2. Nếu không có userId (anonymous): match bằng username/displayname
            let shouldAccept = false

            if (roleData.userId) {
                // Authenticated user: match bằng userId
                shouldAccept = String(currentUserId) === String(roleData.userId)
            } else {
                // Anonymous user: match bằng username/displayname
                shouldAccept = userDisplayname && roleData.username &&
                    String(userDisplayname) === String(roleData.username)
            }

            if (shouldAccept) {
                console.log('✅ Role matches current user, setting role:', roleData.role)
                setMyRole(roleData)
                // Update faction nếu có API Gateway socket
                const apiSocket = getSocket()
                if (apiSocket && apiSocket.connected) {
                    gameApi.updateFaction(roomId, roleData.faction)
                }
            } else {
                console.log(`ℹ️ Role assignment for different user (userId: ${roleData.userId}, username: ${roleData.username}), ignoring`)
            }
        }

        if (roomSocket) {
            roomSocket.on('GAME_ROLE_ASSIGNED', handleRoomRoleAssigned)
        }

        const unsubscribeStarted = gameApi.onGameStarted((data) => {
            console.log('🎮 Game đã bắt đầu!', data)
            setGameStarted(true)
            // Transition to NIGHT phase - service will send NIGHT_PHASE_STARTED
            // with the first step. For now, set initial state.
            setGameState(prev => ({
                ...prev,
                phase: 'NIGHT',
                day: 1,
                currentStep: 'BODYGUARD'
            }))
            setLoading(false)
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
            if (roomSocket) {
                roomSocket.off('GAME_ROLE_ASSIGNED', handleRoomRoleAssigned)
            }
            if (apiSocket) {
                apiSocket.off('GAME_ROLE_ASSIGNED', directHandler)
            }
        }
    }, [roomId, roomSocket, currentUserId, currentDisplayname])

    const handleStartGame = () => {
        if (players.length < 3) {
            setError('Cần ít nhất 3 người chơi để bắt đầu game')
            return
        }

        if (players.length > 75) {
            setError('Tối đa 75 người chơi trong một ván')
            return
        }

        if (!roomSocket || !roomSocket.connected) {
            setError('Chưa kết nối với server. Vui lòng đợi...')
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

        if (!roomSocket || !roomSocket.connected) {
            setError('Chưa kết nối với server. Vui lòng đợi...')
            setLoading(false)
            return
        }

        // Send START_GAME to service - DO NOT set local game state
        // The service will respond with GAME_STARTED and initial state
        roomSocket.emit('START_GAME', {
            roleSetup: setup
        })
    }

    const handleLeaveRoom = async () => {
        if (!roomId || !currentUserId) {
            navigate('/game')
            return
        }

        if (!roomSocket || !roomSocket.connected) {
            // Nếu socket chưa kết nối, vẫn navigate về /game
            navigate('/game')
            return
        }

        try {
            setLoading(true)

            // Listen for ROOM_LEFT event
            const handleRoomLeft = () => {
                console.log('✅ Left room successfully')
                // Dọn localStorage
                const roomIdToClean = currentRoomId || roomId
                localStorage.removeItem(`room_${roomIdToClean}_host`)
                localStorage.removeItem(`room_${roomIdToClean}_creator_userId`)
                localStorage.removeItem(`room_${roomIdToClean}_playerId`)
                navigate('/game')
            }

            roomSocket.once('ROOM_LEFT', handleRoomLeft)

            // Gửi LEAVE_ROOM event với roomId (fallback nếu socket.data.currentRoomId bị mất)
            // Ưu tiên: currentRoomId (từ ROOM_JOINED) > roomId từ URL > roomCode
            let roomIdToLeave = currentRoomId

            // Nếu không có currentRoomId, thử lấy từ localStorage hoặc URL
            if (!roomIdToLeave) {
                // Thử lấy từ localStorage theo code
                if (roomCode) {
                    roomIdToLeave = localStorage.getItem(`room_id_${roomCode}`)
                }
                // Nếu vẫn không có, dùng roomId từ URL (có thể là UUID)
                if (!roomIdToLeave && roomId && !/^\d{4}$/.test(roomId)) {
                    roomIdToLeave = roomId
                }
            }

            console.log('📤 Emitting LEAVE_ROOM', {
                currentRoomId,
                roomIdFromURL: roomId,
                roomCode,
                roomIdToLeave
            })
            roomSocket.emit('LEAVE_ROOM', roomIdToLeave ? { roomId: roomIdToLeave } : {})

            // Timeout sau 3 giây nếu không nhận được response
            setTimeout(() => {
                roomSocket.off('ROOM_LEFT', handleRoomLeft)
                if (loading) {
                    console.warn('⚠️ Leave room timeout, navigating anyway')
                    const roomIdToClean = currentRoomId || roomId
                    localStorage.removeItem(`room_${roomIdToClean}_host`)
                    localStorage.removeItem(`room_${roomIdToClean}_creator_userId`)
                    localStorage.removeItem(`room_${roomIdToClean}_playerId`)
                    navigate('/game')
                    setLoading(false)
                }
            }, 3000)
        } catch (err) {
            console.error('❌ Rời phòng thất bại:', err)
            setError('Không thể rời phòng, thử lại sau.')
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
        // Quản trò là player có isHost = true (dùng trực tiếp từ player object)
        // Nếu player object có isHost flag, dùng nó (đơn giản và chính xác nhất)
        if (player.isHost !== undefined) {
            return player.isHost === true
        }

        // Fallback: check bằng userId hoặc playerId nếu không có isHost flag
        if (hostId) {
            // Authenticated user: check bằng userId
            return String(player.userId) === String(hostId)
        } else if (hostPlayerId && player.id) {
            // Anonymous user: check bằng playerId
            return String(player.id) === String(hostPlayerId)
        }
        return false
    }

    // Check if GM mode is active (host + game not in lobby)
    const isGMMode = isHost && gameStatus !== 'LOBBY'

    const getPlayerKey = (player) => player?.userId || player?.id


    // Handle GM player selection
    const handlePlayerSelect = (player) => {
        if (!isGMMode) return
        const playerId = getPlayerKey(player)
        setSelectedPlayerId(prev => prev === playerId ? null : playerId)
    }

    // Get player night status for GM view
    const getPlayerNightStatus = (player) => {
        const playerId = getPlayerKey(player)
        return {}
    }

    const getNightStepRoleStatus = (step) => {
        if (!step) return null
        const stepRoleMap = {
            BODYGUARD: ['BODYGUARD'],
            SEER: ['SEER'],
            WITCH: ['WITCH'],
            WEREWOLF: ['YOUNG_WOLF', 'ALPHA_WOLF', 'DARK_WOLF', 'PROPHET_WOLF', 'TRAITOR']
        }
        const roles = stepRoleMap[step]
        if (!roles || !roleAssignment) return null

        const rolePlayers = roleAssignment
            .filter(a => roles.includes(a.role))
            .map(a => ({ userId: a.player?.userId || a.userId, username: a.player?.username || a.username }))

        if (rolePlayers.length === 0) return null

        const aliveRolePlayers = rolePlayers.filter(p => !deadPlayers.includes(p.userId))
        return {
            active: aliveRolePlayers.length > 0,
            names: rolePlayers.map(p => p.username).filter(Boolean)
        }
    }

    // Night step ritual content for the wizard panel
    const nightStepContent = {
        BODYGUARD: {
            title: 'Nghi Thức Bảo Vệ',
            icon: 'shield',
            description: 'Gọi Bảo Vệ dậy. Họ muốn bảo vệ ai?',
            instruction: 'Chọn một người chơi còn sống để bảo vệ'
        },
        WEREWOLF: {
            title: 'Tiếng Gọi Của Bầy',
            icon: 'fang',
            description: 'Gọi Ma Sói dậy. Họ muốn cắn ai?',
            instruction: 'Chọn một người chơi còn sống làm nạn nhân'
        },
        SEER: {
            title: 'Thị Kiến Huyền Bí',
            icon: 'eye',
            description: 'Gọi Tiên Tri dậy. Họ muốn soi ai?',
            instruction: 'Chọn một người chơi còn sống để xem phe'
        },
        WITCH: {
            title: 'Phép Thuật Cổ Xưa',
            icon: 'potion',
            description: 'Gọi Phù Thủy dậy. Họ muốn dùng thuốc gì?',
            instruction: 'Chọn hành động của Phù Thủy'
        },
        NIGHT_END: {
            title: 'Đêm Kết Thúc',
            icon: 'moon',
            description: 'Tất cả nghi thức đêm đã hoàn tất.',
            instruction: 'Nhấn xác nhận để kết thúc đêm'
        }
    }

    // ============================================
    // Service Command Handlers
    // All game logic is delegated to the game service.
    // Frontend only sends commands and renders responses.
    // ============================================

    // Send GM command to game service via API Gateway socket
    const sendGMCommand = (actionType, payload = {}) => {
        const apiSocket = getSocket()
        if (!apiSocket || !apiSocket.connected) {
            setError('Chưa kết nối với server')
            return false
        }

        const commandPayload = {
            ...payload,
            roomId: currentRoomId || roomId
        }

        console.log(`📤 Sending GM command via API Gateway: ${actionType}`, commandPayload)
        apiSocket.emit(actionType, commandPayload)
        return true
    }

    // Advance to next night step (called after service confirms or as fallback)
    const advanceNightStep = (fromStep) => {
        const stepOrder = ['BODYGUARD', 'WEREWOLF', 'SEER', 'WITCH', null]
        const currentIndex = stepOrder.indexOf(fromStep)
        const nextStep = currentIndex >= 0 ? stepOrder[currentIndex + 1] : null
        
        console.log(`➡️ Advancing from ${fromStep} to ${nextStep}`)
        setGameState(prev => ({
            ...prev,
            currentStep: nextStep
        }))
        
        // Reset witch action when entering witch step
        if (nextStep === 'WITCH') {
            setWitchAction(null)
        }
    }

    // Handle night wizard confirmation - sends command to service
    const handleNightStepConfirm = () => {
        console.log('🌙 Night step confirmed:', currentNightStep, 'Selected player:', selectedPlayerId)

        if (currentNightStep === 'BODYGUARD') {
            // Send bodyguard protect command to service
            sendGMCommand('GM_BODYGUARD_PROTECT', { targetUserId: selectedPlayerId })
            if (selectedPlayerId) {
                const targetPlayer = players.find(p => (p.userId || p.id) === selectedPlayerId)
                addChronicleEntries([{
                    phase: 'NIGHT',
                    day: gameStateRef.current.day || 1,
                    type: 'guard',
                    text: `Bảo vệ đã bảo vệ ${getPlayerName(targetPlayer)}.`
                }])
            }
            setSelectedPlayerId(null)
            // Advance to next step (service will confirm or we use this as fallback)
            advanceNightStep('BODYGUARD')
        } else if (currentNightStep === 'WEREWOLF') {
            // Send werewolf kill command to service
            sendGMCommand('GM_WEREWOLF_KILL', { targetUserId: selectedPlayerId })
            // Store bitten player for Witch step display
            const bittenPlayerData = players.find(p => (p.userId || p.id) === selectedPlayerId)
            if (bittenPlayerData) {
                setBittenPlayer({ playerId: selectedPlayerId, playerName: bittenPlayerData.username })
            }
            if (selectedPlayerId) {
                addChronicleEntries([{
                    phase: 'NIGHT',
                    day: gameStateRef.current.day || 1,
                    type: 'wolf',
                    text: `Ma sói chọn cắn ${getPlayerName(bittenPlayerData)}.`
                }])
            }
            setSelectedPlayerId(null)
            // Advance to next step
            advanceNightStep('WEREWOLF')
        } else if (currentNightStep === 'SEER') {
            // Send seer check command to service
            sendGMCommand('GM_SEER_CHECK', { targetUserId: selectedPlayerId })
            if (selectedPlayerId) {
                const targetPlayer = players.find(p => (p.userId || p.id) === selectedPlayerId)
                addChronicleEntries([{
                    phase: 'NIGHT',
                    day: gameStateRef.current.day || 1,
                    type: 'seer',
                    text: `Tiên tri soi ${getPlayerName(targetPlayer)}.`
                }])
            }
            setSelectedPlayerId(null)
            // Don't advance yet - wait for GM to dismiss seer result
        } else if (currentNightStep === 'WITCH') {
            // Send witch action command to service
            const payload = {}
            if (witchAction === 'HEAL') {
                payload.save = true
                // Update witch skills locally and track that witch healed this night
                setGameState(prev => ({
                    ...prev,
                    witchSkills: { ...prev.witchSkills, saveUsed: true }
                }))
                setWitchHealedThisNight(true)
                const targetName = bittenPlayer?.playerName || 'nạn nhân bị cắn'
                addChronicleEntries([{
                    phase: 'NIGHT',
                    day: gameStateRef.current.day || 1,
                    type: 'witch',
                    text: `Phù thủy đã cứu ${targetName}.`
                }])
            } else if (witchAction === 'POISON' && selectedPlayerId) {
                payload.poisonTargetUserId = selectedPlayerId
                // Update witch skills locally
                setGameState(prev => ({
                    ...prev,
                    witchSkills: { ...prev.witchSkills, poisonUsed: true }
                }))
                const targetPlayer = players.find(p => (p.userId || p.id) === selectedPlayerId)
                addChronicleEntries([{
                    phase: 'NIGHT',
                    day: gameStateRef.current.day || 1,
                    type: 'witch',
                    text: `Phù thủy đã đầu độc ${getPlayerName(targetPlayer)}.`
                }])
            } else if (witchAction === 'NOTHING') {
                addChronicleEntries([{
                    phase: 'NIGHT',
                    day: gameStateRef.current.day || 1,
                    type: 'witch',
                    text: 'Phù thủy đã bỏ qua đêm nay.'
                }])
            }
            // 'NOTHING' sends empty payload
            
            sendGMCommand('GM_WITCH_ACTION', payload)
            setWitchAction(null)
            setSelectedPlayerId(null)
            // Advance to night end (null step shows Night Complete Panel)
            advanceNightStep('WITCH')
        }
    }

    // Handle dismissing seer result and advancing to Witch step
    const handleSeerResultDismiss = () => {
        setSeerResult(null)
        // Advance to Witch step
        advanceNightStep('SEER')
    }

    // Handle transition from NIGHT to DAY - ask service to resolve deaths
    const handleTransitionToDay = () => {
        console.log('☀️ Requesting transition to DAY phase...')
        // Send command to service - it will resolve deaths and send GM_NIGHT_RESULT
        sendGMCommand('GM_END_NIGHT', {})
        
        // Service will respond with GM_NIGHT_RESULT event containing actual deaths
        // The event listener will update nightResult state
        // For now, just show loading state or wait for service response
        console.log('⏳ Waiting for GM_NIGHT_RESULT from service...')
    }

    // Handle dismissing narrative and starting day
    const handleDismissNarrative = () => {
        // First announce deaths to all players
        if (nightResult?.deaths?.length > 0) {
            sendGMCommand('GM_ANNOUNCE_DEATHS', { deaths: nightResult.deaths })
        }
        
        setNarrative(null)
        setBittenPlayer(null)
        setWitchHealedThisNight(false) // Reset for next night
        setNightResult(null)
        
        // Transition to DAY phase
        setGameState(prev => ({
            ...prev,
            phase: 'DAY',
            currentStep: null
        }))
        // Send command to service
        sendGMCommand('GM_START_DAY', { duration: 120 })
    }

    // Handle starting a new night (after day phase ends)
    const handleStartNight = () => {
        console.log('🌙 Starting new night...')
        // Send command to service
        sendGMCommand('GM_START_NIGHT', {})
        
        // Transition to NIGHT phase with first step
        setGameState(prev => ({
            ...prev,
            phase: 'NIGHT',
            day: prev.day + 1,
            currentStep: 'BODYGUARD'
        }))
        
        // Reset night-related state
        setBittenPlayer(null)
        setWitchHealedThisNight(false)
        setNightResult(null)
        setSelectedPlayerId(null)
    }

    // Check if a player is dead (from service state)
    const isPlayerDead = (player) => {
        const playerId = getPlayerKey(player)
        return deadPlayers.includes(playerId)
    }

    // Handle execution initiation (GM selects player to execute)
    const handleInitiateExecution = () => {
        if (!selectedPlayerId || !isHost || gameStatus !== 'DAY') return

        const player = players.find(p => (p.userId || p.id) === selectedPlayerId)
        if (!player || isPlayerDead(player)) return

        // Just show confirmation modal - don't check role locally
        // Service will tell us if Hunter can shoot after execution
        setExecutionPending({
            playerId: selectedPlayerId,
            playerName: player.username
        })
    }

    // Handle execution confirmation - send to service and update locally
    const handleConfirmExecution = () => {
        if (!executionPending || !isHost || gameStatus !== 'DAY') return

        const { playerId } = executionPending

        // Send vote end command to service
        sendGMCommand('GM_END_VOTE', { 
            forcedExecution: true,
            targetUserId: playerId 
        })

        setExecutionPending(null)
        setSelectedPlayerId(null)
    }

    // Handle canceling execution
    const handleCancelExecution = () => {
        setExecutionPending(null)
    }

    // Handle Hunter's revenge target selection - send to service and update locally
    const handleHunterRevengeConfirm = () => {
        if (!hunterCanShoot || !selectedPlayerId) return

        const targetPlayer = players.find(p => (p.userId || p.id) === selectedPlayerId)
        if (!targetPlayer) return

        // Send hunter shoot command to service
        sendGMCommand('GM_HUNTER_SHOOT', {
            hunterId: hunterCanShoot.hunterId,
            targetUserId: selectedPlayerId
        })

        // Update locally - mark target as dead
        setGameState(prev => ({
            ...prev,
            deadPlayers: [...prev.deadPlayers, { 
                userId: selectedPlayerId, 
                username: targetPlayer.username, 
                cause: 'bị Thợ Săn bắn' 
            }]
        }))

        // Check if shot player is also a Hunter (chain reaction)
        const targetRole = roleAssignment?.find(a => 
            a.player?.userId === selectedPlayerId || 
            a.player?.id === selectedPlayerId ||
            a.userId === selectedPlayerId
        )
        const isTargetHunter = targetRole?.role === 'MONSTER_HUNTER'
        
        if (isTargetHunter) {
            // Chain Hunter shot
            setHunterCanShoot({
                hunterId: selectedPlayerId,
                hunterName: targetPlayer.username
            })
        } else {
            setHunterCanShoot(null)
        }
        
        setSelectedPlayerId(null)
    }

    // Handle skipping Hunter's revenge
    const handleHunterRevengeSkip = () => {
        console.log(`🏹 Hunter ${hunterCanShoot?.hunterName} chose not to shoot`)
        setHunterCanShoot(null)
        setSelectedPlayerId(null)
    }

    // ============================================
    // Game Service Event Listeners (via API Gateway)
    // ============================================
    useEffect(() => {
        const apiSocket = getSocket()
        if (!apiSocket) return

        // Join room on API Gateway socket to receive broadcasts
        // Ưu tiên currentRoomId (UUID) vì đây là ID thực sự của room
        const roomIdToJoin = currentRoomId
        if (roomIdToJoin) {
            console.log(`🔗 Joining room ${roomIdToJoin} on API Gateway socket for game events`)
            apiSocket.emit('JOIN_GAME_ROOM', { roomId: roomIdToJoin })
        } else {
            console.log('⏳ Waiting for currentRoomId to join API Gateway room...')
        }

        // Night phase started
        const handleNightPhaseStarted = (data) => {
            console.log('🌙 Night phase started:', data)
            setGameState(prev => ({
                ...prev,
                phase: 'NIGHT',
                day: data.payload?.day || prev.day,
                currentStep: 'BODYGUARD' // First step
            }))
            const nightDay = data.payload?.day || gameStateRef.current.day || 1
            addChronicleEntries([
                {
                    phase: 'NIGHT',
                    day: nightDay,
                    type: 'phase',
                    text: `Đêm thứ ${nightDay} bắt đầu.`
                }
            ])
            setBittenPlayer(null)
            setNightResult(null)
            setWitchHealedThisNight(false) // Reset witch heal tracking for new night
        }

        // GM receives seer result
        const handleGMSeerResult = (data) => {
            console.log('🔮 Seer result received:', data)
            if (data.payload?.checkedPlayer && data.payload?.result) {
                const resultName = FACTION_NAMES[data.payload.result] || data.payload.result
                addChronicleEntries([{
                    phase: 'NIGHT',
                    day: gameStateRef.current.day || 1,
                    type: 'seer',
                    text: `Tiên tri thấy ${data.payload.checkedPlayer} thuộc phe ${resultName}.`
                }])
            }
            setSeerResult({
                playerName: data.payload?.checkedPlayer,
                result: data.payload?.result, // 'WEREWOLF' or 'VILLAGER'
                faction: data.payload?.result === 'WEREWOLF' ? 'EVIL' : 'GOOD'
            })
            // Advance to next step
            setGameState(prev => ({ ...prev, currentStep: 'WITCH' }))
        }

        // GM receives night result (after GM_END_NIGHT)
        const handleGMNightResult = (data) => {
            console.log('🌙 Night result received:', data)
            const deaths = data.payload?.deaths || []
            const saved = data.payload?.saved || []
            
            setNightResult({
                deaths,
                saved,
                protected: data.payload?.protected || [],
                message: data.payload?.message
            })
            
            // Generate narrative for GM to read aloud
            let narrativeMessage = ''
            if (deaths.length === 0) {
                narrativeMessage = 'Đêm qua, không ai chết. Làng vẫn bình yên.'
            } else {
                const names = deaths.map(d => d.username).join(' và ')
                narrativeMessage = `Đêm qua, ${names} đã chết. Làng mất đi ${deaths.length} linh hồn.`
            }
            
            setNarrative({
                deaths,
                message: narrativeMessage
            })

            const nightDay = data.payload?.day || gameStateRef.current.day || 1
            const chronicleEntries = []
            if (data.payload?.message) {
                chronicleEntries.push({
                    phase: 'NIGHT',
                    day: nightDay,
                    type: 'story',
                    text: data.payload.message
                })
            }
            if (deaths.length > 0) {
                chronicleEntries.push({
                    phase: 'NIGHT',
                    day: nightDay,
                    type: 'death',
                    text: `Đêm đó, ${deaths.map(getPlayerName).join(', ')} đã chết.`
                })
            }
            if (saved.length > 0) {
                chronicleEntries.push({
                    phase: 'NIGHT',
                    day: nightDay,
                    type: 'save',
                    text: `Phù thủy đã cứu ${saved.map(getPlayerName).join(', ')}.`
                })
            }
            if (data.payload?.protected?.length > 0) {
                chronicleEntries.push({
                    phase: 'NIGHT',
                    day: nightDay,
                    type: 'protect',
                    text: `Bảo vệ đã che chở ${data.payload.protected.map(getPlayerName).join(', ')}.`
                })
            }
            if (chronicleEntries.length === 0) {
                chronicleEntries.push({
                    phase: 'NIGHT',
                    day: nightDay,
                    type: 'story',
                    text: 'Đêm qua không ai chết.'
                })
            }
            addChronicleEntries(chronicleEntries)
            
            // Night steps complete, show transition panel
            setGameState(prev => ({ ...prev, currentStep: null }))
        }

        // Players died announcement
        const handlePlayersDied = (data) => {
            console.log('💀 Players died:', data)
            const deaths = data.payload?.deaths || []
            setGameState(prev => ({
                ...prev,
                deadPlayers: [...prev.deadPlayers, ...deaths]
            }))
        }

        // Day phase started
        const handleDayPhaseStarted = (data) => {
            console.log('☀️ Day phase started:', data)
            setGameState(prev => ({
                ...prev,
                phase: 'DAY',
                day: data.payload?.day || prev.day,
                currentStep: null
            }))
            const dayNumber = data.payload?.day || gameStateRef.current.day || 1
            addChronicleEntries([
                {
                    phase: 'DAY',
                    day: dayNumber,
                    type: 'phase',
                    text: `Ngày thứ ${dayNumber} bắt đầu.`
                }
            ])
        }

        // Vote result
        const handleVoteResult = (data) => {
            console.log('🗳️ Vote result:', data)
            setVoteResult({
                hangedPlayer: data.payload?.hangedPlayer,
                voteResults: data.payload?.voteResults,
                message: data.payload?.message
            })
            const dayNumber = data.payload?.day || gameStateRef.current.day || 1
            const hangedPlayer = data.payload?.hangedPlayer
            const rawMessage = data.payload?.message
            const sanitizedMessage = rawMessage
                ? rawMessage
                    .replace(/undefined/gi, '')
                    .replace(/phiếu/gi, '')
                    .replace(/\bvới\b/gi, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim()
                : ''
            const message = sanitizedMessage || (
                hangedPlayer
                    ? `Dân làng quyết định treo cổ ${getPlayerName(hangedPlayer)}.`
                    : 'Không ai bị treo cổ.'
            )
            addChronicleEntries([
                {
                    phase: 'DAY',
                    day: dayNumber,
                    type: 'vote',
                    text: message
                }
            ])
        }

        // Hunter can shoot
        const handleHunterCanShoot = (data) => {
            console.log('🏹 Hunter can shoot:', data)
            setHunterCanShoot({
                hunterId: data.payload?.hunterId,
                hunterName: data.payload?.hunterName
            })
        }

        // Hunter shot result
        const handleHunterShot = (data) => {
            console.log('🔫 Hunter shot:', data)
            const deaths = data.payload?.deaths || []
            setGameState(prev => ({
                ...prev,
                deadPlayers: [...prev.deadPlayers, ...deaths]
            }))
            if (deaths.length > 0) {
                const phase = gameStateRef.current.phase === 'NIGHT' ? 'NIGHT' : 'DAY'
                const dayNumber = gameStateRef.current.day || 1
                addChronicleEntries([
                    {
                        phase,
                        day: dayNumber,
                        type: 'hunter',
                        text: `Thợ săn trả thù, bắn hạ ${deaths.map(getPlayerName).join(', ')}.`
                    }
                ])
            }
            // Check for chain hunter
            if (data.payload?.chainHunter) {
                setHunterCanShoot({
                    hunterId: data.payload.chainHunter.userId,
                    hunterName: data.payload.chainHunter.username
                })
            }
        }

        // Game over
        const handleGameOver = (data) => {
            console.log('🏁 Game over:', data)
            setGameState(prev => ({ ...prev, phase: 'ENDED' }))
            const endTime = Date.now()
            setGameEndTime(endTime)
            addChronicleEntries([
                {
                    phase: 'END',
                    day: gameStateRef.current.day || 1,
                    type: 'end',
                    text: data.payload?.message || 'Trận đấu đã kết thúc.'
                }
            ])
            setGameOver({
                winner: data.payload?.winner,
                message: data.payload?.message,
                allPlayers: data.payload?.allPlayers
            })
        }

        // Step progression from service
        const handleStepProgression = (data) => {
            console.log('➡️ Step progression:', data)
            setGameState(prev => ({
                ...prev,
                currentStep: data.payload?.nextStep
            }))
        }

        // Witch skills update
        const handleWitchSkillsUpdate = (data) => {
            console.log('🧙 Witch skills update:', data)
            setGameState(prev => ({
                ...prev,
                witchSkills: data.payload?.witchSkills || prev.witchSkills
            }))
        }

        // Lovers selected notification
        const handleLoversSelected = (data) => {
            console.log('💘 Lovers selected:', data)
            // Could show notification to the lovers
        }

        // Vote recorded
        const handleVoteRecorded = (data) => {
            console.log('🗳️ Vote recorded:', data)
            // Could update vote count display
        }

        // GM Error handler
        const handleGMError = (data) => {
            console.error('❌ GM Error:', data)
            setError(data.payload?.message || 'Có lỗi xảy ra')
        }

        // Register listeners on API Gateway socket
        apiSocket.on('NIGHT_PHASE_STARTED', handleNightPhaseStarted)
        apiSocket.on('GM_SEER_RESULT', handleGMSeerResult)
        apiSocket.on('GM_NIGHT_RESULT', handleGMNightResult)
        apiSocket.on('PLAYERS_DIED', handlePlayersDied)
        apiSocket.on('DAY_PHASE_STARTED', handleDayPhaseStarted)
        apiSocket.on('VOTE_RESULT', handleVoteResult)
        apiSocket.on('HUNTER_CAN_SHOOT', handleHunterCanShoot)
        apiSocket.on('HUNTER_SHOT', handleHunterShot)
        apiSocket.on('GAME_OVER', handleGameOver)
        apiSocket.on('STEP_PROGRESSION', handleStepProgression)
        apiSocket.on('WITCH_SKILLS_UPDATE', handleWitchSkillsUpdate)
        apiSocket.on('LOVERS_SELECTED', handleLoversSelected)
        apiSocket.on('VOTE_RECORDED', handleVoteRecorded)
        apiSocket.on('GM_ERROR', handleGMError)

        return () => {
            apiSocket.off('NIGHT_PHASE_STARTED', handleNightPhaseStarted)
            apiSocket.off('GM_SEER_RESULT', handleGMSeerResult)
            apiSocket.off('GM_NIGHT_RESULT', handleGMNightResult)
            apiSocket.off('PLAYERS_DIED', handlePlayersDied)
            apiSocket.off('DAY_PHASE_STARTED', handleDayPhaseStarted)
            apiSocket.off('VOTE_RESULT', handleVoteResult)
            apiSocket.off('HUNTER_CAN_SHOOT', handleHunterCanShoot)
            apiSocket.off('HUNTER_SHOT', handleHunterShot)
            apiSocket.off('GAME_OVER', handleGameOver)
            apiSocket.off('STEP_PROGRESSION', handleStepProgression)
            apiSocket.off('WITCH_SKILLS_UPDATE', handleWitchSkillsUpdate)
            apiSocket.off('LOVERS_SELECTED', handleLoversSelected)
            apiSocket.off('VOTE_RECORDED', handleVoteRecorded)
            apiSocket.off('GM_ERROR', handleGMError)
        }
    }, [currentRoomId])

    return (
        <div className="min-h-screen bg-[#050508] text-[#d4c4a8] overflow-hidden selection:bg-[#8b0000] selection:text-white">
            <div className="fixed inset-0 vignette z-50 pointer-events-none"></div>
            <div className="relative flex h-screen w-full flex-col overflow-hidden" style={{
                background: 'linear-gradient(180deg, #050508 0%, #0a0808 50%, #050508 100%)'
            }}>
                {/* Header - Ancient hall entrance */}
                <header className="flex items-center justify-between border-b border-[#8b7355]/30 px-8 py-5 bg-[#050508]/98 backdrop-blur-md z-40 shadow-2xl">
                    <div className="flex items-center gap-5">
                        <div className="relative flex items-center justify-center size-12 rounded-full bg-[#0a0808] border-2 border-[#8b7355]/40 shadow-[0_0_20px_rgba(139,0,0,0.2)] group cursor-pointer transition-all duration-700 hover:border-[#8b0000]/60">
                            <RuneSkull className="w-7 h-7 text-[#8b0000]/80 group-hover:text-[#8b0000] transition-colors duration-500" />
                            <div className="absolute inset-0 rounded-full bg-[#8b0000]/5 animate-pulse"></div>
                        </div>
                        <div>
                            <h2 className="font-heading text-2xl font-bold tracking-widest text-[#d4c4a8]/90 drop-shadow-md">Ma Sói</h2>
                            <p className="text-xs text-[#8b0000]/70 font-serif italic tracking-wider uppercase">Làng Bị Nguyền Rủa</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleLeaveRoom}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer border border-[#8b7355]/30 bg-[#0a0808]/80 text-[#8b7355] hover:bg-[#1a0f0f] hover:border-[#8b0000]/50 hover:text-[#d4c4a8] transition-all duration-500"
                        >
                            <RuneArrowLeft className="w-5 h-5" />
                            <span className="font-fantasy text-sm tracking-wider">Quay lại</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col lg:flex-row h-full max-w-[1920px] mx-auto w-full">
                        {/* Left Section - Players Grid - Cursed gathering hall */}
                        <section className="flex flex-col flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar relative z-10">
                            <div className="flex flex-col gap-4 mb-10">
                                <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#8b7355]/20 pb-6">
                                    <div>
                                        <h1 className="font-heading text-4xl lg:text-6xl text-[#d4c4a8] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                            Phòng {roomCode || roomId || 'Không xác định'}
                                        </h1>
                                        <p className="text-[#c9a227]/70 text-lg font-serif italic flex items-center gap-2 mt-2">
                                            <RuneForest className="w-5 h-5 text-[#8b7355]" />
                                            Rừng Tối
                                            <span className="mx-2 text-[#8b7355]/50 text-xs">◆</span>
                                            <span className="text-[#d4c4a8] font-bold">{players.length}/{maxPlayers || 75}</span> Linh Hồn Hiện Diện
                                        </p>
                                    </div>
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => setShareOpen((prev) => !prev)}
                                    >
                                        <div className="absolute inset-0 bg-[#8b0000]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                        <div className="flex items-center gap-4 bg-[#0a0808] border border-[#8b7355]/30 px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative">
                                            <div className="absolute -top-3 -right-3 size-8 rounded-full bg-[#8b0000]/80 border-2 border-[#5a0000] shadow-md flex items-center justify-center z-20">
                                                <RuneShare className="w-4 h-4 text-[#d4c4a8]/80" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-[#c9a227]/70 uppercase font-bold tracking-[0.2em]">Mã Triệu Hồi</span>
                                                <span className="font-heading text-2xl text-[#d4c4a8] tracking-widest">{roomCode || roomId || '8291'}</span>
                                            </div>
                                            <div className="h-8 w-[1px] bg-[#8b7355]/30 mx-1"></div>
                                            <button
                                                className="text-[#8b7355]/60 hover:text-[#d4c4a8] transition-colors cursor-pointer p-1"
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    navigator.clipboard.writeText(roomCode || roomId || '8291')
                                                    notify.success('Room code copied', 'Share')
                                                }}
                                            >
                                                <RuneCopy className="w-5 h-5" />
                                            </button>
                                        </div>
                                        {shareOpen && joinLink && (
                                            <div className="absolute right-0 top-full mt-4 w-[340px] bg-[#0a0808] border border-[#8b7355]/40 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] z-30">
                                                <div className="flex items-center gap-4">
                                                    {qrUrl && (
                                                        <img
                                                            src={qrUrl}
                                                            alt="Room QR"
                                                            className="w-36 h-36 border border-[#c9a227]/30 bg-black/40 p-1"
                                                        />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-[#8b7355]/80 text-xs uppercase tracking-[0.2em] mb-2">
                                                            Share Link
                                                        </p>
                                                        <a
                                                            href={joinLink}
                                                            className="block text-[#c9a227]/70 text-xs break-all underline"
                                                        >
                                                            {joinLink}
                                                        </a>
                                                        <button
                                                            onClick={(event) => {
                                                                event.stopPropagation()
                                                                handleCopyLink()
                                                            }}
                                                            className="mt-3 px-3 py-1.5 bg-[#c9a227]/80 text-[#0a0808] text-xs font-bold uppercase tracking-wider border border-[#8b6914] hover:bg-[#c9a227] transition-colors"
                                                        >
                                                            Copy Link
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Players Grid - Cursed souls gathering */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                                {players.map((player, index) => {
                                    const status = getPlayerStatus(player)
                                    const role = getPlayerRole(player)
                                    const elder = isElder(player)
                                    const playerId = getPlayerKey(player)
                                    const isSelected = isGMMode && selectedPlayerId === playerId
                                    const nightStatus = getPlayerNightStatus(player)
                                    const isDead = isPlayerDead(player)

                                    return (
                                        <div
                                            key={player.userId || player.id || index}
                                            onClick={() => !isDead && handlePlayerSelect(player)}
                                            className={`group relative flex flex-col p-1 bg-[#0a0808]/90 border ${
                                                isDead ? 'border-[#3a3a3a]/50 opacity-60' :
                                                isSelected ? 'border-[#8b0000] shadow-[0_0_25px_rgba(139,0,0,0.4)] ring-2 ring-[#8b0000]/50' :
                                                elder ? 'border-[#c9a227]/40 shadow-[0_0_20px_rgba(201,162,39,0.1)]' :
                                                status === 'prepared' ? 'border-[#8b7355]/40' : 'border-[#8b7355]/30'
                                                } shadow-2xl transition-all duration-500 ${!isDead ? 'hover:border-[#c9a227]/50 hover:-translate-y-1' : ''} ${isGMMode && !isDead ? 'cursor-pointer' : ''}`}
                                        >
                                            {/* Corner accents */}
                                            <CornerAccent className="absolute top-0 left-0 w-3 h-3 text-[#8b7355]/30" position="top-left" />
                                            <CornerAccent className="absolute top-0 right-0 w-3 h-3 text-[#8b7355]/30" position="top-right" />
                                            <CornerAccent className="absolute bottom-0 left-0 w-3 h-3 text-[#8b7355]/30" position="bottom-left" />
                                            <CornerAccent className="absolute bottom-0 right-0 w-3 h-3 text-[#8b7355]/30" position="bottom-right" />
                                            
                                            {/* Dead indicator */}
                                            {isDead && (
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-[#1a0808] px-3 py-0.5 border border-[#8b0000]/40 shadow-md">
                                                    <span className="text-[9px] font-heading text-[#8b0000] uppercase tracking-widest">Đã Chết</span>
                                                </div>
                                            )}
                                            
                                            {elder && !isDead && (
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-[#0a0808] px-3 py-0.5 border border-[#c9a227]/40 shadow-md">
                                                    <span className="text-[9px] font-heading text-[#c9a227] uppercase tracking-widest">Quản Trò</span>
                                                </div>
                                            )}
                                            <div className={`w-full aspect-[4/5] bg-black relative overflow-hidden ${isDead ? 'grayscale' : 'sepia-[0.3] contrast-125 saturate-50 group-hover:sepia-0 group-hover:saturate-100'} transition-all duration-700`}>
                                                <img
                                                    alt={player.username}
                                                    className={`w-full h-full object-cover ${isDead ? 'opacity-40' : 'opacity-80'}`}
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.userId}`}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                                                
                                                {/* Dead overlay with skull */}
                                                {isDead && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <RuneSkullDead className="w-16 h-16 text-[#8b0000]/60" />
                                                    </div>
                                                )}
                                                
                                                {!isDead && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                                        {role ? (
                                                            <RuneEyeClosed className="w-12 h-12 text-white/20 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                                                        ) : (
                                                            <RuneUser className="w-12 h-12 text-white/20 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                                                        )}
                                                    </div>
                                                )}
                                                {status === 'prepared' && !isDead && (
                                                    <div className="absolute top-2 right-2">
                                                        <RuneCheck 
                                                            className="w-5 h-5 text-[#6b8e6b]/80 drop-shadow-md"
                                                            title="Sẵn Sàng"
                                                        />
                                                    </div>
                                                )}
                                                {/* GM Selection Indicator */}
                                                {isSelected && !isDead && (
                                                    <div className="absolute inset-0 bg-[#8b0000]/20 flex items-center justify-center">
                                                        <RuneTarget className="w-16 h-16 text-[#8b0000]/60 animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 text-center bg-gradient-to-t from-[#0a0808] to-[#151210] border-t border-[#8b7355]/20 relative">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <p className={`font-heading text-sm tracking-wide truncate ${
                                                        isDead ? 'text-[#6a5a5a] line-through' :
                                                        elder ? 'text-[#c9a227]' : 'text-[#d4c4a8]'
                                                        } ${!isDead ? 'group-hover:text-white' : ''} transition-colors`}>
                                                        {player.username}
                                                    </p>
                                                    {/* GM-only Night Status Badges */}
                                                    {isGMMode && !isDead && (
                                                        <div className="flex items-center gap-1 ml-1">
                                                            {nightStatus.protected && (
                                                                <RuneShield className="w-3.5 h-3.5 text-[#4a9eff] drop-shadow-[0_0_4px_rgba(74,158,255,0.6)]" title="Được Bảo Vệ" />
                                                            )}
                                                            {nightStatus.bitten && (
                                                                <RuneFang className="w-3.5 h-3.5 text-[#8b0000] drop-shadow-[0_0_4px_rgba(139,0,0,0.6)]" title="Bị Cắn" />
                                                            )}
                                                            {nightStatus.poisoned && (
                                                                <RunePoison className="w-3.5 h-3.5 text-[#7b2d8e] drop-shadow-[0_0_4px_rgba(123,45,142,0.6)]" title="Bị Đầu Độc" />
                                                            )}
                                                            {nightStatus.saved && (
                                                                <RuneHeal className="w-3.5 h-3.5 text-[#4ade80] drop-shadow-[0_0_4px_rgba(74,222,128,0.6)]" title="Được Cứu" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Empty slots - Cursed graves */}
                                {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, index) => (
                                    <div
                                        key={`empty-${index}`}
                                        className="flex flex-col items-center justify-center gap-3 p-3 bg-[#0a0808]/40 border border-dashed border-[#8b7355]/20 transition-colors hover:bg-[#0a0808]/60 hover:border-[#8b7355]/40 group"
                                    >
                                        <div className="flex items-center justify-center size-14 rounded-full bg-[#8b7355]/10 text-[#8b7355]/40 group-hover:text-[#8b7355]/60 transition-colors">
                                            <RuneGrave className="w-7 h-7" />
                                        </div>
                                        <p className="text-[#8b7355]/40 text-xs font-serif italic group-hover:text-[#8b7355]/60">Mộ Trống...</p>
                                    </div>
                                ))}
                            </div>

                            {/* Start Game Button (chỉ hiển thị cho quản trò) */}
                            {!gameStarted && isHost && (
                                <div className="mt-auto pt-4 flex gap-6">
                                    <button
                                        onClick={handleStartGame}
                                        disabled={loading || players.length < 3 || players.length > 75}
                                        className="flex-1 max-w-sm h-16 bg-[#0a0808] border border-[#8b0000]/40 hover:border-[#8b0000]/70 text-[#d4c4a8] font-heading text-lg tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(139,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b0000]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                        <span className="z-10">{loading ? 'Đang khởi tạo...' : 'Bắt Đầu Đi Săn'}</span>
                                    </button>
                                    <button
                                        onClick={handleLeaveRoom}
                                        className="h-16 aspect-square bg-[#0a0808] border border-[#8b7355]/30 hover:border-[#8b0000]/50 hover:bg-[#1a0f0f] text-[#8b7355] hover:text-[#d4c4a8] flex items-center justify-center transition-all duration-300"
                                    >
                                        <RuneArrowLeft className="w-6 h-6" />
                                    </button>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-4 bg-[#1a0808] border border-[#8b0000]/50">
                                    <p className="text-[#d4a8a8]">{error}</p>
                                </div>
                            )}

                            {/* Game Started Message */}
                            {gameStarted && (
                                <div className="mt-4 text-center p-6 bg-[#0a0808] border border-[#c9a227]/40">
                                    <p className="text-xl text-[#c9a227] font-heading">
                                        🎮 Game đã bắt đầu!
                                    </p>
                                </div>
                            )}

                            {/* Night Wizard Panel - GM Only during NIGHT phase */}
                            {isHost && gameStatus === 'NIGHT' && currentNightStep && (
                                <div className="mt-6 relative">
                                    {/* Mystical glow effect */}
                                    <div className="absolute -inset-2 bg-[#1a0a20]/50 blur-xl rounded-lg"></div>
                                    
                                    <div className="relative bg-gradient-to-b from-[#0a0808] to-[#0d0a12] border border-[#4a3060]/50 shadow-[0_0_30px_rgba(74,48,96,0.2)] overflow-hidden">
                                        {/* Corner rune decorations */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#6b4d8a]/40"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#6b4d8a]/40"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#6b4d8a]/40"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#6b4d8a]/40"></div>

                                        {/* Header */}
                                        <div className="px-6 py-4 border-b border-[#4a3060]/30 bg-[#0d0a12]/80">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full bg-[#1a0a20] border border-[#6b4d8a]/50 flex items-center justify-center shadow-[0_0_15px_rgba(107,77,138,0.3)]">
                                                        <RuneNightMoon className="w-6 h-6 text-[#9d7bc9]" />
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#8b0000] rounded-full border border-[#5a0000] flex items-center justify-center">
                                                        <span className="text-[8px] text-white font-bold">
                                                            {currentNightStep === 'BODYGUARD' ? '1' : 
                                                             currentNightStep === 'WEREWOLF' ? '2' : 
                                                             currentNightStep === 'SEER' ? '3' : '4'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[#6b4d8a] uppercase tracking-[0.3em] font-bold">Nghi Thức Đêm</p>
                                                    <h3 className="font-heading text-xl text-[#d4c4a8] tracking-wide">
                                                        {nightStepContent[currentNightStep]?.title || 'Đêm Tối'}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="px-6 py-5">
                                            {/* Ritual description */}
                                            <div className="flex gap-4 mb-5">
                                                <div className="flex-shrink-0 w-10 h-10 rounded bg-[#1a0a20]/60 border border-[#4a3060]/40 flex items-center justify-center">
                                                    <RuneRitual className="w-5 h-5 text-[#6b4d8a]" />
                                                </div>
                                                <p className="text-[#a89db8] font-serif italic text-sm leading-relaxed">
                                                    {nightStepContent[currentNightStep]?.description || 'Màn đêm buông xuống...'}
                                                </p>
                                            </div>

                                            {/* Instruction */}
                                            <div className="bg-[#1a0a20]/40 border border-[#4a3060]/30 px-4 py-3 mb-5">
                                                <p className="text-[#9d7bc9] text-sm flex items-center gap-2">
                                                    <RuneHand className="w-4 h-4 flex-shrink-0" />
                                                    <span>{nightStepContent[currentNightStep]?.instruction || 'Chờ đợi...'}</span>
                                                </p>
                                            </div>

                                            {/* Role status hint for GM */}
                                            {(() => {
                                                const status = getNightStepRoleStatus(currentNightStep)
                                                if (!status || status.active) return null
                                                const roleLabel = nightStepContent[currentNightStep]?.title || 'Vai trò'
                                                return (
                                                    <div className="bg-[#200a0a]/60 border border-[#8b0000]/40 px-4 py-3 mb-5">
                                                        <p className="text-[#d4a8a8] text-sm flex items-center gap-2">
                                                            <RuneSkull className="w-4 h-4 text-[#8b0000]" />
                                                            <span>{roleLabel} đã chết, có thể bỏ qua nghi thức.</span>
                                                        </p>
                                                    </div>
                                                )
                                            })()}

                                            {/* Witch Step - Special UI */}
                                            {currentNightStep === 'WITCH' && (
                                                <>
                                                    {/* Bitten player info - from service */}
                                                    {bittenPlayer ? (
                                                        <div className="bg-[#200a0a]/60 border border-[#8b0000]/40 px-4 py-3 mb-5">
                                                            <p className="text-[#d4a8a8] text-sm flex items-center gap-2">
                                                                <RuneFang className="w-4 h-4 text-[#8b0000]" />
                                                                <span>Đêm nay, <span className="text-[#ff6666] font-heading">{bittenPlayer.playerName}</span> đã bị Ma Sói cắn.</span>
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-[#0a200a]/60 border border-[#2d5a2d]/40 px-4 py-3 mb-5">
                                                            <p className="text-[#a8d4a8] text-sm flex items-center gap-2">
                                                                <RuneShield className="w-4 h-4 text-[#4ade80]" />
                                                                <span>Đêm nay không ai bị cắn (được bảo vệ hoặc Ma Sói không chọn ai).</span>
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Witch action buttons */}
                                                    <div className="space-y-3 mb-5">
                                                        {/* Healing Potion */}
                                                        <button
                                                            onClick={() => setWitchAction('HEAL')}
                                                            disabled={witchPotions.saveUsed || !bittenPlayer}
                                                            className={`w-full p-4 border transition-all duration-300 flex items-center gap-4 ${
                                                                witchAction === 'HEAL'
                                                                    ? 'bg-[#0a200a]/80 border-[#4ade80]/60 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                                                                    : witchPotions.saveUsed || !bittenPlayer
                                                                        ? 'bg-[#0a0808]/40 border-[#4a3060]/20 opacity-50 cursor-not-allowed'
                                                                        : 'bg-[#0a0808]/60 border-[#4a3060]/30 hover:border-[#4ade80]/40 hover:bg-[#0a200a]/40'
                                                            }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                witchAction === 'HEAL' ? 'bg-[#4ade80]/20' : 'bg-[#1a0a20]/60'
                                                            }`}>
                                                                <RuneHealPotion className={`w-5 h-5 ${witchAction === 'HEAL' ? 'text-[#4ade80]' : 'text-[#6b4d8a]'}`} />
                                                            </div>
                                                            <div className="text-left flex-1">
                                                                <p className={`font-heading text-sm ${witchAction === 'HEAL' ? 'text-[#4ade80]' : 'text-[#d4c4a8]'}`}>
                                                                    Thuốc Cứu Mạng
                                                                </p>
                                                                <p className="text-[#6a5a4a] text-xs">
                                                                    {witchPotions.saveUsed ? 'Đã sử dụng' : bittenPlayer ? `Cứu ${bittenPlayer.playerName}` : 'Không có ai cần cứu'}
                                                                </p>
                                                            </div>
                                                            {witchAction === 'HEAL' && <RuneCheck className="w-5 h-5 text-[#4ade80]" />}
                                                        </button>

                                                        {/* Poison Potion */}
                                                        <button
                                                            onClick={() => setWitchAction('POISON')}
                                                            disabled={witchPotions.poisonUsed}
                                                            className={`w-full p-4 border transition-all duration-300 flex items-center gap-4 ${
                                                                witchAction === 'POISON'
                                                                    ? 'bg-[#200a20]/80 border-[#9d7bc9]/60 shadow-[0_0_15px_rgba(157,123,201,0.2)]'
                                                                    : witchPotions.poisonUsed
                                                                        ? 'bg-[#0a0808]/40 border-[#4a3060]/20 opacity-50 cursor-not-allowed'
                                                                        : 'bg-[#0a0808]/60 border-[#4a3060]/30 hover:border-[#9d7bc9]/40 hover:bg-[#200a20]/40'
                                                            }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                witchAction === 'POISON' ? 'bg-[#9d7bc9]/20' : 'bg-[#1a0a20]/60'
                                                            }`}>
                                                                <RunePoison className={`w-5 h-5 ${witchAction === 'POISON' ? 'text-[#9d7bc9]' : 'text-[#6b4d8a]'}`} />
                                                            </div>
                                                            <div className="text-left flex-1">
                                                                <p className={`font-heading text-sm ${witchAction === 'POISON' ? 'text-[#9d7bc9]' : 'text-[#d4c4a8]'}`}>
                                                                    Thuốc Độc
                                                                </p>
                                                                <p className="text-[#6a5a4a] text-xs">
                                                                    {witchPotions.poisonUsed ? 'Đã sử dụng' : 'Chọn người chơi từ danh sách'}
                                                                </p>
                                                            </div>
                                                            {witchAction === 'POISON' && <RuneCheck className="w-5 h-5 text-[#9d7bc9]" />}
                                                        </button>

                                                        {/* Do Nothing */}
                                                        <button
                                                            onClick={() => { setWitchAction('NOTHING'); setSelectedPlayerId(null); }}
                                                            className={`w-full p-4 border transition-all duration-300 flex items-center gap-4 ${
                                                                witchAction === 'NOTHING'
                                                                    ? 'bg-[#1a1a1a]/80 border-[#8b7355]/60 shadow-[0_0_15px_rgba(139,115,85,0.2)]'
                                                                    : 'bg-[#0a0808]/60 border-[#4a3060]/30 hover:border-[#8b7355]/40 hover:bg-[#1a1a1a]/40'
                                                            }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                witchAction === 'NOTHING' ? 'bg-[#8b7355]/20' : 'bg-[#1a0a20]/60'
                                                            }`}>
                                                                <RuneSleep className={`w-5 h-5 ${witchAction === 'NOTHING' ? 'text-[#8b7355]' : 'text-[#6b4d8a]'}`} />
                                                            </div>
                                                            <div className="text-left flex-1">
                                                                <p className={`font-heading text-sm ${witchAction === 'NOTHING' ? 'text-[#8b7355]' : 'text-[#d4c4a8]'}`}>
                                                                    Không Làm Gì
                                                                </p>
                                                                <p className="text-[#6a5a4a] text-xs">Phù Thủy tiếp tục ngủ</p>
                                                            </div>
                                                            {witchAction === 'NOTHING' && <RuneCheck className="w-5 h-5 text-[#8b7355]" />}
                                                        </button>
                                                    </div>

                                                    {/* Poison target selection hint */}
                                                    {witchAction === 'POISON' && !selectedPlayerId && (
                                                        <div className="bg-[#200a20]/40 border border-[#9d7bc9]/30 px-4 py-3 mb-5">
                                                            <p className="text-[#9d7bc9] text-sm flex items-center gap-2">
                                                                <RuneHand className="w-4 h-4" />
                                                                <span>Chọn người chơi từ danh sách để đầu độc</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Selected player indicator (for non-Witch steps or Witch poison) */}
                                            {selectedPlayerId && (currentNightStep !== 'WITCH' || witchAction === 'POISON') && (
                                                <div className="bg-[#200a0a]/60 border border-[#8b0000]/30 px-4 py-3 mb-5">
                                                    <p className="text-[#d4a8a8] text-sm flex items-center gap-2">
                                                        <RuneTarget className="w-4 h-4 text-[#8b0000]" />
                                                        <span>Đã chọn: <span className="text-[#d4c4a8] font-heading">
                                                            {players.find(p => (p.userId || p.id) === selectedPlayerId)?.username || 'Unknown'}
                                                        </span></span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Confirmation button */}
                                            <button
                                                onClick={handleNightStepConfirm}
                                                disabled={currentNightStep === 'WITCH' && !witchAction}
                                                className={`w-full h-14 bg-[#1a0a20] border border-[#6b4d8a]/50 hover:border-[#9d7bc9]/70 text-[#d4c4a8] font-heading tracking-[0.15em] uppercase shadow-[0_0_20px_rgba(107,77,138,0.15)] transition-all duration-500 hover:shadow-[0_0_25px_rgba(107,77,138,0.3)] flex items-center justify-center gap-3 group relative overflow-hidden ${
                                                    currentNightStep === 'WITCH' && !witchAction ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6b4d8a]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                <RuneConfirm className="w-5 h-5 text-[#9d7bc9] z-10" />
                                                <span className="z-10">Xác Nhận Nghi Thức</span>
                                            </button>
                                        </div>

                                        {/* Footer decoration */}
                                        <div className="h-1 bg-gradient-to-r from-transparent via-[#6b4d8a]/30 to-transparent"></div>
                                    </div>
                                </div>
                            )}

                            {/* Night Complete Panel - GM Only when night steps are done */}
                            {isHost && gameStatus === 'NIGHT' && !currentNightStep && (
                                <div className="mt-6 relative">
                                    {/* Dawn glow effect */}
                                    <div className="absolute -inset-2 bg-[#2a1a0a]/50 blur-xl rounded-lg"></div>
                                    
                                    <div className="relative bg-gradient-to-b from-[#0a0808] to-[#12100a] border border-[#c9a227]/40 shadow-[0_0_30px_rgba(201,162,39,0.15)] overflow-hidden">
                                        {/* Corner decorations */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#c9a227]/30"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#c9a227]/30"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#c9a227]/30"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#c9a227]/30"></div>

                                        {/* Header */}
                                        <div className="px-6 py-4 border-b border-[#c9a227]/20 bg-[#12100a]/80">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[#1a150a] border border-[#c9a227]/40 flex items-center justify-center shadow-[0_0_15px_rgba(201,162,39,0.2)]">
                                                    <RuneSunrise className="w-6 h-6 text-[#c9a227]" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[#c9a227]/70 uppercase tracking-[0.3em] font-bold">Đêm Kết Thúc</p>
                                                    <h3 className="font-heading text-xl text-[#d4c4a8] tracking-wide">Bình Minh Đến</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="px-6 py-5">
                                            {/* Night result summary from service */}
                                            {nightResult && nightResult.deaths && nightResult.deaths.length > 0 ? (
                                                <div className="bg-[#200a0a]/40 border border-[#8b0000]/30 p-4 mb-5">
                                                    <p className="text-[#d4a8a8] text-sm font-serif italic">
                                                        {nightResult.message || `${nightResult.deaths.length} người đã chết đêm qua.`}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[#a89d88] font-serif italic text-sm leading-relaxed mb-5">
                                                    Tất cả nghi thức đêm đã hoàn tất. Bình minh đang ló dạng trên làng. 
                                                    Hãy công bố kết quả đêm qua cho dân làng.
                                                </p>
                                            )}

                                            {/* Transition button */}
                                            <button
                                                onClick={handleTransitionToDay}
                                                className="w-full h-14 bg-[#1a150a] border border-[#c9a227]/50 hover:border-[#c9a227]/80 text-[#d4c4a8] font-heading tracking-[0.15em] uppercase shadow-[0_0_20px_rgba(201,162,39,0.1)] transition-all duration-500 hover:shadow-[0_0_25px_rgba(201,162,39,0.25)] flex items-center justify-center gap-3 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a227]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                <RuneSunrise className="w-5 h-5 text-[#c9a227] z-10" />
                                                <span className="z-10">Công Bố Kết Quả Đêm</span>
                                            </button>
                                        </div>

                                        {/* Footer decoration */}
                                        <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent"></div>
                                    </div>
                                </div>
                            )}

                            {/* Day Phase Panel - GM Only during DAY phase */}
                            {isHost && gameStatus === 'DAY' && !executionPending && !hunterCanShoot && (
                                <div className="mt-6 relative">
                                    {/* Daylight glow effect */}
                                    <div className="absolute -inset-2 bg-[#c9a227]/10 blur-xl rounded-lg"></div>
                                    
                                    <div className="relative bg-gradient-to-b from-[#12100a] to-[#0a0808] border border-[#c9a227]/30 shadow-[0_0_30px_rgba(201,162,39,0.1)] overflow-hidden">
                                        {/* Corner decorations */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#c9a227]/25"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#c9a227]/25"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#c9a227]/25"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#c9a227]/25"></div>

                                        {/* Header */}
                                        <div className="px-6 py-4 border-b border-[#c9a227]/20 bg-[#12100a]/80">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[#1a150a] border border-[#c9a227]/40 flex items-center justify-center shadow-[0_0_15px_rgba(201,162,39,0.15)]">
                                                    <RuneSunrise className="w-6 h-6 text-[#c9a227]" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-[#c9a227]/70 uppercase tracking-[0.3em] font-bold">Ban Ngày</p>
                                                    <h3 className="font-heading text-xl text-[#d4c4a8] tracking-wide">Phiên Tòa Làng</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="px-6 py-5">
                                            <p className="text-[#a89d88] font-serif italic text-sm leading-relaxed mb-5">
                                                Dân làng thảo luận và bỏ phiếu. Chọn một người chơi từ danh sách để hành quyết.
                                            </p>

                                            {/* Selected player indicator */}
                                            {selectedPlayerId && (
                                                <div className="bg-[#200a0a]/60 border border-[#8b0000]/30 px-4 py-3 mb-5">
                                                    <p className="text-[#d4a8a8] text-sm flex items-center gap-2">
                                                        <RuneTarget className="w-4 h-4 text-[#8b0000]" />
                                                        <span>Đã chọn: <span className="text-[#d4c4a8] font-heading">
                                                            {players.find(p => (p.userId || p.id) === selectedPlayerId)?.username || 'Unknown'}
                                                        </span></span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Execution button */}
                                            <button
                                                onClick={handleInitiateExecution}
                                                disabled={!selectedPlayerId}
                                                className={`w-full h-14 bg-[#1a0808] border font-heading tracking-[0.15em] uppercase transition-all duration-500 flex items-center justify-center gap-3 group relative overflow-hidden ${
                                                    selectedPlayerId 
                                                        ? 'border-[#8b0000]/50 hover:border-[#8b0000]/80 text-[#d4c4a8] shadow-[0_0_20px_rgba(139,0,0,0.1)] hover:shadow-[0_0_25px_rgba(139,0,0,0.25)]'
                                                        : 'border-[#4a3a3a]/30 text-[#6a5a5a] cursor-not-allowed opacity-60'
                                                }`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b0000]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                <RuneExecute className="w-5 h-5 text-[#8b0000] z-10" />
                                                <span className="z-10">Hành Quyết</span>
                                            </button>

                                            {/* Start Night button */}
                                            <button
                                                onClick={handleStartNight}
                                                className="w-full h-14 mt-3 bg-[#0a0a1a] border border-[#4a5a8a]/50 hover:border-[#6a7aaa]/80 text-[#d4c4a8] font-heading tracking-[0.15em] uppercase transition-all duration-500 flex items-center justify-center gap-3 group relative overflow-hidden shadow-[0_0_20px_rgba(74,90,138,0.1)] hover:shadow-[0_0_25px_rgba(74,90,138,0.25)]"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4a5a8a]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                <RuneMoon className="w-5 h-5 text-[#8a9aca] z-10" />
                                                <span className="z-10">Bắt Đầu Đêm Mới</span>
                                            </button>
                                        </div>

                                        {/* Footer decoration */}
                                        <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a227]/20 to-transparent"></div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Right Section - Chat Sidebar - Ancient chronicle */}
                        <aside className="w-full lg:w-[420px] xl:w-[480px] bg-[#080606] border-l border-[#8b7355]/30 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-20">
                            <div className="bg-[#0a0808] px-6 py-5 border-b border-[#8b7355]/30 flex items-center justify-between shadow-lg z-10">
                                <h3 className="font-heading text-[#d4c4a8] text-xl flex items-center gap-3 drop-shadow-md">
                                    <RuneChronicle className="w-6 h-6 text-[#8b0000]/70" />
                                    Biên Niên Sử Làng
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className={`size-2 rounded-full ${socketConnected ? 'bg-[#6b8e6b] animate-pulse' : 'bg-[#8b4444]'}`}></div>
                                    <span className="text-[10px] font-serif uppercase tracking-widest text-[#6a5a4a]">
                                        {socketConnected ? 'Đang Thì Thầm' : 'Im Lặng'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 bg-[#050508] relative">
                                {/* Texture overlay */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
                                }} />
                                
                                <div className="flex justify-center my-4 relative z-10">
                                    <div className="text-center">
                                        <RuneChurch className="w-6 h-6 text-[#8b7355]/40 mx-auto mb-2" />
                                        <p className="font-serif italic text-sm text-[#6a5a4a]">Làng tụ họp trong im lặng...</p>
                                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#8b7355]/30 to-transparent mx-auto mt-2"></div>
                                    </div>
                                </div>

                                {chatMessages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col gap-1 max-w-[90%] group relative z-10 ${msg.userId === currentUserId ? 'items-end ml-auto' : 'items-start'
                                            }`}
                                    >
                                        <span className={`text-[11px] text-[#8b7355] font-heading tracking-wider ${msg.userId === currentUserId ? 'mr-2' : 'ml-2'
                                            }`}>
                                            {msg.username}
                                        </span>
                                        <div className={`bg-[#0a0808] border border-[#8b7355]/30 text-[#d4c4a8]/90 px-5 py-3 shadow-lg relative ${msg.userId === currentUserId ? 'bg-[#0f0a0a] border-[#8b0000]/30' : ''
                                            }`}>
                                            <p className="text-base font-serif italic leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-[#0a0808] border-t border-[#8b7355]/30 z-20">
                                <div className="relative flex items-center group">
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-[#8b7355]/40 opacity-50 group-focus-within:opacity-100 transition-opacity">
                                        <RuneQuill className="w-7 h-7 rotate-12" />
                                    </div>
                                    <input
                                        className="w-full h-14 pl-10 pr-12 bg-transparent border-b-2 border-[#8b7355]/40 text-[#d4c4a8] font-serif italic text-lg placeholder-[#6a5a4a]/60 focus:outline-none focus:border-[#8b0000]/60 transition-all duration-500"
                                        placeholder="Viết tin nhắn của bạn ở đây..."
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        className="absolute right-2 p-2 text-[#6a5a4a] hover:text-[#d4c4a8] transition-colors duration-300"
                                    >
                                        <RuneSend className="w-6 h-6" />
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
                playerCount={Math.max(1, players.length - 1)} // Trừ host ra (host sẽ nhận role MODERATOR)
                onConfirm={handleRoleSetupConfirm}
                initialSetup={roleSetup}
                availableRoles={availableRoles}
            />

            {/* Role Reveal Card - Medieval tarot card style reveal */}
            <RoleRevealCard
                roleId={myRole?.role}
                roleName={myRole?.roleName}
                faction={myRole?.faction}
                isOpen={myRole && !myRole.acknowledged}
                onClose={() => setMyRole({ ...myRole, acknowledged: true })}
            />

            {/* Seer Result Modal - Large, clear faction display for GM */}
            {seerResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark mystical backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        onClick={handleSeerResultDismiss}
                    />
                    
                    {/* Result card */}
                    <div className="relative max-w-lg w-full animate-fade-in">
                        {/* Mystical glow based on faction */}
                        <div className={`absolute -inset-4 blur-2xl rounded-full opacity-50 ${
                            seerResult.faction === 'EVIL' 
                                ? 'bg-[#8b0000]' 
                                : 'bg-[#2d5a2d]'
                        }`}></div>
                        
                        <div className={`relative bg-gradient-to-b from-[#0a0808] to-[#0d0a08] border-2 ${
                            seerResult.faction === 'EVIL'
                                ? 'border-[#8b0000]/60 shadow-[0_0_50px_rgba(139,0,0,0.4)]'
                                : 'border-[#2d5a2d]/60 shadow-[0_0_50px_rgba(45,90,45,0.4)]'
                        } p-8 text-center`}>
                            {/* Corner runes */}
                            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-current opacity-40"></div>
                            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-current opacity-40"></div>
                            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-current opacity-40"></div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-current opacity-40"></div>

                            {/* Header */}
                            <div className="mb-6">
                                <RuneSeerEye className={`w-16 h-16 mx-auto mb-4 ${
                                    seerResult.faction === 'EVIL' ? 'text-[#8b0000]' : 'text-[#4ade80]'
                                }`} />
                                <p className="text-[#8b7355] text-sm uppercase tracking-[0.3em] font-bold">Thị Kiến Tiên Tri</p>
                            </div>

                            {/* Player name */}
                            <div className="mb-8">
                                <p className="text-[#6a5a4a] text-sm uppercase tracking-wider mb-2">Linh Hồn Được Soi</p>
                                <p className="font-heading text-3xl text-[#d4c4a8] tracking-wide">{seerResult.playerName}</p>
                            </div>

                            {/* Faction result - LARGE and OBVIOUS */}
                            <div className={`py-8 px-6 mb-8 border-y ${
                                seerResult.faction === 'EVIL'
                                    ? 'border-[#8b0000]/40 bg-[#200808]/60'
                                    : 'border-[#2d5a2d]/40 bg-[#082008]/60'
                            }`}>
                                <p className={`font-heading text-6xl md:text-7xl tracking-widest uppercase ${
                                    seerResult.faction === 'EVIL'
                                        ? 'text-[#ff4444] drop-shadow-[0_0_20px_rgba(255,68,68,0.5)]'
                                        : 'text-[#4ade80] drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]'
                                }`}>
                                    {seerResult.faction === 'EVIL' ? 'PHE ÁC' : 'PHE THIỆN'}
                                </p>
                                <p className={`mt-4 text-lg font-serif italic ${
                                    seerResult.faction === 'EVIL' ? 'text-[#d4a8a8]' : 'text-[#a8d4a8]'
                                }`}>
                                    {seerResult.faction === 'EVIL' 
                                        ? 'Bóng tối ngự trị trong linh hồn này...' 
                                        : 'Ánh sáng tỏa ra từ linh hồn này...'}
                                </p>
                            </div>

                            {/* Dismiss button */}
                            <button
                                onClick={handleSeerResultDismiss}
                                className={`w-full h-14 border font-heading tracking-[0.15em] uppercase transition-all duration-500 flex items-center justify-center gap-3 ${
                                    seerResult.faction === 'EVIL'
                                        ? 'bg-[#200808] border-[#8b0000]/50 hover:border-[#8b0000] text-[#d4c4a8] hover:shadow-[0_0_20px_rgba(139,0,0,0.3)]'
                                        : 'bg-[#082008] border-[#2d5a2d]/50 hover:border-[#4ade80] text-[#d4c4a8] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                                }`}
                            >
                                <RuneConfirm className="w-5 h-5" />
                                <span>Đã Hiểu - Tiếp Tục</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Night Narrative Modal - GM reads aloud the night outcome */}
            {narrative && isHost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dawn backdrop */}
                    <div 
                        className="absolute inset-0 bg-gradient-to-b from-[#1a1008]/95 to-black/95 backdrop-blur-sm"
                        onClick={handleDismissNarrative}
                    />
                    
                    {/* Narrative card */}
                    <div className="relative max-w-2xl w-full">
                        {/* Dawn glow */}
                        <div className="absolute -inset-4 bg-[#c9a227]/10 blur-2xl rounded-full opacity-50"></div>
                        
                        <div className="relative bg-gradient-to-b from-[#12100a] to-[#0a0808] border-2 border-[#c9a227]/40 shadow-[0_0_50px_rgba(201,162,39,0.2)] p-8">
                            {/* Corner decorations */}
                            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#c9a227]/40"></div>
                            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#c9a227]/40"></div>
                            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#c9a227]/40"></div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#c9a227]/40"></div>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <RuneSunrise className="w-16 h-16 mx-auto mb-4 text-[#c9a227]" />
                                <p className="text-[#c9a227]/70 text-sm uppercase tracking-[0.3em] font-bold">Bình Minh Ló Dạng</p>
                                <h2 className="font-heading text-3xl text-[#d4c4a8] tracking-wide mt-2">Kết Quả Đêm Qua</h2>
                            </div>

                            {/* Narrative message - Large and readable for GM to read aloud */}
                            <div className="bg-[#0a0808]/60 border border-[#c9a227]/20 p-6 mb-8">
                                <p className="font-serif text-2xl md:text-3xl text-[#d4c4a8] leading-relaxed text-center italic">
                                    "{narrative.message}"
                                </p>
                            </div>

                            {/* Death details for GM reference */}
                            {narrative.deaths && narrative.deaths.length > 0 && (
                                <div className="mb-8">
                                    <p className="text-[#8b7355] text-xs uppercase tracking-wider mb-3 text-center">Chi Tiết (Chỉ GM Thấy)</p>
                                    <div className="space-y-2">
                                        {narrative.deaths.map((death, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-[#200a0a]/40 border border-[#8b0000]/20 px-4 py-2">
                                                <RuneSkullDead className="w-5 h-5 text-[#8b0000]/70 flex-shrink-0" />
                                                <span className="text-[#d4a8a8]">
                                                    <span className="font-heading text-[#d4c4a8]">{death.playerName}</span>
                                                    <span className="text-[#8b7355] mx-2">—</span>
                                                    <span className="italic">{death.cause}</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instruction */}
                            <p className="text-[#8b7355] text-sm text-center mb-6 font-serif italic">
                                Đọc to câu trên cho dân làng nghe, sau đó nhấn nút bên dưới để tiếp tục.
                            </p>

                            {/* Dismiss button */}
                            <button
                                onClick={handleDismissNarrative}
                                className="w-full h-14 bg-[#1a150a] border border-[#c9a227]/50 hover:border-[#c9a227]/80 text-[#d4c4a8] font-heading tracking-[0.15em] uppercase transition-all duration-500 hover:shadow-[0_0_20px_rgba(201,162,39,0.25)] flex items-center justify-center gap-3"
                            >
                                <RuneConfirm className="w-5 h-5 text-[#c9a227]" />
                                <span>Đã Công Bố - Tiếp Tục</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Execution Confirmation Modal - GM confirms execution */}
            {executionPending && isHost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        onClick={handleCancelExecution}
                    />
                    
                    {/* Confirmation card */}
                    <div className="relative max-w-md w-full">
                        {/* Blood red glow */}
                        <div className="absolute -inset-4 bg-[#8b0000]/20 blur-2xl rounded-full opacity-60"></div>
                        
                        <div className="relative bg-gradient-to-b from-[#0a0808] to-[#120808] border-2 border-[#8b0000]/50 shadow-[0_0_50px_rgba(139,0,0,0.3)] p-8">
                            {/* Corner decorations */}
                            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#8b0000]/40"></div>
                            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#8b0000]/40"></div>
                            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#8b0000]/40"></div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#8b0000]/40"></div>

                            {/* Header */}
                            <div className="text-center mb-6">
                                <RuneExecute className="w-16 h-16 mx-auto mb-4 text-[#8b0000]" />
                                <p className="text-[#8b0000]/70 text-sm uppercase tracking-[0.3em] font-bold">Phán Quyết</p>
                                <h2 className="font-heading text-2xl text-[#d4c4a8] tracking-wide mt-2">Xác Nhận Hành Quyết</h2>
                            </div>

                            {/* Target info */}
                            <div className="bg-[#200808]/60 border border-[#8b0000]/30 p-5 mb-6 text-center">
                                <p className="text-[#8b7355] text-xs uppercase tracking-wider mb-2">Người Bị Kết Án</p>
                                <p className="font-heading text-3xl text-[#d4c4a8] tracking-wide">{executionPending.playerName}</p>
                                {/* Note: Service will notify if Hunter after execution */}
                            </div>

                            {/* Warning */}
                            <p className="text-[#d4a8a8] text-sm text-center mb-6 font-serif italic">
                                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn hành quyết người chơi này?
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCancelExecution}
                                    className="flex-1 h-12 bg-[#0a0808] border border-[#8b7355]/40 hover:border-[#8b7355]/60 text-[#8b7355] font-heading tracking-wider uppercase transition-all duration-300"
                                >
                                    Hủy Bỏ
                                </button>
                                <button
                                    onClick={handleConfirmExecution}
                                    className="flex-1 h-12 bg-[#200808] border border-[#8b0000]/60 hover:border-[#8b0000] text-[#d4c4a8] font-heading tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(139,0,0,0.3)] flex items-center justify-center gap-2"
                                >
                                    <RuneExecute className="w-4 h-4 text-[#8b0000]" />
                                    <span>Hành Quyết</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hunter Revenge Modal - Hunter chooses who to take with them */}
            {hunterCanShoot && isHost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark mystical backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1008]/95 to-black/95 backdrop-blur-sm" />
                    
                    {/* Revenge card */}
                    <div className="relative max-w-lg w-full">
                        {/* Hunter's golden glow */}
                        <div className="absolute -inset-4 bg-[#c9a227]/15 blur-2xl rounded-full opacity-60"></div>
                        
                        <div className="relative bg-gradient-to-b from-[#0a0808] to-[#0d0a08] border-2 border-[#c9a227]/50 shadow-[0_0_50px_rgba(201,162,39,0.25)] p-8">
                            {/* Corner decorations */}
                            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#c9a227]/40"></div>
                            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#c9a227]/40"></div>
                            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#c9a227]/40"></div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#c9a227]/40"></div>

                            {/* Header */}
                            <div className="text-center mb-6">
                                <RuneHunterBow className="w-16 h-16 mx-auto mb-4 text-[#c9a227]" />
                                <p className="text-[#c9a227]/70 text-sm uppercase tracking-[0.3em] font-bold">Phát Súng Cuối Cùng</p>
                                <h2 className="font-heading text-2xl text-[#d4c4a8] tracking-wide mt-2">Thợ Săn Trả Thù</h2>
                            </div>

                            {/* Hunter info */}
                            <div className="bg-[#1a150a]/60 border border-[#c9a227]/30 p-4 mb-5 text-center">
                                <p className="text-[#8b7355] text-xs uppercase tracking-wider mb-1">Thợ Săn Đã Chết</p>
                                <p className="font-heading text-xl text-[#c9a227]">{hunterCanShoot.hunterName}</p>
                            </div>

                            {/* Instruction */}
                            <div className="bg-[#0a0808]/60 border border-[#8b7355]/20 p-4 mb-5">
                                <p className="text-[#a89d88] font-serif italic text-sm leading-relaxed text-center">
                                    Hỏi Thợ Săn: "Trước khi chết, bạn muốn bắn ai?"
                                    <br />
                                    <span className="text-[#c9a227]">Chọn một người chơi từ danh sách bên trái.</span>
                                </p>
                            </div>

                            {/* Selected target */}
                            {selectedPlayerId && (
                                <div className="bg-[#200a0a]/60 border border-[#8b0000]/30 px-4 py-3 mb-5">
                                    <p className="text-[#d4a8a8] text-sm flex items-center justify-center gap-2">
                                        <RuneTarget className="w-4 h-4 text-[#8b0000]" />
                                        <span>Mục tiêu: <span className="text-[#d4c4a8] font-heading">
                                            {players.find(p => (p.userId || p.id) === selectedPlayerId)?.username || 'Unknown'}
                                        </span></span>
                                    </p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleHunterRevengeSkip}
                                    className="flex-1 h-12 bg-[#0a0808] border border-[#8b7355]/40 hover:border-[#8b7355]/60 text-[#8b7355] font-heading tracking-wider uppercase transition-all duration-300"
                                >
                                    Không Bắn
                                </button>
                                <button
                                    onClick={handleHunterRevengeConfirm}
                                    disabled={!selectedPlayerId}
                                    className={`flex-1 h-12 border font-heading tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                                        selectedPlayerId
                                            ? 'bg-[#1a150a] border-[#c9a227]/60 hover:border-[#c9a227] text-[#d4c4a8] hover:shadow-[0_0_15px_rgba(201,162,39,0.3)]'
                                            : 'bg-[#0a0808] border-[#4a4a3a]/30 text-[#6a6a5a] cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    <RuneHunterBow className="w-4 h-4 text-[#c9a227]" />
                                    <span>Bắn</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {gameOver && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark backdrop */}
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
                    
                    {/* Game Over card */}
                    <div className="relative max-w-lg w-full">
                        {/* Victory glow */}
                        <div className={`absolute -inset-4 blur-2xl rounded-full opacity-50 ${
                            gameOver.winner === 'VILLAGER' ? 'bg-[#4ade80]' : 
                            gameOver.winner === 'WEREWOLF' ? 'bg-[#8b0000]' : 'bg-[#c9a227]'
                        }`}></div>
                        
                        <div className={`relative bg-gradient-to-b from-[#0a0808] to-[#0d0a08] border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 ${
                            gameOver.winner === 'VILLAGER' ? 'border-[#4ade80]/50' : 
                            gameOver.winner === 'WEREWOLF' ? 'border-[#8b0000]/50' : 'border-[#c9a227]/50'
                        }`}>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <RuneSkull className={`w-20 h-20 mx-auto mb-4 ${
                                    gameOver.winner === 'VILLAGER' ? 'text-[#4ade80]' : 
                                    gameOver.winner === 'WEREWOLF' ? 'text-[#8b0000]' : 'text-[#c9a227]'
                                }`} />
                                <h2 className="font-heading text-4xl text-[#d4c4a8] tracking-wide">KẾT THÚC</h2>
                            </div>

                            {/* Winner message */}
                            <div className={`p-6 mb-6 text-center border ${
                                gameOver.winner === 'VILLAGER' ? 'bg-[#082008]/60 border-[#4ade80]/30' : 
                                gameOver.winner === 'WEREWOLF' ? 'bg-[#200808]/60 border-[#8b0000]/30' : 'bg-[#1a150a]/60 border-[#c9a227]/30'
                            }`}>
                                <p className={`font-heading text-3xl tracking-wide ${
                                    gameOver.winner === 'VILLAGER' ? 'text-[#4ade80]' : 
                                    gameOver.winner === 'WEREWOLF' ? 'text-[#ff4444]' : 'text-[#c9a227]'
                                }`}>
                                    {gameOver.message}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleOpenChronicle}
                                    className="w-full h-14 bg-[#120f0a] border border-[#c9a227]/50 hover:border-[#e6c84a] text-[#e6c84a] font-heading tracking-[0.18em] uppercase transition-all duration-500 hover:shadow-[0_0_25px_rgba(201,162,39,0.35)] flex items-center justify-center gap-3"
                                >
                                    <RuneChronicle className="w-5 h-5" />
                                    Biên Niên Sử Trận Đấu
                                </button>
                                <button
                                    onClick={() => navigate('/game')}
                                    className="w-full h-14 bg-[#0a0808] border border-[#8b7355]/50 hover:border-[#c9a227]/60 text-[#d4c4a8] font-heading tracking-[0.15em] uppercase transition-all duration-500 hover:shadow-[0_0_20px_rgba(201,162,39,0.2)]"
                                >
                                    Quay Về Sảnh Chính
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============================================
// Local Icon Components - Ancient Rune Symbols
// ============================================

function RuneEyeClosed({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Closed eye */}
      <path d="M3 12 Q12 18 21 12" />
      {/* Eyelashes */}
      <path d="M6 14 L5 16" strokeWidth="1" />
      <path d="M12 16 L12 18" strokeWidth="1" />
      <path d="M18 14 L19 16" strokeWidth="1" />
      {/* Strike through */}
      <path d="M4 4 L20 20" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function RuneGrave({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Tombstone shape */}
      <path d="M6 22 L6 8 Q6 4 12 4 Q18 4 18 8 L18 22" />
      {/* Cross on tombstone */}
      <path d="M12 8 L12 16 M9 11 L15 11" strokeWidth="1" opacity="0.6" />
      {/* Ground line */}
      <path d="M4 22 L20 22" />
    </svg>
  )
}

function RuneChronicle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Open book/scroll */}
      <path d="M4 4 L4 20 Q8 18 12 20 Q16 18 20 20 L20 4 Q16 6 12 4 Q8 6 4 4 Z" />
      {/* Center binding */}
      <path d="M12 4 L12 20" />
      {/* Text lines */}
      <path d="M6 8 L10 8 M6 11 L9 11 M6 14 L10 14" strokeWidth="1" opacity="0.5" />
      <path d="M14 8 L18 8 M15 11 L18 11 M14 14 L18 14" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function RuneChurch({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Church building */}
      <path d="M4 22 L4 12 L12 6 L20 12 L20 22 Z" />
      {/* Steeple */}
      <path d="M12 6 L12 2" />
      <path d="M10 4 L14 4" strokeWidth="1" />
      {/* Door */}
      <path d="M9 22 L9 16 Q12 14 15 16 L15 22" />
      {/* Window */}
      <circle cx="12" cy="11" r="2" />
    </svg>
  )
}

function RuneQuill({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Feather quill */}
      <path d="M20 4 Q16 4 12 8 L4 16 L4 20 L8 20 L16 12 Q20 8 20 4 Z" />
      {/* Feather details */}
      <path d="M14 10 L18 6" strokeWidth="1" opacity="0.5" />
      <path d="M12 12 L16 8" strokeWidth="1" opacity="0.5" />
      {/* Ink drop */}
      <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ============================================
// GM Night Status Rune Badges - Mystical Symbols
// ============================================

function RuneTarget({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Outer mystical circle with runes */}
      <circle cx="12" cy="12" r="10" strokeDasharray="3 2" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="6" />
      {/* Center eye */}
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5" />
      {/* Cardinal rune marks */}
      <path d="M12 2 L12 5" />
      <path d="M12 19 L12 22" />
      <path d="M2 12 L5 12" />
      <path d="M19 12 L22 12" />
    </svg>
  )
}

function RuneShield({ className, title }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label={title}>
      <title>{title}</title>
      {/* Ancient shield shape */}
      <path d="M12 2 L4 6 L4 12 Q4 18 12 22 Q20 18 20 12 L20 6 Z" />
      {/* Protection rune - ward symbol */}
      <path d="M12 7 L12 15" strokeWidth="1.5" />
      <path d="M9 10 L15 10" strokeWidth="1.5" />
      <path d="M8 13 L10 11 M16 13 L14 11" strokeWidth="1" opacity="0.6" />
      {/* Corner ward marks */}
      <circle cx="12" cy="18" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function RuneFang({ className, title }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label={title}>
      <title>{title}</title>
      {/* Wolf fang / bite mark - mystical style */}
      <path d="M6 4 Q8 8 6 14 L8 12 L10 16 L12 10 L14 16 L16 12 L18 14 Q16 8 18 4" />
      {/* Blood drops - ancient symbol */}
      <path d="M8 18 Q8 20 10 20 Q10 18 8 18" fill="currentColor" opacity="0.5" />
      <path d="M14 17 Q14 19 16 19 Q16 17 14 17" fill="currentColor" opacity="0.5" />
      {/* Curse marks */}
      <path d="M4 6 L6 8 M18 8 L20 6" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

function RunePoison({ className, title }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label={title}>
      <title>{title}</title>
      {/* Poison vial / chalice */}
      <path d="M8 4 L8 8 Q4 12 6 18 Q8 22 12 22 Q16 22 18 18 Q20 12 16 8 L16 4" />
      <path d="M8 4 L16 4" />
      {/* Skull symbol inside - death rune */}
      <circle cx="12" cy="13" r="3" />
      <path d="M10 12 L10 13 M14 12 L14 13" strokeWidth="1" />
      <path d="M11 15 L13 15" strokeWidth="1" />
      {/* Poison bubbles */}
      <circle cx="9" cy="18" r="1" opacity="0.4" />
      <circle cx="15" cy="17" r="0.8" opacity="0.4" />
      {/* Vapor wisps */}
      <path d="M10 2 Q11 0 12 2 Q13 0 14 2" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function RuneHeal({ className, title }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-label={title}>
      <title>{title}</title>
      {/* Life/healing rune - ancient ankh-inspired */}
      <path d="M12 8 Q8 8 8 5 Q8 2 12 2 Q16 2 16 5 Q16 8 12 8" />
      <path d="M12 8 L12 22" />
      <path d="M8 12 L16 12" />
      {/* Healing energy rays */}
      <path d="M6 16 L8 14 M18 16 L16 14" strokeWidth="1" opacity="0.5" />
      <path d="M6 20 L9 18 M18 20 L15 18" strokeWidth="1" opacity="0.5" />
      {/* Life spark */}
      <circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ============================================
// Night Wizard Panel Rune Icons
// ============================================

function RuneNightMoon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Crescent moon */}
      <path d="M20 12 Q20 6 14 4 Q16 8 16 12 Q16 16 14 20 Q20 18 20 12" />
      {/* Stars */}
      <path d="M6 6 L7 8 L6 10 L5 8 Z" fill="currentColor" opacity="0.4" />
      <path d="M9 3 L9.5 4.5 L9 6 L8.5 4.5 Z" fill="currentColor" opacity="0.3" />
      <path d="M4 12 L5 13.5 L4 15 L3 13.5 Z" fill="currentColor" opacity="0.3" />
      {/* Mystical rays */}
      <path d="M8 18 L6 20" strokeWidth="1" opacity="0.4" />
      <path d="M10 20 L9 22" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

function RuneRitual({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Ritual circle */}
      <circle cx="12" cy="12" r="9" strokeDasharray="2 2" />
      {/* Inner pentagram hints */}
      <path d="M12 5 L14 10 L19 10 L15 14 L17 19 L12 16 L7 19 L9 14 L5 10 L10 10 Z" strokeWidth="1" opacity="0.5" />
      {/* Center eye */}
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  )
}

function RuneHand({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Mystical pointing hand */}
      <path d="M8 14 L8 8 Q8 6 10 6 L10 12" />
      <path d="M10 12 L10 5 Q10 3 12 3 L12 12" />
      <path d="M12 12 L12 5 Q12 3 14 3 L14 12" />
      <path d="M14 12 L14 6 Q14 4 16 4 L16 12" />
      {/* Palm */}
      <path d="M8 14 Q6 16 6 18 Q6 22 12 22 Q18 22 18 18 L18 12 L16 12" />
      {/* Eye in palm - mystical symbol */}
      <circle cx="12" cy="17" r="2" strokeWidth="1" opacity="0.5" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function RuneConfirm({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Mystical seal / confirmation rune */}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6" strokeDasharray="3 2" />
      {/* Ancient checkmark / approval symbol */}
      <path d="M8 12 L11 15 L16 9" strokeWidth="2" />
      {/* Corner rune marks */}
      <path d="M12 3 L12 5" strokeWidth="1" />
      <path d="M12 19 L12 21" strokeWidth="1" />
      <path d="M3 12 L5 12" strokeWidth="1" />
      <path d="M19 12 L21 12" strokeWidth="1" />
    </svg>
  )
}

function RuneSeerEye({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* All-seeing eye - mystical divination symbol */}
      <path d="M2 12 Q12 4 22 12 Q12 20 2 12" />
      {/* Iris */}
      <circle cx="12" cy="12" r="4" />
      {/* Pupil */}
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {/* Inner light */}
      <circle cx="13" cy="11" r="0.8" fill="white" opacity="0.6" />
      {/* Mystical rays above */}
      <path d="M12 2 L12 5" strokeWidth="1" />
      <path d="M8 3 L9 5.5" strokeWidth="1" opacity="0.6" />
      <path d="M16 3 L15 5.5" strokeWidth="1" opacity="0.6" />
      {/* Mystical rays below */}
      <path d="M12 19 L12 22" strokeWidth="1" />
      <path d="M8 21 L9 18.5" strokeWidth="1" opacity="0.6" />
      <path d="M16 21 L15 18.5" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

function RuneHealPotion({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Potion bottle */}
      <path d="M9 3 L9 7 Q5 10 5 15 Q5 20 12 20 Q19 20 19 15 Q19 10 15 7 L15 3" />
      <path d="M9 3 L15 3" />
      {/* Liquid level */}
      <path d="M7 13 Q12 11 17 13 L17 15 Q17 18 12 18 Q7 18 7 15 Z" fill="currentColor" opacity="0.3" />
      {/* Cross/plus symbol - healing */}
      <path d="M12 11 L12 16 M10 13.5 L14 13.5" strokeWidth="1.5" />
      {/* Sparkles */}
      <path d="M7 6 L8 7 M17 6 L16 7" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function RuneSleep({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Closed eyes - sleeping */}
      <path d="M4 10 Q8 13 12 10" />
      <path d="M12 10 Q16 13 20 10" />
      {/* Zzz symbols */}
      <path d="M16 4 L19 4 L16 7 L19 7" strokeWidth="1" />
      <path d="M18 8 L20 8 L18 10 L20 10" strokeWidth="1" opacity="0.7" />
      {/* Moon crescent */}
      <path d="M6 16 Q4 18 6 20 Q10 20 8 16 Q6 14 6 16" fill="currentColor" opacity="0.3" />
      {/* Stars */}
      <circle cx="14" cy="18" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="18" cy="16" r="0.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function RuneSunrise({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Horizon line */}
      <path d="M2 16 L22 16" />
      {/* Rising sun */}
      <path d="M6 16 Q6 10 12 10 Q18 10 18 16" />
      {/* Sun rays */}
      <path d="M12 6 L12 8" strokeWidth="1.5" />
      <path d="M7 8 L8.5 9.5" strokeWidth="1" />
      <path d="M17 8 L15.5 9.5" strokeWidth="1" />
      <path d="M4 12 L6 12" strokeWidth="1" />
      <path d="M18 12 L20 12" strokeWidth="1" />
      {/* Ground details */}
      <path d="M4 19 L8 19 M10 19 L14 19 M16 19 L20 19" strokeWidth="1" opacity="0.4" />
      {/* Light glow */}
      <circle cx="12" cy="13" r="2" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

function RuneSkullDead({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Skull shape */}
      <path d="M6 10 Q6 4 12 4 Q18 4 18 10 L18 14 Q18 16 16 16 L16 18 L14 18 L14 16 L10 16 L10 18 L8 18 L8 16 Q6 16 6 14 Z" />
      {/* Eye sockets */}
      <circle cx="9" cy="10" r="2" />
      <circle cx="15" cy="10" r="2" />
      {/* Nose */}
      <path d="M12 12 L11 14 L13 14 Z" fill="currentColor" opacity="0.5" />
      {/* Teeth */}
      <path d="M9 16 L9 18 M11 16 L11 18 M13 16 L13 18 M15 16 L15 18" strokeWidth="1" opacity="0.6" />
      {/* X eyes for dead */}
      <path d="M8 9 L10 11 M10 9 L8 11" strokeWidth="1" />
      <path d="M14 9 L16 11 M16 9 L14 11" strokeWidth="1" />
    </svg>
  )
}

function RuneExecute({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Executioner's axe */}
      <path d="M6 4 L6 20" strokeWidth="2" />
      {/* Axe head */}
      <path d="M6 6 Q14 4 16 8 Q18 12 14 14 Q10 16 6 14" fill="currentColor" opacity="0.2" />
      <path d="M6 6 Q14 4 16 8 Q18 12 14 14 Q10 16 6 14" />
      {/* Blade edge */}
      <path d="M8 7 Q12 6 14 9 Q15 11 13 13" strokeWidth="1" opacity="0.6" />
      {/* Blood drops */}
      <path d="M16 16 Q16 18 18 18 Q18 16 16 16" fill="currentColor" opacity="0.4" />
      <path d="M18 19 Q18 21 20 21 Q20 19 18 19" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function RuneHunterBow({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Bow curve */}
      <path d="M4 4 Q2 12 4 20" strokeWidth="2" />
      {/* Bow string */}
      <path d="M4 4 L4 20" strokeWidth="1" strokeDasharray="2 1" />
      {/* Arrow shaft */}
      <path d="M6 12 L20 12" />
      {/* Arrow head */}
      <path d="M18 10 L22 12 L18 14" fill="currentColor" opacity="0.4" />
      <path d="M18 10 L22 12 L18 14" />
      {/* Arrow fletching */}
      <path d="M6 10 L8 12 L6 14" strokeWidth="1" />
      <path d="M8 11 L10 12 L8 13" strokeWidth="1" opacity="0.6" />
      {/* Decorative runes on bow */}
      <circle cx="4" cy="8" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="4" cy="16" r="0.8" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

