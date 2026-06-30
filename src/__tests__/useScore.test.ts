import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useScore } from '../hooks/useScore'

describe('useScore', () => {
  it('returns placeholder score API', () => {
    const { result } = renderHook(() => useScore())
    expect(result.current.score).toBe(0)
    expect(result.current.calculate()).toBe(0)
  })
})
