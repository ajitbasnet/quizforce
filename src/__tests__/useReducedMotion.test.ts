import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useMotionSpring,
  useMotionTransition,
  useReducedMotion,
} from '../hooks/useReducedMotion'
import { MOTION } from '../utils/motionTokens'

function createMatchMedia(matches: boolean) {
  return {
    matches,
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: () => true,
  }
}

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when prefers-reduced-motion is set', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue(createMatchMedia(true))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('returns false when motion is not reduced', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue(createMatchMedia(false))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })
})

describe('useMotionTransition', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns zero duration when reduced motion is preferred', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue(createMatchMedia(true))

    const { result } = renderHook(() => useMotionTransition(MOTION.medium))
    expect(result.current).toEqual({ duration: 0 })
  })

  it('returns duration and default ease when motion is allowed', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue(createMatchMedia(false))

    const { result } = renderHook(() => useMotionTransition(MOTION.fast))
    expect(result.current).toEqual({
      duration: MOTION.fast,
      ease: MOTION.easeOut,
    })
  })

  it('accepts a custom ease curve', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue(createMatchMedia(false))

    const { result } = renderHook(() =>
      useMotionTransition(MOTION.medium, MOTION.easeIn),
    )
    expect(result.current).toEqual({
      duration: MOTION.medium,
      ease: MOTION.easeIn,
    })
  })
})

describe('useMotionSpring', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns zero duration when reduced motion is preferred', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue(createMatchMedia(true))

    const { result } = renderHook(() => useMotionSpring())
    expect(result.current).toEqual({ duration: 0 })
  })

  it('returns shared spring tokens when motion is allowed', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue(createMatchMedia(false))

    const { result } = renderHook(() => useMotionSpring())
    expect(result.current).toEqual(MOTION.spring)
  })
})
