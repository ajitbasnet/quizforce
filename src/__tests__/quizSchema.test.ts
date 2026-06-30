import { describe, expect, it, vi } from 'vitest'
import type { GenerateQuizParams } from '../types/api'
import {
  mapClaudeResponseToQuiz,
  parseAndValidateClaudeQuiz,
} from '../utils/quizSchema'
import { baseSettings } from './fixtures/quiz'

const params: Pick<GenerateQuizParams, 'content' | 'settings' | 'sourceType'> = {
  content: 'Source content for the quiz',
  settings: baseSettings,
  sourceType: 'text',
}

const validResponse = {
  title: 'Sample Quiz',
  description: 'A sample',
  questions: [
    {
      id: 'q1',
      questionText: 'What is 2+2?',
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '4' },
      ],
      correctOptionId: 'b',
      explanation: 'Basic math.',
      wrongExplanations: { a: 'No.' },
      points: 10,
      difficulty: 'easy' as const,
    },
  ],
}

describe('quizSchema', () => {
  it('maps Claude response to Quiz', () => {
    const quiz = mapClaudeResponseToQuiz(validResponse, params)

    expect(quiz.title).toBe('Sample Quiz')
    expect(quiz.questions).toHaveLength(1)
    expect(quiz.totalPoints).toBe(10)
    expect(quiz.sourceType).toBe('text')
    expect(quiz.id).toBeTruthy()
  })

  it('truncates long source content', () => {
    const longContent = 'x'.repeat(600)
    const quiz = mapClaudeResponseToQuiz(validResponse, {
      ...params,
      content: longContent,
    })

    expect(quiz.sourceContent.endsWith('...')).toBe(true)
    expect(quiz.sourceContent.length).toBeLessThan(longContent.length)
  })

  it('parses JSON and strips markdown fences', () => {
    const json = '```json\n' + JSON.stringify(validResponse) + '\n```'
    const quiz = parseAndValidateClaudeQuiz(json, params)

    expect(quiz.title).toBe('Sample Quiz')
  })

  it('filters questions with fewer than 2 options', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const payload = {
      ...validResponse,
      questions: [
        validResponse.questions[0],
        {
          ...validResponse.questions[0],
          id: 'q2',
          options: [{ id: 'only', text: 'Only one' }],
        },
      ],
    }

    const quiz = parseAndValidateClaudeQuiz(JSON.stringify(payload), params)

    expect(quiz.questions).toHaveLength(1)
    expect(warnSpy).toHaveBeenCalledWith(
      '[quizSchema] Filtered 1 question(s) with fewer than 2 options',
    )
    warnSpy.mockRestore()
  })
})
