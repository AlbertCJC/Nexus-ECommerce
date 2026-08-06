import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { XMarkIcon, UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { addToast } from '../../context/AppContext'

export function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { signUp, signIn, signOut, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState(initialMode)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
      setErrors({})
    }
  }, [isOpen, initialMode])

  const validateForm = () => {
    const newErrors = {}
    if (mode === 'register') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    } else if (mode === 'forgot-password') {
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    } else {
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      if (!formData.password) newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      console.log('AuthModal: calling resetPassword for', formData.email)
      const result = await resetPassword(formData.email)
      console.log('AuthModal: resetPassword result:', result)
      if (result.error) {
        console.log('AuthModal: resetPassword error:', result.error.message)
        addToast({ type: 'error', message: result.error.message })
      } else {
        console.log('AuthModal: resetPassword success')
        addToast({ type: 'success', message: 'Password reset link sent! Check your email.' })
        setMode('login')
        setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
        setErrors({})
      }
    } catch (err) {
      console.error('AuthModal: resetPassword exception:', err)
      addToast({ type: 'error', message: err.message || 'Failed to send reset link' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      let error
      if (mode === 'login') {
        const result = await signIn(formData.email, formData.password)
        error = result.error
      } else {
        const result = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName,
        })
        error = result.error
      }

      if (error) {
        addToast({ type: 'error', message: error.message })
      } else {
        onClose()
        addToast({ type: 'success', message: mode === 'login' ? 'Welcome back!' : 'Account created successfully!' })

        // Handle post-login redirect
        const redirectTo = sessionStorage.getItem('postLoginRedirect')
        if (redirectTo) {
          sessionStorage.removeItem('postLoginRedirect')
          navigate(redirectTo)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4 bg-[rgb(var(--bg-deep))/0.9] backdrop-blur-sm animate-fade-in">
      <div className="modal-content w-full max-w-md max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={mode === 'forgot-password' ? handleForgotPassword : handleSubmit} className="space-y-4">

          {mode === 'forgot-password' && (
            <p className="text-sm text-[rgb(var(--text-secondary))] text-center mb-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          )}

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label">First Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
                  <input
                    id="firstName"
                    type="text"
                    className={`input pl-10 ${errors.firstName ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
                  <input
                    id="lastName"
                    type="text"
                    className={`input pl-10 ${errors.lastName ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.lastName}</p>}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Email</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
              <input
                id="email"
                type="email"
                className={`input pl-10 ${errors.email ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                autoComplete={mode === 'login' ? 'email' : 'email'}
              />
            </div>
            {errors.email && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.email}</p>}
          </div>

          {/* Password field - hidden for forgot-password mode */}
          {mode !== 'forgot-password' && (
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
                <input
                  id="password"
                  type="password"
                  className={`input pl-10 ${errors.password ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
              {errors.password && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Confirm Password - only for register mode */}
          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
                <input
                  id="confirmPassword"
                  type="password"
                  className={`input pl-10 ${errors.confirmPassword ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {mode === 'forgot-password' ? 'Sending...' : mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'forgot-password' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'forgot-password' ? (
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrors({})
                setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
              }}
              className="text-[rgb(var(--accent-primary))] hover:underline font-medium"
            >
              Back to Login
            </button>
          ) : (
            <>
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setErrors({})
                  }}
                  className="text-[rgb(var(--accent-primary))] hover:underline font-medium"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
              {mode === 'login' && (
                <p className="mt-3 text-sm text-[rgb(var(--text-secondary))]">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password')
                      setErrors({})
                      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
                    }}
                    className="text-[rgb(var(--accent-primary))] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </p>
              )}
            </>
          )}
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-[rgb(var(--bg-elevated))] rounded-lg border border-[rgb(var(--border-subtle))]">
          <p className="text-xs text-[rgb(var(--text-muted))] text-center">
            <strong>Demo:</strong> Register a new account, or use admin credentials for admin access.
          </p>
        </div>
      </div>
    </div>
  )
}