import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useState, useCallback, useRef, useEffect } from 'react'

const STORAGE_VERSION = '2.0'
const TEST_DEBOUNCED_VERSION_KEY = 'test-key_version'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  vi.restoreAllMocks()
})

// Custom error classes
class StorageQuotaExceededError extends Error {
  constructor(key, originalError) {
    super(`localStorage quota exceeded for key "${key}": ${originalError?.message || 'Unknown error'}`)
    this.name = 'StorageQuotaExceededError'
    this.key = key
    this.originalError = originalError
  }
}

class StorageCorruptedError extends Error {
  constructor(key, originalError) {
    super(`Corrupted data in localStorage key "${key}": ${originalError?.message || 'Invalid JSON'}`)
    this.name = 'StorageCorruptedError'
    this.key = key
    this.originalError = originalError
  }
}

function isStorageAvailable() {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
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

// Minimal debounced hook WITH error handling
function useMinimalDebouncedWithErrorHandling(key, initialValue, delay = 300) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined' || !isStorageAvailable()) {
      return initialValue
    }
    try {
      const item = localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = safeParseJSON(item, key)

      const versionKey = `${key}_version`
      const storedVersion = localStorage.getItem(versionKey) || '1.0'
      if (storedVersion !== STORAGE_VERSION) {
        const migrated = { ...parsed, _version: STORAGE_VERSION, migratedAt: new Date().toISOString() }
        localStorage.setItem(key, safeStringify(migrated, key))
        localStorage.setItem(versionKey, STORAGE_VERSION)
        return migrated
      }

      return parsed
    } catch (error) {
      if (error instanceof StorageCorruptedError) {
        console.warn(`Corrupted data for "${key}", using initial value`, error)
        try { localStorage.removeItem(key) } catch {}
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
        localStorage.setItem(key, safeStringify(pendingValueRef.current, key))
        localStorage.setItem(`${key}_version`, STORAGE_VERSION)
        pendingValueRef.current = null
      } catch (error) {
        if (error instanceof StorageQuotaExceededError) {
          // Try cleanup
        }
      }
    }
  }, [key])

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
      // Error handling
    }
  }, [key, delay, storedValue, flushPending])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      flushPending()
    }
  }, [flushPending])

  return [storedValue, setValue]
}

describe('minimal debounced hook with error handling', () => {
  it('should not write immediately when version matches', () => {
    localStorage.setItem(TEST_DEBOUNCED_VERSION_KEY, STORAGE_VERSION)

    const { result } = renderHook(() => useMinimalDebouncedWithErrorHandling('test-key', 'initial', 300))

    act(() => {
      result.current[1]('updated')
    })

    console.error('After setValue, localStorage test-key:', localStorage.getItem('test-key'))
    expect(localStorage.getItem('test-key')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    console.error('After advanceTimers, localStorage test-key:', localStorage.getItem('test-key'))
    expect(localStorage.getItem('test-key')).toBe('"updated"')
  })
})