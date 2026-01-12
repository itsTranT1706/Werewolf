/**
 * Login Page - Dark Ritual Entry
 * 
 * Ancient gateway into the cursed village.
 * Styled to match the dark medieval fantasy aesthetic.
 */

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, notify, BackButton } from '@/components/ui'
import { RuneUser, RuneLock, RuneWolf } from '@/components/ui/AncientIcons'
import { authApi } from '@/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setServerError('')
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.identifier) {
      newErrors.identifier = 'Vui lòng nhập email hoặc tên người dùng'
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    setServerError('')

    try {
      await authApi.login(formData.identifier, formData.password)
      notify.success('Chào mừng trở lại, lữ khách!', 'Đăng Nhập Thành Công')
      const redirectTo = searchParams.get('redirect') || '/game'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = error.message || 'Không thể vào làng. Vui lòng thử lại.'
      setServerError(message)
      notify.error(message, 'Đăng Nhập Thất Bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Back button */}
      <div className="mb-6">
        <BackButton to="/home" label="Trở Về Cổng" />
      </div>

      <MedievalPanel className="w-full">
        {/* Panel header */}
        <div className="text-center mb-8">
          {/* Wolf sigil */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-20 h-20 flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(139,115,85,0.15) 0%, transparent 70%)',
              }}
            >
              <RuneWolf className="w-16 h-16 text-[#8b7355] opacity-70" />
            </div>
          </div>
          
          <h2 className="font-medieval text-3xl tracking-wider theme-title">
            Bước Vào Làng
          </h2>
          <p className="font-fantasy text-sm mt-2 tracking-wide theme-subtitle">
            Đắm trong bóng tối những bí mật...
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div 
            className="mb-6 p-4 text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(139,0,0,0.15) 0%, rgba(80,0,0,0.2) 100%)',
              border: '1px solid rgba(139,0,0,0.4)',
            }}
          >
            <p className="font-fantasy text-sm" style={{ color: '#a05050' }}>
              {serverError}
            </p>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <MedievalInput
            type="text"
            name="identifier"
            placeholder="Email hoặc Tên người dùng"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            icon={<RuneUser className="w-5 h-5" />}
            autoComplete="username"
          />

          <MedievalInput
            type="password"
            name="password"
            placeholder="Mật khẩu bí mật"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<RuneLock className="w-5 h-5" />}
            autoComplete="current-password"
          />

          <div className="pt-3">
            <MedievalButton
              type="submit"
              loading={loading}
              className="w-full"
            >
              Vào Làng
            </MedievalButton>
          </div>
        </form>

        <Divider text="hoặc" />

        {/* Register link */}
        <div className="text-center">
          <p className="font-fantasy text-sm text-[#6a5a4a]">
            Mới đến làng?{' '}
            <Link 
              to="/register" 
              className="font-semibold theme-link"
            >
              Tham Gia Cuộc Săn
            </Link>
          </p>
        </div>
      </MedievalPanel>
    </div>
  )
}
