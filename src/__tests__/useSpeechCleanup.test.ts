import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSpeechCleanup } from '../hooks/useSpeechCleanup'

const stopMock = vi.fn()

vi.mock('../hooks/useVoice', () => ({
  useVoice: () => ({ stop: stopMock }),
}))

describe('useSpeechCleanup', () => {
  it('stops speech on unmount', () => {
    const cancelMock = vi.fn()
    Object.assign(window.speechSynthesis, { cancel: cancelMock })

    const { unmount } = renderHook(() => useSpeechCleanup())
    unmount()

    expect(stopMock).toHaveBeenCalled()
    expect(cancelMock).toHaveBeenCalled()
  })
})
