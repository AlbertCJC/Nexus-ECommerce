import { SignJWT, jwtVerify, importPKCS8, exportPKCS8, generateKeyPair } from 'jose'

// Token configuration
const ACCESS_TOKEN_EXPIRY = '15m' // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d' // 7 days
const REFRESH_BEFORE_EXPIRY = '5m' // Refresh 5 minutes before access token expiry

// In-memory key pair (in production, use persistent keys from env/keystore)
let keyPairPromise = null

async function getKeyPair() {
  if (!keyPairPromise) {
    keyPairPromise = generateKeyPair('ES256')
  }
  return keyPairPromise
}

async function getPublicKey() {
  const { publicKey } = await getKeyPair()
  return publicKey
}

async function getPrivateKey() {
  const { privateKey } = await getKeyPair()
  return privateKey
}

/**
 * Generate a short-lived access token (15 min)
 * @param {Object} user - User object with id, email, etc.
 * @param {string} role - 'admin' or 'customer'
 * @returns {Promise<string>} JWT access token
 */
export async function generateAccessToken(user, role) {
  const privateKey = await getPrivateKey()
  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role,
    type: 'access',
    firstName: user.firstName,
    lastName: user.lastName
  })
    .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60) // 15 minutes
    .setNotBefore(now)
    .sign(privateKey)

  return token
}

/**
 * Generate a long-lived refresh token (7 days)
 * @param {Object} user - User object with id, email, etc.
 * @param {string} role - 'admin' or 'customer'
 * @returns {Promise<string>} JWT refresh token
 */
export async function generateRefreshToken(user, role) {
  const privateKey = await getPrivateKey()
  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
    .setNotBefore(now)
    .sign(privateKey)

  return token
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token string
 * @returns {Promise<Object>} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export async function verifyToken(token) {
  if (!token) {
    throw new Error('No token provided')
  }

  try {
    const publicKey = await getPublicKey()
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['ES256']
    })
    return payload
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      throw new Error('Token expired')
    }
    if (error.code === 'ERR_JWT_INVALID') {
      throw new Error('Invalid token')
    }
    throw new Error(`Token verification failed: ${error.message}`)
  }
}

/**
 * Refresh access token using a valid refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {Promise<{accessToken: string, refreshToken: string}>} New token pair
 * @throws {Error} If refresh token is invalid
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const payload = await verifyToken(refreshToken)

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type: expected refresh token')
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName
    }

    const role = payload.role

    // Generate new token pair
    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateAccessToken(user, role),
      generateRefreshToken(user, role)
    ])

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`)
  }
}

/**
 * Check if access token is about to expire (within REFRESH_BEFORE_EXPIRY)
 * @param {string} accessToken - Access token to check
 * @returns {Promise<boolean>} True if token should be refreshed
 */
export async function shouldRefreshToken(accessToken) {
  try {
    const payload = await verifyToken(accessToken)
    const exp = payload.exp * 1000 // Convert to milliseconds
    const now = Date.now()
    const timeUntilExpiry = exp - now
    const refreshWindow = 5 * 60 * 1000 // 5 minutes in ms
    return timeUntilExpiry < refreshWindow
  } catch {
    // If we can't verify, assume we should refresh
    return true
  }
}

/**
 * Get token expiry time in milliseconds
 * @param {string} token - JWT token
 * @returns {Promise<number>} Expiry timestamp in ms, or 0 if invalid
 */
export async function getTokenExpiry(token) {
  try {
    const payload = await verifyToken(token)
    return payload.exp * 1000
  } catch {
    return 0
  }
}

/**
 * Decode token without verification (for display purposes only)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
 */
export function decodeTokenUnsafe(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

/**
 * Blacklist a refresh token (store in localStorage for demo)
 * In production, this would be a server-side blocklist
 * @param {string} refreshToken - Token to blacklist
 */
export function blacklistRefreshToken(refreshToken) {
  try {
    const blacklist = JSON.parse(localStorage.getItem('token_blacklist') || '[]')
    const payload = decodeTokenUnsafe(refreshToken)
    if (payload && payload.exp) {
      // Store with expiry for cleanup
      blacklist.push({ token: refreshToken, expiresAt: payload.exp * 1000 })
      localStorage.setItem('token_blacklist', JSON.stringify(blacklist))
    }
  } catch (error) {
    console.warn('Failed to blacklist token:', error)
  }
}

/**
 * Check if a refresh token is blacklisted
 * @param {string} refreshToken - Token to check
 * @returns {boolean} True if blacklisted
 */
export function isRefreshTokenBlacklisted(refreshToken) {
  try {
    const blacklist = JSON.parse(localStorage.getItem('token_blacklist') || '[]')
    return blacklist.some(entry => entry.token === refreshToken)
  } catch {
    return false
  }
}

/**
 * Clean up expired entries from blacklist
 */
export function cleanupTokenBlacklist() {
  try {
    const blacklist = JSON.parse(localStorage.getItem('token_blacklist') || '[]')
    const now = Date.now()
    const valid = blacklist.filter(entry => entry.expiresAt > now)
    localStorage.setItem('token_blacklist', JSON.stringify(valid))
  } catch (error) {
    console.warn('Failed to cleanup blacklist:', error)
  }
}

// Initialize cleanup on load
if (typeof window !== 'undefined') {
  cleanupTokenBlacklist()
}