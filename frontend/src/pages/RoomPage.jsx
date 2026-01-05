/**
 * Room Page - Lobby và bắt đầu game
 * Hiển thị danh sách players và cho phép bắt đầu game để phân vai trò
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { gameApi } from '@/api'
import { getSocket } from '@/api/socket'
import MedievalButton from '@/components/ui/MedievalButton'
import RoleSetupModal from '@/components/game/RoleSetupModal'

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
    const [showRoleSetup, setShowRoleSetup] = useState(false)
    const [roleSetup, setRoleSetup] = useState(null)
    const [roleAssignment, setRoleAssignment] = useState(null) // Danh sách vai đã xáo cho quản trò
    const [maxPlayers, setMaxPlayers] = useState(12) // Số người chơi tối đa khi tạo phòng
    const [availableRoles, setAvailableRoles] = useState(null) // Các role đã chọn khi tạo phòng
    const [showRoleWheel, setShowRoleWheel] = useState(false) // Hiển thị vòng quay khi phân vai trò

    // Get current user ID
    useEffect(() => {
        // Lấy userId từ token hoặc localStorage
        try {
            const token = localStorage.getItem('token')
            if (token) {
                // Decode JWT để lấy userId (simple decode, không verify)
                const payload = JSON.parse(atob(token.split('.')[1]))
                setCurrentUserId(payload.userId || payload.id || 'current-user')
            }
        } catch (err) {
            console.warn('Could not get userId from token:', err)
            setCurrentUserId('test-user-' + Date.now())
        }
    }, [])

    // Check socket connection
    useEffect(() => {
        const socket = getSocket()
        setSocketConnected(socket.connected)

        const onConnect = () => {
            console.log('✅ Socket connected')
            setSocketConnected(true)
        }

        const onDisconnect = () => {
            console.log('❌ Socket disconnected')
            setSocketConnected(false)
        }

        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
        }
    }, [])

    // Mock players data (thay bằng API call thực tế)
    useEffect(() => {
        // TODO: Lấy danh sách players từ room API
        // Tạm thời dùng mock data để test
        const mockPlayers = [
            { userId: currentUserId || 'user1', username: 'Bạn (Current User)' },
            { userId: 'user2', username: 'Player2' },
            { userId: 'user3', username: 'Player3' },
            { userId: 'user4', username: 'Player4' },
            { userId: 'user5', username: 'Player5' },
            { userId: 'user6', username: 'Player6' },
            { userId: 'user7', username: 'Player7' },
            { userId: 'user8', username: 'Player8' }
        ]
        setPlayers(mockPlayers)
    }, [roomId, currentUserId])

    // Listen for role assignment và game events
    useEffect(() => {
        // Listen for role assignment
        const unsubscribeRole = gameApi.onRoleAssigned((data) => {
            console.log('🎭 Nhận vai trò:', data)
            setMyRole(data)

            // Update faction for chat
            gameApi.updateFaction(roomId, data.faction)
        })

        // Listen for game started
        const unsubscribeStarted = gameApi.onGameStarted((data) => {
            console.log('🎮 Game đã bắt đầu!', data)
            setGameStarted(true)
        })

        // Listen for errors
        const unsubscribeError = gameApi.onGameStartError((error) => {
            console.error('❌ Lỗi:', error.message)
            setError(error.message)
            setLoading(false)
        })

        // Listen for role assignment list (cho quản trò)
        const unsubscribeRoleList = gameApi.onRoleAssignmentList((data) => {
            console.log('📋 Danh sách vai trò đã xáo:', data)
            setRoleAssignment(data.assignment)
            setLoading(false)
        })

        // Cleanup
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

        // Mở modal chọn bộ vai trò
        setShowRoleSetup(true)
    }

    const handleRoleSetupConfirm = (setup) => {
        setRoleSetup(setup)
        setShowRoleSetup(false)
        setError(null)
        setLoading(true)

        console.log('🎮 Starting game with role setup:', setup)

        // Start game với danh sách players, role setup và availableRoles
        try {
            gameApi.startGame(roomId, players, setup, availableRoles)
            console.log('✅ GAME_START event đã được gửi với role setup và availableRoles:', availableRoles)
        } catch (err) {
            console.error('❌ Error starting game:', err)
            setError('Lỗi khi bắt đầu game: ' + err.message)
            setLoading(false)
        }
    }

    const getFactionColor = (faction) => {
        switch (faction) {
            case 'WEREWOLF':
                return 'text-red-400'
            case 'VILLAGER':
                return 'text-green-400'
            case 'NEUTRAL':
                return 'text-yellow-400'
            default:
                return 'text-parchment'
        }
    }

    return (
        <div className="min-h-screen bg-midnight text-parchment-text p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="font-heading text-4xl text-parchment-text mb-2">
                            Room: {roomId || 'Unknown'}
                        </h1>
                        <p className="text-gold-dim">
                            {players.length} / {maxPlayers || 75} Players
                        </p>
                    </div>
                    <Link
                        to="/game"
                        className="px-4 py-2 bg-wood-dark border border-wood-light rounded-lg text-parchment-text hover:bg-wood-light transition-colors"
                    >
                        ← Quay lại
                    </Link>
                </div>

                {/* Socket Status */}
                <div className={`mb-4 p-3 rounded-lg border ${socketConnected ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'}`}>
                    <p className="text-sm">
                        Socket: <span className={socketConnected ? 'text-green-400' : 'text-red-400'}>
                            {socketConnected ? '✅ Connected' : '❌ Disconnected'}
                        </span>
                        {currentUserId && (
                            <span className="ml-4 text-parchment-text/60">
                                User ID: {currentUserId}
                            </span>
                        )}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-blood-dried border border-blood-red rounded-lg">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* My Role Display */}
                {myRole && (
                    <div className="mb-8 p-6 bg-wood-dark border-2 border-gold-dim rounded-lg shadow-lg">
                        <h2 className="font-heading text-2xl text-gold-dim mb-4">
                            🎭 Vai Trò Của Bạn
                        </h2>
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-parchment-text">
                                {myRole.roleName}
                            </p>
                            <p className={`text-lg font-semibold ${getFactionColor(myRole.faction)}`}>
                                Phe: {myRole.faction}
                            </p>
                            <p className="text-sm text-parchment-text/70">
                                Role ID: {myRole.role}
                            </p>
                        </div>
                    </div>
                )}

                {/* Players List */}
                <div className="mb-8">
                    <h2 className="font-heading text-2xl text-parchment-text mb-4">
                        Danh Sách Người Chơi
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {players.map((player, index) => (
                            <div
                                key={player.userId}
                                className="p-4 bg-wood-dark border border-wood-light rounded-lg"
                            >
                                <p className="font-heading text-parchment-text">
                                    {player.username}
                                </p>
                                <p className="text-sm text-parchment-text/60">
                                    {player.userId}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start Game Button */}
                {!gameStarted && (
                    <div className="flex justify-center">
                        <MedievalButton
                            onClick={handleStartGame}
                            disabled={loading || players.length < 3 || players.length > 75 || (maxPlayers && players.length > maxPlayers)}
                            className="px-8 py-4 text-lg"
                        >
                            {loading ? 'Đang khởi tạo...' : 'Bắt Đầu Game'}
                        </MedievalButton>
                    </div>
                )}

                {/* Role Assignment List (cho quản trò) */}
                {roleAssignment && roleAssignment.length > 0 && (
                    <div className="mb-8 p-6 bg-wood-dark border-2 border-gold-dim rounded-lg">
                        <h2 className="font-heading text-2xl text-gold-dim mb-4">
                            📋 Danh Sách Vai Trò Đã Xáo
                        </h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {roleAssignment.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-wood-light/30 rounded border border-wood-light">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gold-dim font-bold w-8">#{index + 1}</span>
                                        <span className="font-heading text-parchment-text">{item.player?.username || item.player?.userId || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded font-bold text-sm ${item.faction === 'WEREWOLF' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
                                            }`}>
                                            {item.roleName || item.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Game Started Message */}
                {gameStarted && (
                    <div className="text-center p-6 bg-wood-dark border border-gold-dim rounded-lg">
                        <p className="text-xl text-gold-dim font-heading">
                            🎮 Game đã bắt đầu!
                        </p>
                        <p className="text-parchment-text/70 mt-2">
                            Kiểm tra vai trò của bạn ở phía trên
                        </p>
                    </div>
                )}

                {/* Role Setup Modal */}
                <RoleSetupModal
                    isOpen={showRoleSetup}
                    onClose={() => setShowRoleSetup(false)}
                    playerCount={players.length}
                    onConfirm={handleRoleSetupConfirm}
                    initialSetup={roleSetup}
                    availableRoles={availableRoles}
                />

                {/* Debug Info */}
                <div className="mt-8 p-4 bg-wood-dark/50 border border-wood-light rounded-lg">
                    <h3 className="font-heading text-lg mb-2">Debug Info</h3>
                    <pre className="text-xs text-parchment-text/60 overflow-auto">
                        {JSON.stringify({ roomId, playersCount: players.length, myRole }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    )
}