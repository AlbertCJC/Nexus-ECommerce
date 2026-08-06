import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useState, useCallback, useRef, useEffect } from 'react'

const TEST_DEBOUNCED_VERSION_KEY = 'debounced-key_version'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  vi.restoreAllMocks()
})

// Minimal debounced hook
function useMinimalDebouncedLocalStorage(key, initialValue, delay = 300) {
  const [storedValue, setStoredValue] = useState(() => {
    return initialValue
  })

  const timeoutRef = useRef(null)
  const pendingValueRef = useRef(null)

  const flushPending = useCallback(() => {
    localStorage.setItem(key, JSON.stringify(pendingValueRef.current))
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

describe('minimal debounced hook', () => {
  it('should not write immediately', () => {
    const { result } = renderHook(() => useMinimalDebouncedLocalStorage('test-key', 'initial', 300))

    act(() => {
      result.current[1]('updated')
    })

    console.error('After setValue, localStorage:', localStorage.getItem('test-key'))
    expect(localStorage.getItem('test-key')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    console.error('After advanceTimers, localStorage:', localStorage.getItem('test-key'))
    expect(localStorage.getItem('test-key')).toBe('"updated"')
  })
})