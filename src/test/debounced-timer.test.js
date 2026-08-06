import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_VERSION } from '../hooks/useLocalStorage'

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

describe('useDebouncedLocalStorage debug - check property assignment', () => {
  it('should check if property assignment is used', () => {
    localStorage.setItem(TEST_DEBOUNCED_VERSION_KEY, STORAGE_VERSION)

    // Wrap both setItem and property setter
    const originalSetItem = localStorage.setItem.bind(localStorage)
    const setItemTrace = []
    localStorage.setItem = function(key, value) {
      setItemTrace.push({ method: 'setItem', key, value })
      return originalSetItem(key, value)
    }

    // Also check defineProperty
    const originalDescriptor = Object.getOwnPropertyDescriptor(Storage.prototype, 'setItem')
    console.error('Storage.prototype.setItem descriptor:', originalDescriptor)

    const { result } = renderHook(() => useDebouncedLocalStorage('debounced-key', 'initial', 300))

    act(() => {
      result.current[1]('updated')
    })

    console.error('setItem trace:', setItemTrace)
    console.error('localStorage[debounced-key]:', localStorage['debounced-key'])
    console.error('localStorage.getItem:', localStorage.getItem('debounced-key'))
    console.error('Object.keys:', Object.keys(localStorage))

    expect(true).toBe(true)
  })
})