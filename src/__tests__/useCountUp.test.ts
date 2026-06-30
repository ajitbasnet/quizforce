import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from '../hooks/useCountUp'

describe('useCountUp', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('animates toward the target value', () => {
    vi.useFakeTimers()
    const rafCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const { result } = renderHook(() => useCountUp(100, 1000))

    act(() => {
      rafCallbacks[0]?.(0)
      rafCallbacks[1]?.(500)
      rafCallbacks[2]?.(1000)
    })

    expect(result.current).toBeGreaterThan(0)
  })

  it('snaps immediately when duration is zero', () => {
    const { result } = renderHook(() => useCountUp(42, 0))
    expect(result.current).toBe(42)
  })
})
