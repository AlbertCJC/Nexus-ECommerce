import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../../utils/validation'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function AdminLogin() {
  const { signIn, isAdmin, loading: authLoading, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  // Auto-redirect if already admin (e.g., page refresh)
  useEffect(() => {
    if (isAdmin && !authLoading) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAdmin, authLoading, navigate])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    const { error: authError } = await signIn(data.email, data.password)
    if (authError) {
      setError(authError.message || 'Invalid credentials')
      setLoading(false)
      return
    }
    // Wait for profile to load and check admin role
    // The onAuthStateChange callback will fetch profile and update isAdmin
    // We'll use a timeout to wait for the state to update
    let attempts = 0
    const maxAttempts = 50 // 5 seconds
    while (attempts < maxAttempts) {
      if (isAdmin) {
        navigate('/admin/dashboard')
        return
      }
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    // If still not admin, try refreshing profile explicitly
    try {
      await refreshProfile()
      if (isAdmin) {
        navigate('/admin/dashboard')
        return
      }
    } catch (e) {
      // Ignore
    }
    setError('Access denied: Admin role required')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#admin-gradient)"/>
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="admin-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="rgb(var(--accent-primary))"/>
                  <stop offset="100%" stopColor="rgb(var(--accent-secondary))"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-3xl font-bold" style={{background: 'linear-gradient(135deg, rgb(var(--accent-primary)) 0%, rgb(var(--accent-secondary)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>NEXUS</span>
          </div>
          <h1 className="text-2xl font-semibold text-[rgb(var(--text-primary))]">Admin Portal</h1>
          <p className="mt-2 text-[rgb(var(--text-muted))]">Enter credentials to access dashboard</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="admin@example.com" />
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="••••••••" />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Sign In
            </Button>
          </form>
          <div className="mt-6 p-4 bg-[rgb(var(--bg-elevated))] rounded-lg text-sm text-[rgb(var(--text-muted))]">
            <p className="font-medium text-[rgb(var(--text-primary))]">Demo Credentials:</p>
            <p>Email: admin@example.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-[rgb(var(--text-muted))]"><a href="/" className="text-[rgb(var(--accent-primary))] hover:underline">← Back to NEXUS</a></p>
      </div>
    </div>
  )
}