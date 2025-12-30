import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MedievalPanel, MedievalInput, MedievalButton, Divider, notify } from '@/components/ui'
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
      newErrors.identifier = 'Email or username is required'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      notify.success('Welcome back, traveler!', 'Login Successful')
      navigate('/game')
    } catch (error) {
      const message = error.message || 'Failed to enter the village. Try again.'
      setServerError(message)
      notify.error(message, 'Login Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MedievalPanel className="w-full max-w-md">
      {/* Panel header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <WolfIcon className="w-16 h-16 text-gold opacity-80" />
        </div>
        <h2 className="font-medieval text-2xl text-gold-glow tracking-wide">
          Enter the Village
        </h2>
        <p className="font-fantasy text-parchment/60 text-sm mt-1">
          The night is dark and full of secrets
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
          placeholder="Email or Username"
          value={formData.identifier}
          onChange={handleChange}
          error={errors.identifier}
          icon={<UserIcon className="w-5 h-5" />}
          autoComplete="username"
        />

        <MedievalInput
          type="password"
          name="password"
          placeholder="Secret Password"
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
            Enter
          </MedievalButton>
        </div>
      </form>

      <Divider text="or" />

      {/* Register link */}
      <div className="text-center">
        <p className="font-fantasy text-parchment/70 text-sm">
          New to the village?{' '}
          <Link to="/register" className="link-fantasy font-semibold">
            Join the Hunt
          </Link>
        </p>
      </div>
    </MedievalPanel>
  )
}

// Icons
function WolfIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <path d="M32 4c-2 0-4 1-6 3l-4 6-8-2c-2 0-3 1-3 3l2 10-6 8c-1 2 0 4 2 5l8 4v12c0 2 1 4 3 5l10 4c1 0 2 0 4-1l10-4c2-1 3-3 3-5V41l8-4c2-1 3-3 2-5l-6-8 2-10c0-2-1-3-3-3l-8 2-4-6c-2-2-4-3-6-3zm-8 24a3 3 0 110 6 3 3 0 010-6zm16 0a3 3 0 110 6 3 3 0 010-6zm-8 10c2 0 4 2 4 4h-8c0-2 2-4 4-4z"/>
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
