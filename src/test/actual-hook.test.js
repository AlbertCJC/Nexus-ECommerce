import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedLocalStorage, STORAGE_VERSION } from '../hooks/useLocalStorage'

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

describe('ACTUAL useDebouncedLocalStorage hook', () => {
  it('should not write immediately', () => {
    localStorage.setItem(TEST_DEBOUNCED_VERSION_KEY, STORAGE_VERSION)

    const { result } = renderHook(() => useDebouncedLocalStorage('debounced-key', 'initial', 300))

    act(() => {
      result.current[1]('updated')
    })

    console.error('After setValue, localStorage debounced-key:', localStorage.getItem('debounced-key'))
    expect(localStorage.getItem('debounced-key')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    console.error('After advanceTimers, localStorage debounced-key:', localStorage.getItem('debounced-key'))
    expect(localStorage.getItem('debounced-key')).toBe('"updated"')
  })
})