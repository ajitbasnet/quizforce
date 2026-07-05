import { describe, expect, it } from 'vitest'
import type { ClaudeQuizResponse } from '../utils/quizSchema'
import {
  mergeTranslatedQuiz,
  TranslateQuizValidationError,
} from '../utils/translateQuizSchema'
import { makeQuiz } from './fixtures/quiz'

function buildTranslatedResponse(quiz: ReturnType<typeof makeQuiz>): ClaudeQuizResponse {
  return {
    title: 'Translated title',
    description: 'Translated description',
    questions: quiz.questions.map((question) => ({
      id: question.id,
      questionText: `Translated ${question.questionText}`,
      options: question.options.map((option) => ({
        id: option.id,
        text: `Translated ${option.text}`,
      })),
      correctOptionId: question.correctOptionId,
      explanation: 'Translated explanation',
      wrongExplanations: Object.fromEntries(
        Object.entries(question.wrongExplanations).map(([key]) => [key, 'Translated wrong']),
      ),
      points: question.points,
      difficulty: question.difficulty,
      topic: question.topic,
    })),
  }
}

describe('mergeTranslatedQuiz', () => {
  it('merges translated text while preserving structural fields', () => {
    const original = makeQuiz()
    const translated = buildTranslatedResponse(original)

    const merged = mergeTranslatedQuiz(translated, original, 'es')

    expect(merged.language).toBe('es')
    expect(merged.settings.language).toBe('es')
    expect(merged.id).toBe(original.id)
    expect(merged.questions[0].id).toBe('q1')
    expect(merged.questions[0].correctOptionId).toBe('q1-a')
    expect(merged.questions[0].questionText).toBe('Translated Question 1?')
    expect(merged.questions[0].options[0].text).toBe('Translated A')
    expect(merged.totalPoints).toBe(original.totalPoints)
  })

  it('rejects question id mismatch', () => {
    const original = makeQuiz()
    const translated = buildTranslatedResponse(original)
    translated.questions[0] = { ...translated.questions[0], id: 'wrong-id' }

    expect(() => mergeTranslatedQuiz(translated, original, 'hi')).toThrow(
      TranslateQuizValidationError,
    )
  })

  it('rejects changed correctOptionId', () => {
    const original = makeQuiz()
    const translated = buildTranslatedResponse(original)
    translated.questions[0] = {
      ...translated.questions[0],
      correctOptionId: 'q1-b',
    }

    expect(() => mergeTranslatedQuiz(translated, original, 'hi')).toThrow(
      TranslateQuizValidationError,
    )
  })
})
