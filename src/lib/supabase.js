import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set. Using placeholder values for build.')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    // Handle auth errors gracefully
    onError: (error) => {
      // Don't log expected auth errors (like expired refresh token)
      if (error.message?.includes('refresh_token') || error.message?.includes('Invalid Refresh Token')) {
        return // Suppressed - handled by onAuthStateChange
      }
      console.error('Supabase auth error:', error)
    }
  }
})

// Add global fetch error handler for auth endpoint
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url
    const response = await originalFetch(input, init)

    // Suppress 400 errors on token refresh endpoint (expected when token expires)
    if (url?.includes('/auth/v1/token') && response.status === 400) {
      // Let Supabase handle this internally - it will fire onAuthStateChange with SIGNED_OUT
      return response
    }

    return response
  }
}

// Expose for e2e tests
if (typeof window !== 'undefined') {
  window.__SUPABASE_CLIENT__ = supabase
}

// For admin operations (service role) - only use in secure contexts
export const supabaseAdmin = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null

export default supabase