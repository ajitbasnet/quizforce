import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSettingsAutoSave } from '../hooks/useSettingsAutoSave'

describe('useSettingsAutoSave', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('marks saved after save and clears the flag later', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSettingsAutoSave())

    act(() => {
      result.current.save({ questionsCount: 15 })
    })
    expect(result.current.saved).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(result.current.saved).toBe(false)
  })
})
