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

// Minimal debounced hook WITH migration logic
function useMinimalDebouncedWithMigration(key, initialValue, delay = 300) {
  const [storedValue, setStoredValue] = useState(() => {
    const item = localStorage.getItem(key)
    if (!item) return initialValue

    const parsed = JSON.parse(item)

    // Migration logic
    const versionKey = `${key}_version`
    const storedVersion = localStorage.getItem(versionKey) || '1.0'
    if (storedVersion !== STORAGE_VERSION) {
      // Simple migration - add version field
      const migrated = { ...parsed, _version: STORAGE_VERSION, migratedAt: new Date().toISOString() }
      localStorage.setItem(key, JSON.stringify(migrated))
      localStorage.setItem(versionKey, STORAGE_VERSION)
      return migrated
    }

    return parsed
  })

  const timeoutRef = useRef(null)
  const pendingValueRef = useRef(null)

  const flushPending = useCallback(() => {
    localStorage.setItem(key, JSON.stringify(pendingValueRef.current))
    localStorage.setItem(`${key}_version`, STORAGE_VERSION)
    pendingValueRef.current = null
  }, [key])

  const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    pendingValueRef.current = valueToStore

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(flushPending, delay)
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

describe('minimal debounced hook with migration', () => {
  it('should not write immediately when version matches', () => {
    localStorage.setItem(TEST_DEBOUNCED_VERSION_KEY, STORAGE_VERSION) // Version matches

    const { result } = renderHook(() => useMinimalDebouncedWithMigration('test-key', 'initial', 300))

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

  it('should migrate and write on init when version differs', () => {
    localStorage.setItem('test-key', '"old-value"')
    localStorage.setItem(TEST_DEBOUNCED_VERSION_KEY, '1.0') // Old version

    const { result } = renderHook(() => useMinimalDebouncedWithMigration('test-key', 'initial', 300))

    // Should have migrated on init
    console.error('After render, localStorage test-key:', localStorage.getItem('test-key'))
    expect(localStorage.getItem('test-key')).not.toBe('"old-value"')

    act(() => {
      result.current[1]('updated')
    })

    console.error('After setValue, localStorage test-key:', localStorage.getItem('test-key'))
    expect(localStorage.getItem('test-key')).not.toBe('"updated"') // Still debounced

    act(() => {
      vi.advanceTimersByTime(300)
    })

    console.error('After advanceTimers, localStorage test-key:', localStorage.getItem('test-key'))
    expect(localStorage.getItem('test-key')).toBe('"updated"')
  })
})