import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// ============================================
// Error Classes for Better Error Handling
// ============================================

export class StorageQuotaExceededError extends Error {
  constructor(key, originalError) {
    super(`localStorage quota exceeded for key "${key}": ${originalError?.message || 'Unknown error'}`)
    this.name = 'StorageQuotaExceededError'
    this.key = key
    this.originalError = originalError
  }
}

export class StorageCorruptedError extends Error {
  constructor(key, originalError) {
    super(`Corrupted data in localStorage key "${key}": ${originalError?.message || 'Invalid JSON'}`)
    this.name = 'StorageCorruptedError'
    this.key = key
    this.originalError = originalError
  }
}

export class StorageUnavailableError extends Error {
  constructor(message = 'localStorage is not available') {
    super(message)
    this.name = 'StorageUnavailableError'
  }
}

// ============================================
// Utility Functions
// ============================================

function isStorageAvailable() {
  try {
    const testKey = '__storage_test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

function safeParseJSON(json, key) {
  try {
    return JSON.parse(json)
  } catch (error) {
    throw new StorageCorruptedError(key, error)
  }
}

function safeStringify(value, key) {
  try {
    return JSON.stringify(value)
  } catch (error) {
    throw new Error(`Failed to serialize data for key "${key}": ${error.message}`)
  }
}

function handleStorageError(error, key, fallback) {
  if (error instanceof DOMException && (error.code === 22 || error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
    throw new StorageQuotaExceededError(key, error)
  }
  if (error instanceof StorageCorruptedError) {
    throw error
  }
  console.warn(`Storage error for key "${key}":`, error)
  return fallback
}

// ============================================
// Migration System
// ============================================

export const STORAGE_VERSION = '2.0'

export const migrations = {
  // Migration from 1.0 to 2.0 (example)
  '1.0->2.0': (data) => {
    // Add version field to all stored objects
    if (Array.isArray(data)) {
      return data.map(item => ({ ...item, _version: '2.0', migratedAt: new Date().toISOString() }))
    }
    return { ...data, _version: '2.0', migratedAt: new Date().toISOString() }
  },
  // Identity migration (no-op for same version)
  '2.0->2.0': (data) => data,
}

// Migration registry for future versions
export function registerMigration(fromVersion, toVersion, migrationFn) {
  migrations[`${fromVersion}->${toVersion}`] = migrationFn
}

export function runMigrations(data, fromVersion, toVersion = STORAGE_VERSION) {
  if (fromVersion === toVersion) return data

  let currentData = data
  let currentVersion = fromVersion

  // Try direct migration first
  const directKey = `${currentVersion}->${toVersion}`
  if (migrations[directKey]) {
    return migrations[directKey](currentData)
  }

  // Try chained migrations
  const versions = Object.keys(migrations)
    .map(k => k.split('->'))
    .flat()
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort()

  const startIndex = versions.indexOf(currentVersion)
  const endIndex = versions.indexOf(toVersion)

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    console.warn(`No migration path from ${fromVersion} to ${toVersion}, returning data as-is`)
    return data
  }

  for (let i = startIndex; i < endIndex; i++) {
    const migrationKey = `${versions[i]}->${versions[i + 1]}`
    if (migrations[migrationKey]) {
      currentData = migrations[migrationKey](currentData)
    }
  }

  return currentData
}

// ============================================
// Base Hook with Error Handling
// ============================================

function useLocalStorageBase(key, initialValue, options = {}) {
  const {
    onError,
    migrate = true,
    versionKey = `${key}_version`,
  } = options

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined' || !isStorageAvailable()) {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = safeParseJSON(item, key)

      // Run migrations if enabled
      if (migrate) {
        const storedVersion = window.localStorage.getItem(versionKey) || '1.0'
        if (storedVersion !== STORAGE_VERSION) {
          const migrated = runMigrations(parsed, storedVersion, STORAGE_VERSION)
          window.localStorage.setItem(key, safeStringify(migrated, key))
          window.localStorage.setItem(versionKey, STORAGE_VERSION)
          return migrated
        }
      }

      return parsed
    } catch (error) {
      if (error instanceof StorageCorruptedError) {
        console.warn(`Corrupted data for "${key}", using initial value`, error)
        // Optionally clear corrupted data
        try { window.localStorage.removeItem(key) } catch {}
        return initialValue
      }
      return handleStorageError(error, key, initialValue)
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined' && isStorageAvailable()) {
        window.localStorage.setItem(key, safeStringify(valueToStore, key))
        window.localStorage.setItem(versionKey, STORAGE_VERSION)
      }
    } catch (error) {
      if (error instanceof StorageQuotaExceededError) {
        // Try to free space by removing old items
        try {
          const keysToTry = [
            'ecommerce_cart',
            'ecommerce_recent_views',
            'ecommerce_search_history',
          ]
          for (const oldKey of keysToTry) {
            if (oldKey !== key && window.localStorage.getItem(oldKey)) {
              window.localStorage.removeItem(oldKey)
            }
          }
          // Retry once after cleanup
          window.localStorage.setItem(key, safeStringify(valueToStore, key))
          window.localStorage.setItem(versionKey, STORAGE_VERSION)
        } catch (retryError) {
          console.error('Failed to free storage space:', retryError)
          if (onError) onError(new StorageQuotaExceededError(key, retryError))
        }
      } else {
        if (onError) onError(error)
      }
    }
  }, [key, storedValue, versionKey, onError])

  return [storedValue, setValue]
}

// ============================================
// Standard localStorage Hook (with error handling)
// ============================================

export function useLocalStorage(key, initialValue, options) {
  return useLocalStorageBase(key, initialValue, options)
}

// ============================================
// Debounced localStorage Hook (with error handling)
// ============================================

export function useDebouncedLocalStorage(key, initialValue, delay = 300, options = {}) {
  const { onError, migrate = true } = options

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined' || !isStorageAvailable()) {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = safeParseJSON(item, key)

      if (migrate) {
        const versionKey = `${key}_version`
        const storedVersion = window.localStorage.getItem(versionKey) || '1.0'
        if (storedVersion !== STORAGE_VERSION) {
          const migrated = runMigrations(parsed, storedVersion, STORAGE_VERSION)
          window.localStorage.setItem(key, safeStringify(migrated, key))
          window.localStorage.setItem(versionKey, STORAGE_VERSION)
          return migrated
        }
      }

      return parsed
    } catch (error) {
      if (error instanceof StorageCorruptedError) {
        console.warn(`Corrupted data for "${key}", using initial value`, error)
        try { window.localStorage.removeItem(key) } catch {}
        return initialValue
      }
      return handleStorageError(error, key, initialValue)
    }
  })

  const timeoutRef = useRef(null)
  const pendingValueRef = useRef(null)

  const flushPending = useCallback(() => {
    if (pendingValueRef.current !== null && typeof window !== 'undefined' && isStorageAvailable()) {
      try {
        window.localStorage.setItem(key, safeStringify(pendingValueRef.current, key))
        window.localStorage.setItem(`${key}_version`, STORAGE_VERSION)
        pendingValueRef.current = null
      } catch (error) {
        if (error instanceof StorageQuotaExceededError) {
          // Try cleanup and retry once
          try {
            const keysToTry = ['ecommerce_cart', 'ecommerce_recent_views', 'ecommerce_search_history']
            for (const oldKey of keysToTry) {
              if (oldKey !== key && window.localStorage.getItem(oldKey)) {
                window.localStorage.removeItem(oldKey)
              }
            }
            window.localStorage.setItem(key, safeStringify(pendingValueRef.current, key))
            window.localStorage.setItem(`${key}_version`, STORAGE_VERSION)
            pendingValueRef.current = null
          } catch (retryError) {
            if (onError) onError(new StorageQuotaExceededError(key, retryError))
          }
        } else if (onError) {
          onError(error)
        }
      }
    }
  }, [key, onError])

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      pendingValueRef.current = valueToStore

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(flushPending, delay)
    } catch (error) {
      if (onError) onError(error)
    }
  }, [key, delay, storedValue, flushPending, onError])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Flush on unmount to ensure data is saved
      flushPending()
    }
  }, [flushPending])

  return [storedValue, setValue]
}

// ============================================
// Cross-tab Sync with Conflict Resolution
// ============================================

export const CONFLICT_STRATEGIES = {
  LAST_WRITE_WINS: 'last_write_wins',
  MERGE: 'merge',
  SERVER_WINS: 'server_wins', // For future server sync
  LOCAL_WINS: 'local_wins',
  PROMPT_USER: 'prompt_user',
}

export function createConflictResolver(strategy = CONFLICT_STRATEGIES.LAST_WRITE_WINS, customResolver) {
  return (localValue, remoteValue, localTimestamp, remoteTimestamp) => {
    if (customResolver) {
      return customResolver(localValue, remoteValue, localTimestamp, remoteTimestamp)
    }

    switch (strategy) {
      case CONFLICT_STRATEGIES.LAST_WRITE_WINS:
        return remoteTimestamp > localTimestamp ? remoteValue : localValue
      case CONFLICT_STRATEGIES.LOCAL_WINS:
        return localValue
      case CONFLICT_STRATEGIES.MERGE:
        // Simple shallow merge for objects, remote wins for primitives
        if (typeof localValue === 'object' && typeof remoteValue === 'object' && localValue !== null && remoteValue !== null) {
          return { ...localValue, ...remoteValue }
        }
        return remoteValue
      default:
        return remoteValue
    }
  }
}

export function useLocalStorageSync(key, initialValue, options = {}) {
  const {
    conflictStrategy = CONFLICT_STRATEGIES.LAST_WRITE_WINS,
    customConflictResolver,
    onConflict,
    onError,
    migrate = true,
    versionKey = `${key}_version`,
    syncKey = `${key}_sync`,
  } = options

  // Use stable references for useLocalStorageBase options
  const baseOptionsRef = useRef({ onError, migrate, versionKey })
  baseOptionsRef.current = { onError, migrate, versionKey }

  const [value, setValue] = useLocalStorageBase(key, initialValue, baseOptionsRef.current)

  const resolverRef = useRef(createConflictResolver(conflictStrategy, customConflictResolver))
  resolverRef.current = createConflictResolver(conflictStrategy, customConflictResolver)

  const [localTimestamp, setLocalTimestamp] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      return parseInt(window.localStorage.getItem(syncKey) || '0', 10)
    } catch {
      return 0
    }
  })

  const updateTimestamp = useCallback(() => {
    const newTimestamp = Date.now()
    setLocalTimestamp(newTimestamp)
    if (typeof window !== 'undefined' && isStorageAvailable()) {
      try {
        window.localStorage.setItem(syncKey, newTimestamp.toString())
      } catch (error) {
        if (onError) onError(error)
      }
    }
  }, [syncKey, onError])

  // Enhanced setValue that updates timestamp
  const setValueWithSync = useCallback((newValue) => {
    setValue(newValue)
    updateTimestamp()
  }, [setValue, updateTimestamp])

  // Handle cross-tab changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key !== key && e.key !== syncKey) return

      // Skip if it's our own change (same timestamp)
      if (e.key === syncKey) {
        try {
          const remoteTimestamp = parseInt(e.newValue || '0', 10)
          if (remoteTimestamp > localTimestamp) {
            // Remote has newer data, will be picked up by key change event
          }
        } catch {}
        return
      }

      if (!e.newValue) return

      try {
        const remoteValue = safeParseJSON(e.newValue, key)
        const remoteTimestamp = parseInt(window.localStorage.getItem(syncKey) || '0', 10)

        // Resolve conflict
        const resolvedValue = resolverRef.current(value, remoteValue, localTimestamp, remoteTimestamp)

        if (resolvedValue !== value) {
          setValue(resolvedValue)
          setLocalTimestamp(remoteTimestamp)
          if (onConflict) {
            onConflict({
              key,
              localValue: value,
              remoteValue,
              resolvedValue,
              strategy: conflictStrategy,
              localTimestamp,
              remoteTimestamp,
            })
          }
        }
      } catch (error) {
        if (error instanceof StorageCorruptedError) {
          console.warn(`Corrupted remote data for "${key}"`, error)
          // Keep local value
        } else if (onError) {
          onError(error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, syncKey, value, localTimestamp, setValue, onConflict, onError, conflictStrategy])

  return [value, setValueWithSync]
}

// ============================================
// Batched/Transaction Storage Hook
// ============================================

export function useBatchedLocalStorage(keys, initialValues = {}, options = {}) {
  const {
    delay = 100,
    onError,
    conflictStrategy = CONFLICT_STRATEGIES.LAST_WRITE_WINS,
    customConflictResolver,
  } = options

  // Initialize state for all keys
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined' || !isStorageAvailable()) {
      return initialValues
    }
    try {
      const result = {}
      for (const key of keys) {
        const item = window.localStorage.getItem(key)
        result[key] = item ? safeParseJSON(item, key) : initialValues[key]
      }
      return result
    } catch (error) {
      console.warn('Error reading batched storage:', error)
      return initialValues
    }
  })

  const timeoutRef = useRef(null)
  const pendingChangesRef = useRef({})
  const timestampsRef = useRef({})

  // Initialize timestamps
  useEffect(() => {
    if (typeof window === 'undefined') return
    for (const key of keys) {
      try {
        timestampsRef.current[key] = parseInt(window.localStorage.getItem(`${key}_sync`) || '0', 10)
      } catch {
        timestampsRef.current[key] = 0
      }
    }
  }, [keys])

  const flushPending = useCallback(() => {
    if (Object.keys(pendingChangesRef.current).length === 0) return

    const changes = { ...pendingChangesRef.current }
    pendingChangesRef.current = {}

    if (typeof window === 'undefined' || !isStorageAvailable()) return

    try {
      const newTimestamps = {}
      for (const [key, value] of Object.entries(changes)) {
        window.localStorage.setItem(key, safeStringify(value, key))
        window.localStorage.setItem(`${key}_version`, STORAGE_VERSION)
        newTimestamps[key] = Date.now()
        window.localStorage.setItem(`${key}_sync`, newTimestamps[key].toString())
      }
      timestampsRef.current = { ...timestampsRef.current, ...newTimestamps }
    } catch (error) {
      if (error instanceof StorageQuotaExceededError) {
        // Try cleanup
        try {
          const keysToTry = ['ecommerce_cart', 'ecommerce_recent_views', 'ecommerce_search_history']
          for (const oldKey of keysToTry) {
            if (!keys.includes(oldKey) && window.localStorage.getItem(oldKey)) {
              window.localStorage.removeItem(oldKey)
            }
          }
          // Retry
          for (const [key, value] of Object.entries(changes)) {
            window.localStorage.setItem(key, safeStringify(value, key))
            window.localStorage.setItem(`${key}_version`, STORAGE_VERSION)
            newTimestamps[key] = Date.now()
            window.localStorage.setItem(`${key}_sync`, newTimestamps[key].toString())
          }
          timestampsRef.current = { ...timestampsRef.current, ...newTimestamps }
        } catch (retryError) {
          if (onError) onError(new StorageQuotaExceededError('batch', retryError))
        }
      } else if (onError) {
        onError(error)
      }
    }
  }, [keys, onError])

  const setValue = useCallback((key, value) => {
    if (!keys.includes(key)) {
      console.warn(`Key "${key}" not registered in batched storage`)
      return
    }

    const valueToStore = value instanceof Function ? value(state[key]) : value

    setState(prev => ({ ...prev, [key]: valueToStore }))
    pendingChangesRef.current[key] = valueToStore

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(flushPending, delay)
  }, [keys, state, delay, flushPending])

  const setValues = useCallback((values) => {
    let hasChanges = false
    for (const [key, value] of Object.entries(values)) {
      if (!keys.includes(key)) {
        console.warn(`Key "${key}" not registered in batched storage`)
        continue
      }
      const valueToStore = value instanceof Function ? value(state[key]) : value
      pendingChangesRef.current[key] = valueToStore
      hasChanges = true
    }
    if (hasChanges) {
      setState(prev => ({ ...prev, ...pendingChangesRef.current }))
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(flushPending, delay)
    }
  }, [keys, state, delay, flushPending])

  // Cross-tab sync for batched keys
  useEffect(() => {
    const resolver = createConflictResolver(conflictStrategy, customConflictResolver)

    const handleStorageChange = (e) => {
      const key = e.key
      if (!keys.includes(key) && key !== `${key}_sync`) return

      if (!e.newValue) return

      try {
        const remoteValue = safeParseJSON(e.newValue, key)
        const remoteTimestamp = parseInt(window.localStorage.getItem(`${key}_sync`) || '0', 10)
        const localTimestamp = timestampsRef.current[key] || 0

        const resolvedValue = resolver(state[key], remoteValue, localTimestamp, remoteTimestamp)

        if (resolvedValue !== state[key]) {
          setState(prev => ({ ...prev, [key]: resolvedValue }))
          timestampsRef.current[key] = remoteTimestamp
        }
      } catch (error) {
        if (onError) onError(error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [keys, state, conflictStrategy, customConflictResolver, onError])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      flushPending()
    }
  }, [flushPending])

  return [state, setValue, setValues]
}

// ============================================
// Higher-level hook for AppContext-style usage
// ============================================

export function useAppStorage(initialState = {}) {
  const keys = Object.keys(initialState)
  const [state, setKey, setKeys] = useBatchedLocalStorage(keys, initialState, {
    delay: 150,
    conflictStrategy: CONFLICT_STRATEGIES.LAST_WRITE_WINS,
  })

  // Convenience methods matching AppContext patterns
  const actions = useMemo(() => ({
    setProducts: (products) => setKey('products', products),
    setCategories: (categories) => setKey('categories', categories),
    setBrands: (brands) => setKey('brands', brands),
    setOrders: (orders) => setKey('orders', orders),
    setCart: (cart) => setKey('cart', cart),
    setAuth: (auth) => setKey('auth', auth),
    // Batch update multiple at once
    setMultiple: (updates) => setKeys(updates),
  }), [setKey, setKeys])

  return [state, actions]
}