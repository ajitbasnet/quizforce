import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollThreshold } from '../hooks/useScrollThreshold'

type ObserverCallback = IntersectionObserverCallback

function ScrollThresholdProbe({ threshold = 8 }: { threshold?: number }) {
  const { isPastThreshold, sentinelRef, sentinelHeightPx } =
    useScrollThreshold(threshold)

  return (
    <div
      ref={sentinelRef}
      data-testid="sentinel"
      style={{ height: sentinelHeightPx }}
    >
      <span data-testid="state">{String(isPastThreshold)}</span>
    </div>
  )
}

describe('useScrollThreshold', () => {
  let observerCallback: ObserverCallback | null = null

  beforeEach(() => {
    observerCallback = null

    class MockIntersectionObserver {
      constructor(callback: ObserverCallback) {
        observerCallback = callback
      }

      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts false when sentinel is intersecting', () => {
    render(<ScrollThresholdProbe />)

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(screen.getByTestId('state')).toHaveTextContent('false')
  })

  it('becomes true when sentinel leaves the viewport', () => {
    render(<ScrollThresholdProbe />)

    act(() => {
      observerCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(screen.getByTestId('state')).toHaveTextContent('true')
  })

  it('renders sentinel with requested height', () => {
    const { container } = render(<ScrollThresholdProbe threshold={12} />)
    const sentinel = container.querySelector('[data-testid="sentinel"]')
    expect(sentinel).toHaveStyle({ height: '12px' })
  })
})
