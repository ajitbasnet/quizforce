import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useQuizGenerator } from '../hooks/useQuizGenerator'

describe('useQuizGenerator', () => {
  it('exposes a generate function', async () => {
    const { result } = renderHook(() => useQuizGenerator())
    await expect(result.current.generate()).resolves.toBeUndefined()
  })
})
