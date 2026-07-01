import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  THEME_KEY,
  applyThemeToDocument,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
} from '../hooks/useDarkMode'
import { ThemeProvider, useDarkMode } from '../hooks/useDarkMode.tsx'

function createMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>()
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
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

function wrapper({ children }: { children: ReactNode }) {
  return createElement(ThemeProvider, null, children)
}

describe('useDarkMode utilities', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('defaults to system when storage is empty', () => {
    expect(readStoredTheme()).toBe('system')
  })

  it('reads a valid stored preference', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    expect(readStoredTheme()).toBe('dark')
  })

  it('falls back to system for invalid stored values', () => {
    localStorage.setItem(THEME_KEY, 'sepia')
    expect(readStoredTheme()).toBe('system')
  })

  it('persists theme preference', () => {
    writeStoredTheme('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
  })

  it('resolves explicit light and dark preferences', () => {
    window.matchMedia = vi.fn().mockReturnValue(createMatchMedia(true))
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('resolves system preference from matchMedia', () => {
    window.matchMedia = vi.fn().mockReturnValue(createMatchMedia(true))
    expect(resolveTheme('system')).toBe('dark')

    window.matchMedia = vi.fn().mockReturnValue(createMatchMedia(false))
    expect(resolveTheme('system')).toBe('light')
  })

  it('applies and removes the dark class on documentElement', () => {
    applyThemeToDocument('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    applyThemeToDocument('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('useDarkMode hook', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('throws when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useDarkMode())).toThrow(
      'useDarkMode must be used within a ThemeProvider',
    )
  })

  it('defaults to system theme when storage is empty', () => {
    window.matchMedia = vi.fn().mockReturnValue(createMatchMedia(false))

    const { result } = renderHook(() => useDarkMode(), { wrapper })

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('initializes from stored preference', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    window.matchMedia = vi.fn().mockReturnValue(createMatchMedia(false))

    const { result } = renderHook(() => useDarkMode(), { wrapper })

    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('persists preference and updates resolved theme', () => {
    window.matchMedia = vi.fn().mockReturnValue(createMatchMedia(false))

    const { result } = renderHook(() => useDarkMode(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('follows OS changes while in system mode', () => {
    const media = createMatchMedia(false)
    window.matchMedia = vi.fn().mockReturnValue(media)

    const { result } = renderHook(() => useDarkMode(), { wrapper })
    expect(result.current.resolvedTheme).toBe('light')

    act(() => {
      media.dispatchChange(true)
    })

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('stops following OS changes after switching to an explicit theme', () => {
    const media = createMatchMedia(false)
    window.matchMedia = vi.fn().mockReturnValue(media)

    const { result } = renderHook(() => useDarkMode(), { wrapper })

    act(() => {
      result.current.setTheme('light')
    })

    act(() => {
      media.dispatchChange(true)
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
