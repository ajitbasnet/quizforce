import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import React from 'react'

function createLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

const localStorageMock = createLocalStorageMock()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function createSessionStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

const sessionStorageMock = createSessionStorageMock()
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

beforeAll(() => {
  if (!('speechSynthesis' in window)) {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: () => [],
      },
    })
  }
})

vi.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef<HTMLButtonElement, Record<string, unknown>>(
      ({ children, whileTap: _whileTap, animate: _animate, transition: _transition, ...props }, ref) =>
        React.createElement('button', { ...props, ref }, children as React.ReactNode),
    ),
    span: ({
      children,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...props
    }: React.ComponentProps<'span'> & Record<string, unknown>) =>
      React.createElement('span', props, children),
  },
}))

afterEach(() => {
  cleanup()
  localStorageMock.clear()
  sessionStorageMock.clear()
})
