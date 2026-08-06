import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session: existingSession } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const type = searchParams.get('type')
      const next = searchParams.get('next') || '/'

      // If already authenticated, redirect immediately
      if (existingSession?.user) {
        navigate(next, { replace: true })
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('Invalid verification link. Please try signing up again.')
        return
      }

      try {
        // Exchange the auth code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Auth callback error:', error)

          // Handle specific error types
          if (error.message?.includes('expired') || error.message?.includes('invalid')) {
            setStatus('error')
            setMessage('Verification link has expired or is invalid. Please request a new one.')
          } else if (error.message?.includes('already')) {
            setStatus('error')
            setMessage('This verification link has already been used.')
          } else {
            setStatus('error')
            setMessage('Email verification failed. Please try again.')
          }
          return
        }

        if (data.session?.user) {
          // Check user role for redirect
          const isAdmin = data.session.user.user_metadata?.role === 'admin'
          const redirectTo = isAdmin ? '/admin/dashboard' : next

          setStatus('success')
          setMessage('Email verified successfully! Redirecting...')

          // Small delay to show success message
          setTimeout(() => {
            navigate(redirectTo, { replace: true })
          }, 1500)
        } else {
          setStatus('error')
          setMessage('Verification completed but no session created. Please try signing in.')
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    handleCallback()
  }, [searchParams, navigate, existingSession])

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center
            {status === 'loading' ? 'bg-[rgb(var(--accent-primary))/0.1]' :
             status === 'success' ? 'bg-[rgb(var(--success))/0.1]' :
             'bg-[rgb(var(--accent-danger))/0.1]'}">
            {status === 'loading' && (
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

          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
            {status === 'loading' ? 'Verifying Email' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h1>

          <p className="text-[rgb(var(--text-secondary))] mb-6">{message}</p>

          {status === 'error' && (
            <div className="space-y-3">
              <a
                href="/auth/register"
                className="btn-primary w-full block"
              >
                Sign Up Again
              </a>
              <a
                href="/auth/login"
                className="btn-outline w-full block"
              >
                Sign In Instead
              </a>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-[rgb(var(--text-muted))]">
              If this page doesn't redirect automatically,{' '}
              <a href="/" className="text-[rgb(var(--accent-primary))] underline">click here</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}