import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { addToast, useAppContext } from '../../context/AppContext'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { openAuthModal } = useAppContext()
  const searchParamsResult = useSearchParams()
  const searchParams = Array.isArray(searchParamsResult) ? searchParamsResult[0] : searchParamsResult
  const { updatePassword } = useAuth()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying reset link...')
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const checkRecoveryType = async () => {
      try {
        console.log('ResetPassword: useSearchParams hook called')
        const type = searchParams.get('type')
        const code = searchParams.get('code')

        console.log('ResetPassword: searchParams:', { type, code })

        // If no code/type in URL, it might be a direct navigation or the session is already established
        // Supabase with detectSessionInUrl: true should handle the code automatically
        if (!code || type !== 'recovery') {
          console.log('ResetPassword: no valid recovery code, checking existing session')
          // Check if we have a session already (user clicked link and was redirected)
          try {
            const { data } = await supabase.auth.getSession()
            console.log('ResetPassword: getSession data:', data)
            const session = data?.session
            console.log('ResetPassword: getSession result:', session?.user?.id || 'no session')
            if (session?.user) {
              // Session exists, show the password form
              setStatus('ready')
              setMessage('Enter your new password')
            } else {
              setStatus('error')
              setMessage('Invalid or expired reset link. Please request a new one.')
            }
          } catch (err) {
            console.error('ResetPassword: getSession error:', err)
            setStatus('error')
            setMessage('An error occurred. Please try requesting a new reset link.')
          }
          return
        }

        // Exchange the code for a session (Supabase does this automatically with detectSessionInUrl)
        // But we can also manually verify
        try {
          console.log('ResetPassword: exchanging code for session')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          console.log('ResetPassword: exchangeCodeForSession result:', data?.session?.user?.id || error?.message)

          if (error || !data.session?.user) {
            setStatus('error')
            setMessage('Invalid or expired reset link. Please request a new one.')
            return
          }

          // Session established, show password form
          setStatus('ready')
          setMessage('Enter your new password')
        } catch (err) {
          console.error('ResetPassword: exchangeCodeForSession error:', err)
          setStatus('error')
          setMessage('An error occurred. Please try requesting a new reset link.')
        }
      } catch (outerErr) {
        console.error('ResetPassword: outer error in checkRecoveryType:', outerErr)
        setStatus('error')
        setMessage('An error occurred. Please try requesting a new reset link.')
      }
    }

    checkRecoveryType()
  }, [searchParams])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setStatus('updating')
    setMessage('Updating password...')

    try {
      const { error } = await updatePassword(formData.password)

      if (error) {
        addToast({ type: 'error', message: error.message })
        setStatus('error')
        setMessage(error.message)
        return
      }

      addToast({ type: 'success', message: 'Password updated successfully! Redirecting to login...' })
      setStatus('success')
      setMessage('Password updated successfully! Redirecting...')

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      console.error('Password update error:', err)
      addToast({ type: 'error', message: 'Failed to update password' })
      setStatus('error')
      setMessage('Failed to update password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center
            {status === 'loading' ? 'bg-[rgb(var(--accent-primary))/0.1]' :
             status === 'ready' || status === 'updating' ? 'bg-[rgb(var(--accent-primary))/0.1]' :
             status === 'success' ? 'bg-[rgb(var(--success))/0.1]' :
             'bg-[rgb(var(--accent-danger))/0.1]'}">
            {status === 'loading' && (
              <svg className="w-8 h-8 text-[rgb(var(--accent-primary))] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {status === 'ready' && (
              <svg className="w-8 h-8 text-[rgb(var(--accent-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {status === 'updating' && (
              <svg className="w-8 h-8 text-[rgb(var(--accent-primary))] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {status === 'success' && (
              <svg className="w-8 h-8 text-[rgb(var(--success))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="w-8 h-8 text-[rgb(var(--accent-danger))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2 text-center">
            {status === 'loading' ? 'Verifying Link' : 'Reset Password'}
          </h1>

          <p className="text-[rgb(var(--text-secondary))] mb-6 text-center">{message}</p>

          {(status === 'ready' || status === 'updating') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="label">New Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    className={`input ${errors.password ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={status === 'updating'}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    className={`input ${errors.confirmPassword ? 'border-[rgb(var(--accent-danger))]' : ''}`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={status === 'updating'}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-[rgb(var(--accent-danger))] mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'updating'}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'updating' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => { navigate('/', { replace: true }); openAuthModal('login'); }}
                className="btn-primary w-full"
              >
                Back to Login
              </button>
              <button
                onClick={() => { navigate('/', { replace: true }); openAuthModal('forgot-password'); }}
                className="btn-outline w-full"
              >
                Request New Reset Link
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-[rgb(var(--text-muted))] mt-4 text-center">
                Password updated successfully! Redirecting...
              </p>
              <button
                onClick={() => { navigate('/', { replace: true }); openAuthModal('login'); }}
                className="btn-primary w-full"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}