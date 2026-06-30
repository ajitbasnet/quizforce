import { describe, expect, it } from 'vitest'
import {
  buildResultsCsvData,
  buildResultsJson,
  getResultsExportFilename,
  sanitizeExportSlug,
} from '../utils/buildResultsExport'
import { makeAttempt, makeQuiz } from './fixtures/quiz'

describe('buildResultsExport', () => {
  const quiz = makeQuiz()
  const attempt = makeAttempt(quiz)

  it('sanitizes export slugs', () => {
    expect(sanitizeExportSlug('Hello World!')).toBe('hello-world')
    expect(sanitizeExportSlug('   ')).toBe('quiz')
  })

  it('builds export filenames', () => {
    expect(getResultsExportFilename(quiz, 'json')).toBe(
      'quizforge-test-quiz-results.json',
    )
  })

  it('serializes quiz and attempt to JSON', () => {
    const json = buildResultsJson(quiz, attempt)
    const parsed = JSON.parse(json) as { quiz: { id: string } }
    expect(parsed.quiz.id).toBe(quiz.id)
  })

  it('builds CSV headers and rows', () => {
    const { headers, rows } = buildResultsCsvData(quiz, attempt)
    expect(headers).toHaveLength(5)
    expect(rows).toHaveLength(quiz.questions.length)
    expect(rows[0]?.[0]).toBe('Question 1?')
  })
})
