// Rate limiting utility for auth endpoints
// Works with Supabase Edge Function: rate-limit-auth

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://dlqjmtnwcekcndpchxgr.supabase.co/functions/v1'

interface RateLimitCheckResult {
  allowed: boolean
  remaining: number
  retryAfter?: number
  error?: string
}

export async function checkAuthRateLimit(
  action: 'signup' | 'login' | 'reset-password' | 'update-password',
  identifier: string // email or IP
): Promise<RateLimitCheckResult> {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/rate-limit-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action, identifier }),
    })

    if (response.status === 429) {
      const data = await response.json()
      return {
        allowed: false,
        remaining: 0,
        retryAfter: data.retryAfter,
        error: data.message || 'Rate limit exceeded',
      }
    }

    if (!response.ok) {
      console.warn('Rate limit check failed:', response.status)
      // Fail open - allow request if rate limiter is down
      return { allowed: true, remaining: 999 }
    }

    const data = await response.json()
    return {
      allowed: data.allowed,
      remaining: data.remaining,
    }
  } catch (err) {
    console.error('Rate limit check error:', err)
    // Fail open - allow request if rate limiter is unreachable
    return { allowed: true, remaining: 999 }
  }
}

// Wrapper to add rate limiting to auth functions
export async function withRateLimit<T>(
  action: 'signup' | 'login' | 'reset-password' | 'update-password',
  identifier: string,
  fn: () => Promise<T>
): Promise<T> {
  const rateLimitResult = await checkAuthRateLimit(action, identifier)

  if (!rateLimitResult.allowed) {
    const error = new Error(rateLimitResult.error || 'Rate limit exceeded') as Error & { retryAfter?: number }
    error.retryAfter = rateLimitResult.retryAfter
    throw error
  }

  return fn()
}