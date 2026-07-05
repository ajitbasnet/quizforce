import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { translateQuiz } from '../api/translateQuiz'
import { useQuizLanguageSync } from '../hooks/useQuizLanguageSync'
import { useSettingsStore } from '../store/settingsStore'
import { makeQuiz } from './fixtures/quiz'

vi.mock('../api/translateQuiz', () => ({
  translateQuiz: vi.fn(),
}))

vi.mock('../utils/syncVoiceForLanguage', () => ({
  syncVoiceForLanguage: vi.fn(),
}))

async function advanceDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350)
  })
}

describe('useQuizLanguageSync', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
    useSettingsStore.setState({
      settings: { ...useSettingsStore.getState().settings, language: 'en' },
    })
    vi.mocked(translateQuiz).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('skips translation when quiz language matches settings', async () => {
    const quiz = makeQuiz({ language: 'en' })
    const onQuizUpdate = vi.fn()

    renderHook(() =>
      useQuizLanguageSync({
        quiz,
        onQuizUpdate,
      }),
    )

    await advanceDebounce()

    expect(translateQuiz).not.toHaveBeenCalled()
    expect(onQuizUpdate).not.toHaveBeenCalled()
  })

  it('translates when settings language differs from quiz language', async () => {
    const quiz = makeQuiz({ language: 'en' })
    const translated = makeQuiz({ language: 'hi', title: 'Hindi Quiz' })
    vi.mocked(translateQuiz).mockResolvedValue(translated)

    useSettingsStore.setState({
      settings: { ...useSettingsStore.getState().settings, language: 'hi' },
    })

    const onQuizUpdate = vi.fn()
    renderHook(() =>
      useQuizLanguageSync({
        quiz,
        onQuizUpdate,
      }),
    )

    await advanceDebounce()

    expect(translateQuiz).toHaveBeenCalledWith(quiz, 'hi', expect.any(AbortSignal))
    expect(onQuizUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'hi', title: 'Hindi Quiz' }),
    )
  })

  it('only applies the latest language when toggling rapidly', async () => {
    const quiz = makeQuiz({ language: 'en' })
    let resolveHi: ((value: ReturnType<typeof makeQuiz>) => void) | undefined
    let resolveZh: ((value: ReturnType<typeof makeQuiz>) => void) | undefined

    vi.mocked(translateQuiz)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveHi = resolve
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveZh = resolve
          }),
      )

    useSettingsStore.setState({
      settings: { ...useSettingsStore.getState().settings, language: 'hi' },
    })

    const onQuizUpdate = vi.fn()
    renderHook(() =>
      useQuizLanguageSync({
        quiz,
        onQuizUpdate,
      }),
    )

    await advanceDebounce()

    act(() => {
      useSettingsStore.setState({
        settings: { ...useSettingsStore.getState().settings, language: 'zh' },
      })
    })

    await advanceDebounce()

    const hindiQuiz = makeQuiz({ language: 'hi', title: 'Hindi Quiz' })
    const chineseQuiz = makeQuiz({ language: 'zh', title: 'Chinese Quiz' })

    await act(async () => {
      resolveHi?.(hindiQuiz)
      await Promise.resolve()
      resolveZh?.(chineseQuiz)
      await Promise.resolve()
    })

    expect(onQuizUpdate).toHaveBeenCalledTimes(1)
    expect(onQuizUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'zh', title: 'Chinese Quiz' }),
    )
  })
})
