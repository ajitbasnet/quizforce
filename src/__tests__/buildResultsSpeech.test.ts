import { describe, expect, it } from 'vitest'
import {
  buildQuestionReviewFullSpeech,
  buildQuestionReviewScrollSpeech,
  buildResultsIntroSpeech,
} from '../utils/buildResultsSpeech'
import { makeAttempt, makeQuiz } from './fixtures/quiz'

const t = ((key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key) as never

describe('buildResultsSpeech', () => {
  const quiz = makeQuiz()
  const attempt = makeAttempt(quiz)
  const question = quiz.questions[0]!
  const feedback = attempt.feedback[0]!

  it('builds intro speech lines', () => {
    const lines = buildResultsIntroSpeech(attempt, t)
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('results.voiceScoreSummary')
  })

  it('builds scroll review speech for correct answer', () => {
    const lines = buildQuestionReviewScrollSpeech(question, feedback, t)
    expect(lines[0]).toBe('Question 1?')
    expect(lines[1]).toContain('results.voiceAnswerCorrect')
  })

  it('builds full review speech with options', () => {
    const lines = buildQuestionReviewFullSpeech(question, feedback, t)
    expect(lines.some((line) => line.startsWith('Option A:'))).toBe(true)
  })
})
