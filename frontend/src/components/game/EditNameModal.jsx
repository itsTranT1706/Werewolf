/**
 * Edit Name Modal - Cho phép người chơi chỉnh sửa tên trong phòng
 */

import { useState, useEffect } from 'react'
import { RuneUser, RuneCheck } from '@/components/ui/AncientIcons'

export default function EditNameModal({ isOpen, onClose, currentName, onSave }) {
    const [newName, setNewName] = useState(currentName || '')
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setNewName(currentName || '')
            setError('')
        }
    }, [isOpen, currentName])

    const handleSave = () => {
        // Validate
        const trimmedName = newName.trim()

        if (!trimmedName) {
            setError('Tên không được để trống')
            return
        }

        if (trimmedName.length > 50) {
            setError('Tên không được dài quá 50 ký tự')
            return
        }

        if (trimmedName === currentName) {
            setError('Vui lòng nhập tên mới')
            return
        }

        onSave(trimmedName)
        onClose()
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-600/50 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 animate-fadeIn">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <RuneUser className="w-6 h-6 text-amber-500" />
                    <h2 className="text-xl font-bold text-amber-100">Chỉnh sửa tên</h2>
                </div>

                {/* Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-amber-200/80 mb-2">
                        Tên hiển thị
                    </label>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => {
                            setNewName(e.target.value)
                            setError('')
                        }}
                        onKeyPress={handleKeyPress}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-amber-600/30 rounded text-amber-100 placeholder-amber-300/30 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        placeholder="Nhập tên mới..."
                        autoFocus
                        maxLength={50}
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-400">{error}</p>
                    )}
                    <p className="mt-1 text-xs text-amber-300/50">
                        {newName.length}/50 ký tự
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-amber-100 rounded transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded font-semibold flex items-center gap-2 transition-colors"
                    >
                        <RuneCheck className="w-4 h-4" />
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    )
}
