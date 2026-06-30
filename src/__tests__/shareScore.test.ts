import { describe, expect, it } from 'vitest'
import {
  buildShareCopyText,
  buildShareUrl,
  buildTwitterIntentUrl,
  buildWhatsAppIntentUrl,
  decodeSharePayload,
  encodeSharePayload,
} from '../utils/shareScore'
import { makeAttempt, makeQuiz } from './fixtures/quiz'

const t = ((key: string, params?: Record<string, unknown>) =>
  `${key}:${JSON.stringify(params ?? {})}`) as never

describe('shareScore', () => {
  const quiz = makeQuiz()
  const attempt = makeAttempt(quiz)

  it('round-trips share payload encoding', () => {
    const encoded = encodeSharePayload({ quiz, attempt })
    const decoded = decodeSharePayload(encoded)

    expect(decoded?.quiz.id).toBe(quiz.id)
    expect(decoded?.attempt.id).toBe(attempt.id)
  })

  it('returns null for invalid encoded data', () => {
    expect(decodeSharePayload('not-valid')).toBeNull()
  })

  it('builds authenticated and guest share URLs', () => {
    expect(
      buildShareUrl({
        attempt,
        quiz,
        isAuthenticated: true,
        origin: 'https://quizforge.test',
      }),
    ).toBe('https://quizforge.test/results/attempt-1')

    const guestUrl = buildShareUrl({
      attempt,
      quiz,
      isAuthenticated: false,
      origin: 'https://quizforge.test',
    })
    expect(guestUrl).toContain('/results?data=')
  })

  it('builds share copy and social intent URLs', () => {
    const text = buildShareCopyText({ attempt, quiz, t })
    expect(text).toContain('results.shareCopyText')

    const url = 'https://quizforge.test/share'
    expect(buildTwitterIntentUrl(text, url)).toContain('twitter.com/intent/tweet')
    expect(buildWhatsAppIntentUrl(text, url)).toContain('wa.me')
  })
})
