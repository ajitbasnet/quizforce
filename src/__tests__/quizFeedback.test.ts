import { describe, expect, it } from 'vitest'
import { getOptionFeedback } from '../utils/quizFeedback'
import { makeQuiz } from './fixtures/quiz'

describe('getOptionFeedback', () => {
  const quiz = makeQuiz()
  const question = quiz.questions[0]!

  it('returns null before submit', () => {
    expect(getOptionFeedback(question, 'q1-a', false)).toBeNull()
  })

  it('returns explanation for correct option after submit', () => {
    expect(getOptionFeedback(question, 'q1-a', true)).toBe('Because A.')
  })

  it('returns wrong explanation for incorrect option after submit', () => {
    expect(getOptionFeedback(question, 'q1-b', true)).toBe('B is wrong.')
  })
})
