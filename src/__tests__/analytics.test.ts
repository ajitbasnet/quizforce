import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackEvent } from '../utils/analytics'

describe('trackEvent', () => {
  afterEach(() => {
    delete window.plausible
  })

  it('no-ops when plausible is not available', () => {
    expect(() => trackEvent('quiz_generated', { sourceType: 'text' })).not.toThrow()
  })

  it('calls window.plausible with event name only', () => {
    const plausible = vi.fn()
    window.plausible = plausible

    trackEvent('pdf_uploaded')

    expect(plausible).toHaveBeenCalledWith('pdf_uploaded', undefined)
  })

  it('calls window.plausible with props', () => {
    const plausible = vi.fn()
    window.plausible = plausible

    trackEvent('quiz_completed', { score: 80, percentage: 80, timeTaken: 120 })

    expect(plausible).toHaveBeenCalledWith('quiz_completed', {
      props: { score: 80, percentage: 80, timeTaken: 120 },
    })
  })
})
