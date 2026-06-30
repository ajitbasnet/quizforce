import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useShakeOnError } from '../hooks/useShakeOnError'

describe('useShakeOnError', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('triggers shake when error appears and clears after timeout', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ error }) => useShakeOnError(error),
      { initialProps: { error: null as string | null } },
    )

    expect(result.current).toBe(false)

    rerender({ error: 'boom' })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe(false)
  })
})
