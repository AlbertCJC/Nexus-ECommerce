import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { withRateLimit } from '../utils/rateLimit'
// Types imported via JSDoc comments for documentation

const AuthContext = createContext(null)

// Helper to get guest cart from localStorage
function getGuestCart() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('ecommerce_cart')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Helper to clear guest cart in localStorage
function clearGuestCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('ecommerce_cart')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // Derived state - reactive to session/user changes
  const isAuthenticated = useMemo(() => !!session?.user, [session])
  const isAdmin = useMemo(() => user?.role === 'admin', [user])

  // Merge guest cart (localStorage) into Supabase cart after login
  const mergeGuestCart = useCallback(async (userId) => {
    const guestCart = getGuestCart()
    if (!userId || guestCart.length === 0) return

    try {
      for (const item of guestCart) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('user_id', userId)
          .eq('product_id', item.productId)
          .single()

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('user_id', userId)
            .eq('product_id', item.productId)
        } else {
          await supabase
            .from('cart_items')
            .insert({ user_id: userId, product_id: item.productId, quantity: item.quantity })
        }
      }
      // Clear localStorage cart after successful merge
      clearGuestCart()
    } catch (error) {
      console.error('Failed to merge guest cart:', error)
    }
  }, [])

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()

      if (mounted) {
        setSession(initialSession)
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return

      // Handle token refresh failures gracefully
      if (event === 'TOKEN_REFRESHED') {
        // Token was successfully refreshed, update session
        setSession(newSession)
        if (newSession?.user) {
          await fetchProfile(newSession.user.id)
        }
        return
      }

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Session ended (could be due to failed refresh, manual logout, or token expiry)
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }

      // SIGNED_IN, INITIAL_SESSION, PASSWORD_RECOVERY, etc.
      setSession(newSession)
      if (newSession?.user) {
        await fetchProfile(newSession.user.id)
        // Merge guest cart on sign in
        if (event === 'SIGNED_IN') {
          await mergeGuestCart(newSession.user.id)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, mergeGuestCart])

  const signUp = async (email, password, metadata) => {
    // Rate limit: 3 signup attempts per 15 minutes per email (lower than Supabase's built-in limit)
    return withRateLimit('signup', email, async () => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      // Handle Supabase's built-in rate limiting (429)
      if (authError && (authError.status === 429 || authError.message?.includes('rate limit') || authError.message?.includes('Too many requests'))) {
        return { error: new Error('Too many signup attempts. Please wait a few minutes before trying again.') }
      }

      if (authError) return { error: new Error(authError.message) }

      // If signUp successful and user is created (not just confirmation sent),
      // create the user_profiles entry
      if (authData.user && !authError) {
        const profileData = {
          id: authData.user.id,
          email: authData.user.email,
          first_name: metadata?.first_name || '',
          last_name: metadata?.last_name || '',
          role: metadata?.role || 'customer',
          phone: metadata?.phone || '',
          address: metadata?.address || {}
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData)

        if (profileError) {
          console.error('Failed to create user profile:', profileError)
          // Don't return error here since auth succeeded, but log it
        }
      }

      return { error: null }
    })
  }

  const signIn = async (email, password) => {
    // Rate limit: 5 login attempts per 15 minutes per email (lower than Supabase's built-in limit)
    return withRateLimit('login', email, async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      // Handle Supabase's built-in rate limiting (429)
      if (error && (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('Too many requests'))) {
        return { error: new Error('Too many login attempts. Please wait a few minutes before trying again.') }
      }

      return { error: error ? new Error(error.message) : null }
    })
  }

  const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error: error ? new Error(error.message) : null }
  }

  const resetPassword = async (email) => {
    // Rate limit: 2 reset password attempts per hour per email
    return withRateLimit('reset-password', email, async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error && (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('Too many requests'))) {
        return { error: new Error('Too many password reset attempts. Please wait an hour before trying again.') }
      }

      return { error: error ? new Error(error.message) : null }
    })
  }

  const updatePassword = async (newPassword) => {
    // Rate limit: 3 password updates per hour (using session user ID as identifier)
    const identifier = session?.user?.id || 'unknown'
    return withRateLimit('update-password', identifier, async () => {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error && (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('Too many requests'))) {
        return { error: new Error('Too many password update attempts. Please wait an hour before trying again.') }
      }

      return { error: error ? new Error(error.message) : null }
    })
  }

  const updateProfile = async (updates) => {
    if (!session?.user) return { error: new Error('Not authenticated'), user: null }

    // Update user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) return { error: new Error(error.message), user: null }

    // Sync auth metadata (name) if first_name or last_name updated
    const authUpdates = {}
    if (updates.first_name !== undefined) authUpdates.first_name = updates.first_name
    if (updates.last_name !== undefined) authUpdates.last_name = updates.last_name
    if (updates.phone !== undefined) authUpdates.phone = updates.phone

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser({
        data: authUpdates
      })
      if (authError) {
        console.warn('Failed to sync auth metadata:', authError.message)
        // Don't fail the whole operation if auth sync fails
      }
    }

    setUser(data)
    return { error: null, user: data }
  }

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated,
      isAdmin,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext