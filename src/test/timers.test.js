import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('fake timers test', () => {
  it('should mock setTimeout', () => {
    let called = false
    setTimeout(() => { called = true }, 100)
    expect(called).toBe(false)
    vi.advanceTimersByTime(100)
    expect(called).toBe(true)
  })
})