// Supabase Edge Function: Rate Limiting for Auth Endpoints
// Deploy with: supabase functions deploy rate-limit-auth
// Note: This function is optional - Supabase has built-in rate limiting.
// Uses in-memory store with TTL-based cleanup to minimize egress/cache pressure.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

// Configuration for different auth operations
// Set limits LOWER than Supabase's built-in limits to prevent hitting their 429
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  signup: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 per 15 min
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 },  // 5 per 15 min
  'reset-password': { maxRequests: 2, windowMs: 60 * 60 * 1000 }, // 2 per hour
  'update-password': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  default: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
}

// In-memory store with timestamp-based expiry (no setInterval to reduce cold start overhead)
const requestStore = new Map<string, { count: number; resetAt: number }>()

function getClientKey(action: string, identifier: string): string {
  return `${action}:${identifier}`
}

function checkRateLimit(action: string, identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMITS[action] || RATE_LIMITS.default
  const key = getClientKey(action, identifier)
  const now = Date.now()
  const existing = requestStore.get(key)

  // Clean up expired entries on-demand (lazy cleanup instead of setInterval)
  if (existing && now > existing.resetAt) {
    requestStore.delete(key)
    return checkRateLimit(action, identifier) // Retry with clean slate
  }

  if (!existing) {
    // New window
    const resetAt = now + config.windowMs
    requestStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt }
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return { allowed: true, remaining: config.maxRequests - existing.count, resetAt: existing.resetAt }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { action, identifier } = await req.json()

    if (!action || !identifier) {
      return new Response(JSON.stringify({ error: 'Missing action or identifier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate action
    const validActions = ['signup', 'login', 'reset-password', 'update-password']
    if (!validActions.includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check rate limit
    const result = checkRateLimit(action, identifier)

    // Add rate limit headers
    const headers = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(RATE_LIMITS[action]?.maxRequests || RATE_LIMITS.default.maxRequests),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    }

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded for ${action}. Please try again later.`,
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        { status: 429, headers }
      )
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: result.remaining,
      }),
      { status: 200, headers }
    )
  } catch (err) {
    console.error('Rate limit error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})