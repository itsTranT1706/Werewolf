/**
 * Register Page - Ancient Covenant Signing
 * 
 * Join the cursed village by signing the ancient scroll.
 * Styled to match the dark medieval fantasy aesthetic.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, BackButton, notify } from '@/components/ui'
import { RuneUser, RuneLock, RuneMail, RuneShield, RuneScroll } from '@/components/ui/AncientIcons'
import { authApi } from '@/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên người dùng'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Chỉ được dùng chữ cái, số và dấu gạch dưới'
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp'
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
      await authApi.register({ 
        email: formData.email, 
        username: formData.username, 
        password: formData.password 
      })
      notify.success('Giao ước đã được kết!', 'Đăng Ký Thành Công')
      navigate('/login', { state: { registered: true } })
    } catch (error) {
      const message = error.original?.response?.data?.error || 'Không thể gia nhập làng. Vui lòng thử lại.'
      setServerError(message)
      notify.error(message, 'Đăng Ký Thất Bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Back button */}
      <div className="mb-6">
        <BackButton to="/" label="Trở Về Cổng" />
      </div>

      <MedievalPanel className="w-full">
        {/* Panel header */}
        <div className="text-center mb-8">
          {/* Scroll sigil */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-20 h-20 flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(139,115,85,0.15) 0%, transparent 70%)',
              }}
            >
              <RuneScroll className="w-14 h-14 text-[#8b7355] opacity-70" />
            </div>
          </div>
          
          <h2 className="font-medieval text-3xl tracking-wider theme-title">
            Tham Gia Cuộc Săn
          </h2>
          <p className="font-fantasy text-sm mt-2 tracking-wide theme-subtitle">
            Ký vào cuộn giấy cổ để bước vào...
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

        {/* Register form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <MedievalInput
            type="email"
            name="email"
            placeholder="Email của bạn"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<RuneMail className="w-5 h-5" />}
            autoComplete="email"
          />

          <MedievalInput
            type="text"
            name="username"
            placeholder="Chọn tên người dùng"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
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
            autoComplete="new-password"
          />

          <MedievalInput
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={<RuneShield className="w-5 h-5" />}
            autoComplete="new-password"
          />

          <div className="pt-3">
            <MedievalButton
              type="submit"
              loading={loading}
              className="w-full"
            >
              Ký Vào Cuộn Giấy
            </MedievalButton>
          </div>
        </form>

        <Divider text="hoặc" />

        {/* Login link */}
        <div className="text-center">
          <p className="font-fantasy text-sm text-[#6a5a4a]">
            Đã là dân làng?{' '}
            <Link 
              to="/login" 
              className="font-semibold theme-link"
            >
              Bước Vào Làng
            </Link>
          </p>
        </div>
      </MedievalPanel>
    </div>
  )
}
