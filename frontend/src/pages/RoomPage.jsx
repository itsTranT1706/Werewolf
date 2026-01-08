/**
 * Room Page - Lobby và bắt đầu game
 * UI mới với thiết kế medieval
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameApi } from '@/api'
import { getSocket } from '@/api/socket'
import { getRoomSocket } from '@/api/roomSocket'
import RoleSetupModal from '@/components/game/RoleSetupModal'
import { ROLES, FACTION_NAMES } from '@/constants/roles'
import { notify } from '@/components/ui'
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
    const [currentRoomId, setCurrentRoomId] = useState(null) // Room ID (UUID) từ backend
    const [currentPlayerId, setCurrentPlayerId] = useState(null) // Player ID của user hiện tại
    const [currentDisplayname, setCurrentDisplayname] = useState(null) // Displayname của user hiện tại

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

            setMaxPlayers(room.maxPlayers || 12)
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

            // Check host: Chỉ update isHost nếu myPlayerId được truyền vào (từ ROOM_JOINED)
            // Để tránh reset isHost khi PLAYER_JOINED event được trigger
            if (myPlayerId != null) { // Use loose equality to check both null and undefined
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

        // Gửi START_GAME event qua room socket với roleSetup
        roomSocket.emit('START_GAME', {
            roleSetup: setup // Gửi roleSetup để gameplay service sử dụng
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
                                            Phòng {roomCode || roomId || 'Không xác định'}
                                        </h1>
                                        <p className="text-gold-dim text-lg font-serif italic flex items-center gap-2 mt-2">
                                            <span className="material-symbols-outlined text-base">forest</span>
                                            Rừng Tối
                                            <span className="mx-2 text-wood-light text-xs">◆</span>
                                            <span className="text-parchment-text font-bold">{players.length}/{maxPlayers || 75}</span> Linh Hồn Hiện Diện
                                        </p>
                                    </div>
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => setShareOpen((prev) => !prev)}
                                    >
                                        <div className="absolute inset-0 bg-blood-red/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                        <div className="flex items-center gap-4 bg-wood-dark border border-wood-light px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative">
                                            <div className="absolute -top-3 -right-3 size-8 rounded-full bg-blood-red border-2 border-blood-dried shadow-md flex items-center justify-center z-20">
                                                <span className="material-symbols-outlined text-white/80 text-xs">share</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gold-dim uppercase font-bold tracking-[0.2em]">Mã Triệu Hồi</span>
                                                <span className="font-heading text-2xl text-parchment-text tracking-widest">{roomCode || roomId || '8291'}</span>
                                            </div>
                                            <div className="h-8 w-[1px] bg-wood-light/50 mx-1"></div>
                                            <span
                                                className="material-symbols-outlined text-parchment-text/50 group-hover:text-parchment-text transition-colors cursor-pointer"
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    navigator.clipboard.writeText(roomCode || roomId || '8291')
                                                    notify.success('Room code copied', 'Share')
                                                }}
                                            >sao chép</span>
                                        </div>
                                        {shareOpen && joinLink && (
                                            <div className="absolute right-0 top-full mt-4 w-[340px] bg-wood-dark border border-wood-light/70 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] z-30">
                                                <div className="flex items-center gap-4">
                                                    {qrUrl && (
                                                        <img
                                                            src={qrUrl}
                                                            alt="Room QR"
                                                            className="w-36 h-36 rounded border border-gold/40 bg-black/40 p-1"
                                                        />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-parchment-text/70 text-xs uppercase tracking-[0.2em] mb-2">
                                                            Share Link
                                                        </p>
                                                        <a
                                                            href={joinLink}
                                                            className="block text-gold-dim text-xs break-all underline"
                                                        >
                                                            {joinLink}
                                                        </a>
                                                        <button
                                                            onClick={(event) => {
                                                                event.stopPropagation()
                                                                handleCopyLink()
                                                            }}
                                                            className="mt-3 px-3 py-1.5 bg-gold/80 text-wood-dark text-xs font-bold uppercase tracking-wider border border-gold-dark hover:bg-gold transition-colors"
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

                            {/* Players Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                                {players.map((player, index) => {
                                    const status = getPlayerStatus(player)
                                    const role = getPlayerRole(player)
                                    const elder = isElder(player)

                                    return (
                                        <div
                                            key={player.id || player.userId || index}
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

                            {/* Debug Info (tạm thời để debug) */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 p-4 bg-black/50 border border-yellow-500 rounded text-xs text-yellow-300">
                                    <p>🔍 DEBUG INFO:</p>
                                    <p>isHost: {String(isHost)}</p>
                                    <p>hostId: {String(hostId)}</p>
                                    <p>currentUserId: {String(currentUserId)}</p>
                                    <p>gameStarted: {String(gameStarted)}</p>
                                    <p>players.length: {players.length}</p>
                                    <p>Should show button: {String(!gameStarted && isHost)}</p>
                                </div>
                            )}

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
                playerCount={Math.max(1, players.length - 1)} // Trừ host ra (host sẽ nhận role MODERATOR)
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
