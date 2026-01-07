import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, notify, BackButton } from '@/components/ui'
import { authApi } from '@/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    identifier: '', // email or username
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
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
      navigate('/game')
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
      <div className="mb-4">
        <BackButton to="/" label="Trở Về Trang Chủ" />
      </div>

      <MedievalPanel className="w-full">
        {/* Panel header */}
        <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <img 
            src="/assets/ui/wolf-icon.svg" 
            alt="Wolf" 
            className="w-16 h-16 opacity-80"
            style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(61%) saturate(400%) hue-rotate(359deg) brightness(95%) contrast(92%)' }}
          />
        </div>
        <h2 className="font-medieval text-2xl text-gold-glow tracking-wide">
          Bước Vào Làng
        </h2>
        <p className="font-fantasy text-parchment/60 text-sm mt-1">
          Đêm tối đầy những bí mật
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 p-3 bg-blood-red/20 border border-blood-red/50 text-gold text-sm font-fantasy text-center">
          {serverError}
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <MedievalInput
          type="text"
          name="identifier"
          placeholder="Email hoặc Tên người dùng"
          value={formData.identifier}
          onChange={handleChange}
          error={errors.identifier}
          icon={<UserIcon className="w-5 h-5" />}
          autoComplete="username"
        />

        <MedievalInput
          type="password"
          name="password"
          placeholder="Mật khẩu bí mật"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<LockIcon className="w-5 h-5" />}
          autoComplete="current-password"
        />

        <div className="pt-2">
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
        <p className="font-fantasy text-parchment/70 text-sm">
          Mới đến làng?{' '}
          <Link to="/register" className="link-fantasy font-semibold">
            Tham Gia Cuộc Săn
          </Link>
        </p>
      </div>
      </MedievalPanel>
    </div>
  )
}

// Icons
function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}
