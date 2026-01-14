/**
 * Profile Tab - Fantasy RPG Character Sheet Style
 * 
 * A tab-based profile view with inline editing.
 * Feels like viewing/editing an ancient hero's record.
 */

import { useState, useEffect } from 'react'
import { profileApi, authApi } from '@/api'
import { notify } from '@/components/ui'
import ProfileBanner from './ProfileBanner'
import ProfileStats from './ProfileStats'
import ProfileInfo from './ProfileInfo'
import RankPanel from './RankPanel'

export default function ProfileTab({ onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await profileApi.getMe()
      const profileData = data.result || data
      setProfile(profileData)
      setEditData({
        displayName: profileData.displayName || '',
        username: profileData.username || '',
        email: profileData.email || '',
        avatarUrl: profileData.avatarUrl || '',
      })
    } catch (err) {
      setError(err.message || 'Failed to load profile')
      notify.error('Không thể tải hồ sơ của bạn')
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel - restore original data
      setEditData({
        displayName: profile.displayName || '',
        username: profile.username || '',
        email: profile.email || '',
        avatarUrl: profile.avatarUrl || '',
      })
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await profileApi.updateMe(editData)
      const updatedProfile = response.result || response
      setProfile(prev => ({ ...prev, ...updatedProfile }))
      setIsEditing(false)
      notify.success('Hồ sơ đã được cập nhật!', 'Lưu Thành Công')
    } catch (err) {
      notify.error(err.message || 'Không thể lưu thay đổi', 'Lưu Thất Bại')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    notify.info('Hẹn gặp lại, lữ khách...', 'Tạm Biệt')
    onLogout?.()
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <ProfileError
        message={error}
        onRetry={loadProfile}
      />
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Profile Banner - Full width */}
      <ProfileBanner
        profile={profile}
        isEditing={isEditing}
        editData={editData}
        onEditToggle={handleEditToggle}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onCancel={handleEditToggle}
        saving={saving}
      />

      {/* Two column layout: Main content + Rank sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Left column - Stats and Info (65-70%) */}
        <div className="flex-1 lg:w-2/3 space-y-6">
          {/* Stats Section */}
          <ProfileStats profile={profile} />

          {/* Profile Info Panel */}
          <ProfileInfo
            profile={profile}
            isEditing={isEditing}
            editData={editData}
            onInputChange={handleInputChange}
            onLogout={handleLogout}
          />
        </div>

        {/* Right column - Rank Panel (30-35%) */}
        <div className="lg:w-1/3">
          <RankPanel
            rank={{
              mode: 'Ranked Solo/Duo',
              tier: getRankTier(profile?.totalPoint),
              division: getRankDivision(profile?.totalPoint),
              lp: profile?.totalPoint % 100 || 0,
              wins: profile?.winMatch || 0,
              losses: profile?.loseMatch || 0,
            }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate rank tier based on total points
 */
function getRankTier(points) {
  if (!points || points < 100) return 'Grandmaster'
  if (points < 400) return 'Iron'
  if (points < 800) return 'Bronze'
  if (points < 1200) return 'Silver'
  if (points < 1600) return 'Gold'
  if (points < 2000) return 'Platinum'
  if (points < 2400) return 'Diamond'
  if (points < 2800) return 'Master'
  if (points < 3200) return 'Grandmaster'
  return 'Challenger'
}

/**
 * Calculate rank division based on total points
 */
function getRankDivision(points) {
  if (!points || points < 100) return ''
  const tierPoints = points % 400
  if (tierPoints < 100) return 'IV'
  if (tierPoints < 200) return 'III'
  if (tierPoints < 300) return 'II'
  return 'I'
}

/**
 * Loading skeleton
 */
function ProfileSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto animate-pulse">
      {/* Banner skeleton */}
      <div className="relative h-64 rounded-lg overflow-hidden bg-stone-dark/50 border-2 border-gold/20">
        <div className="absolute bottom-6 left-6 flex items-end gap-6">
          <div className="w-32 h-32 rounded-lg bg-stone-dark/70" />
          <div className="space-y-2 pb-2">
            <div className="h-8 w-48 bg-stone-dark/70 rounded" />
            <div className="h-4 w-32 bg-stone-dark/50 rounded" />
          </div>
        </div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-stone-dark/30 rounded-lg border border-gold/10" />
        ))}
      </div>
    </div>
  )
}

/**
 * Error state
 */
function ProfileError({ message, onRetry }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className="p-12 text-center rounded-lg border-2"
        style={{
          background: 'linear-gradient(180deg, rgba(30,20,15,0.95) 0%, rgba(20,15,10,0.98) 100%)',
          borderColor: 'rgba(139, 0, 0, 0.4)',
        }}
      >
        <div className="text-6xl mb-4">⚠</div>
        <h3 className="font-medieval text-xl text-blood-red mb-2">
          Không Thể Truy Cập Hồ Sơ
        </h3>
        <p className="font-fantasy text-parchment/60 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 font-fantasy text-parchment bg-gradient-to-b from-wood-light to-wood-dark border-2 border-gold/40 hover:border-gold transition-colors"
        >
          Thử Lại
        </button>
      </div>
    </div>
  )
}
