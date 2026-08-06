import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorageSync, STORAGE_VERSION } from '../hooks/useLocalStorage'

const TEST_SYNC_VERSION_KEY = 'sync-key_version'
const TEST_SYNC_KEY = 'sync-key_sync'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('useLocalStorageSync cross-tab debug', () => {
  it('should sync value across tabs via storage event', () => {
    localStorage.setItem(TEST_SYNC_VERSION_KEY, STORAGE_VERSION)
    localStorage.setItem(TEST_SYNC_KEY, '0')

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    const { result: result1 } = renderHook(() => useLocalStorageSync('sync-key', 'default'))
    const { result: result2 } = renderHook(() => useLocalStorageSync('sync-key', 'default'))

    // Get the listener
    const listeners = addEventListenerSpy.mock.calls.filter(call => call[0] === 'storage').map(call => call[1])
    const listener = listeners[0]

    console.error('Before event, result1:', result1.current[0])
    console.error('localTimestamp would be:', localStorage.getItem(TEST_SYNC_KEY))

    // Manually call the listener with debug - ALSO update the sync timestamp
    act(() => {
      // Simulate remote tab writing: update sync timestamp first
      const remoteTimestamp = Date.now()
      localStorage.setItem(TEST_SYNC_KEY, remoteTimestamp.toString())
      localStorage.setItem('sync-key', JSON.stringify('from-tab-1'))

      listener(new StorageEvent('storage', {
        key: 'sync-key',
        newValue: JSON.stringify('from-tab-1'),
      }))
    })

    console.error('After event, result1:', result1.current[0])
    console.error('localStorage sync-key:', localStorage.getItem('sync-key'))
    console.error('localStorage sync-key_sync:', localStorage.getItem(TEST_SYNC_KEY))

    expect(result1.current[0]).toBe('from-tab-1')
  })
})