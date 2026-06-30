import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LG_MEDIA_QUERY, useMediaQuery } from '../hooks/useMediaQuery'

function createMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>()
  return {
    matches,
    media: '',
    onchange: null,
    addEventListener: (_event: string, listener: () => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_event: string, listener: () => void) => {
      listeners.delete(listener)
    },
    dispatchEvent: () => true,
    dispatchChange(nextMatches: boolean) {
      this.matches = nextMatches
      listeners.forEach((listener) => listener())
    },
  }
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reflects the current matchMedia value', () => {
    const media = createMatchMedia(true)
    window.matchMedia = vi.fn().mockReturnValue(media)

    const { result } = renderHook(() => useMediaQuery(LG_MEDIA_QUERY))
    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', () => {
    const media = createMatchMedia(false)
    window.matchMedia = vi.fn().mockReturnValue(media)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    act(() => {
      media.dispatchChange(true)
    })

    expect(result.current).toBe(true)
  })
})
