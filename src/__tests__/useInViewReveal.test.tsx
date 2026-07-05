import { createElement } from 'react'
import { render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useInViewReveal } from '../hooks/useInViewReveal'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  private callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

function RevealProbe() {
  const { ref, isInView } = useInViewReveal()
  return createElement(
    'div',
    { ref, 'data-testid': 'target' },
    isInView ? 'visible' : 'hidden',
  )
}

describe('useInViewReveal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    MockIntersectionObserver.instances = []
  })

  it('starts hidden and reveals when intersecting', async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    const { getByTestId } = render(createElement(RevealProbe))

    expect(getByTestId('target')).toHaveTextContent('hidden')

    const observer = MockIntersectionObserver.instances[0]
    observer.trigger(true)

    await waitFor(() => {
      expect(getByTestId('target')).toHaveTextContent('visible')
    })
  })

  it('exposes capped stagger helper', () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    let staggerDelay: ReturnType<typeof useInViewReveal>['staggerDelay'] = () => 0

    function StaggerProbe() {
      const reveal = useInViewReveal()
      staggerDelay = reveal.staggerDelay
      return createElement('div', { ref: reveal.ref })
    }

    render(createElement(StaggerProbe))
    expect(staggerDelay(4, 50, 300)).toBe(200)
  })
})
