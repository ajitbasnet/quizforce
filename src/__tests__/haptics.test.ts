import { afterEach, describe, expect, it, vi } from 'vitest'
import { vibrateCorrect, vibrateWrong } from '../utils/haptics'

describe('haptics', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('vibrates once for correct answers when supported', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })

    vibrateCorrect()

    expect(vibrate).toHaveBeenCalledWith(50)
  })

  it('vibrates a pattern for wrong answers when supported', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })

    vibrateWrong()

    expect(vibrate).toHaveBeenCalledWith([30, 50, 30])
  })

  it('no-ops when vibration is unavailable', () => {
    vi.stubGlobal('navigator', {})

    expect(() => vibrateCorrect()).not.toThrow()
    expect(() => vibrateWrong()).not.toThrow()
  })
})
