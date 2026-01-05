import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, BackButton } from '@/components/ui'
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
      await authApi.register({ email: formData.email, username: formData.username, password: formData.password })
      // Redirect to login after successful registration
      navigate('/login', { state: { registered: true } })
    } catch (error) {
      console.log(error.original?.response?.data?.error)
      const message = error.original?.response?.data?.error || 'Không thể gia nhập làng. Vui lòng thử lại.'
      setServerError(message)
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
          Tham Gia Cuộc Săn
        </h2>
        <p className="font-fantasy text-parchment/60 text-sm mt-1">
          Ký vào cuộn giấy cổ để bước vào
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 p-3 bg-blood-red/20 border border-blood-red/50 text-gold text-sm font-fantasy text-center">
          {serverError}
        </div>
      )}

      {/* Register form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <MedievalInput
          type="email"
          name="email"
          placeholder="Email của bạn"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<MailIcon className="w-5 h-5" />}
          autoComplete="email"
        />

        <MedievalInput
          type="text"
          name="username"
          placeholder="Chọn tên người dùng"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
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
          autoComplete="new-password"
        />

        <MedievalInput
          type="password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<ShieldIcon className="w-5 h-5" />}
          autoComplete="new-password"
        />

        <div className="pt-2">
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
        <p className="font-fantasy text-parchment/70 text-sm">
          Đã là dân làng?{' '}
          <Link to="/login" className="link-fantasy font-semibold">
            Bước Vào Làng
          </Link>
        </p>
      </div>
      </MedievalPanel>
    </div>
  )
}

// Icons
function ScrollIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <path d="M12 8c-2 0-4 2-4 4v40c0 2 2 4 4 4h4V12H12zm8 0v48h28c2 0 4-2 4-4V12c0-2-2-4-4-4H20zm4 8h20v4H24v-4zm0 8h20v4H24v-4zm0 8h16v4H24v-4z" />
    </svg>
  )
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

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

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
