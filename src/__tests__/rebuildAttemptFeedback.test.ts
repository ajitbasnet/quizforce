import { describe, expect, it } from 'vitest'
import { rebuildAttemptFeedback } from '../utils/rebuildAttemptFeedback'
import { makeAttempt, makeQuiz } from './fixtures/quiz'

describe('rebuildAttemptFeedback', () => {
  it('keeps scores and updates explanations from translated quiz', () => {
    const englishQuiz = makeQuiz()
    const attempt = makeAttempt(englishQuiz)

    const hindiQuiz = makeQuiz({
      language: 'hi',
      questions: englishQuiz.questions.map((question) => ({
        ...question,
        explanation: `HI correct ${question.id}`,
        wrongExplanations: Object.fromEntries(
          Object.keys(question.wrongExplanations).map((optionId) => [
            optionId,
            `HI wrong ${optionId}`,
          ]),
        ),
      })),
    })

    const rebuilt = rebuildAttemptFeedback(hindiQuiz, attempt)

    expect(rebuilt.score).toBe(attempt.score)
    expect(rebuilt.totalPoints).toBe(attempt.totalPoints)
    expect(rebuilt.percentage).toBe(attempt.percentage)
    expect(rebuilt.feedback[0].pointsAwarded).toBe(attempt.feedback[0].pointsAwarded)
    expect(rebuilt.feedback[0].isCorrect).toBe(true)
    expect(rebuilt.feedback[0].explanation).toBe('HI correct q1')
    expect(rebuilt.feedback[1].explanation).toBe('HI wrong q2-a')
  })
})
