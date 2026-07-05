import { describe, expect, it } from 'vitest'
import { handleTranslateQuiz } from '../../api/lib/handleTranslateQuiz'

const VALID_QUIZ = {
  id: 'quiz-1',
  title: 'Industrial Revolution',
  description: 'A quiz about the Industrial Revolution.',
  questions: [
    {
      id: 'q1',
      questionText: 'Where did the Industrial Revolution begin?',
      options: [
        { id: 'o1', text: 'Britain' },
        { id: 'o2', text: 'France' },
      ],
      correctOptionId: 'o1',
      explanation: 'It began in Britain.',
      wrongExplanations: { o2: 'France industrialized later.' },
      points: 10,
      difficulty: 'medium' as const,
    },
  ],
  totalPoints: 10,
  language: 'en' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  sourceType: 'text' as const,
  sourceContent: 'Industrial Revolution content',
  settings: {
    pointsPerQuestion: 10,
    customPointsMap: {},
    questionsCount: 1,
    difficulty: 'medium' as const,
    voiceEnabled: false,
    voiceRate: 1,
    voicePitch: 1,
    voiceURI: null,
    timerEnabled: false,
    language: 'en' as const,
  },
}

const VALID_BODY = {
  quiz: VALID_QUIZ,
  targetLanguage: 'hi' as const,
}

describe('handleTranslateQuiz CORS', () => {
  it('omits CORS headers for non-allowlisted origin', async () => {
    const request = new Request('http://localhost/api/translate-quiz', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://evil.example.com',
      },
      body: JSON.stringify(VALID_BODY),
    })

    const response = await handleTranslateQuiz(request, {
      geminiApiKey: 'test-gemini',
      groqApiKey: 'test-groq',
      allowedOrigins: 'http://localhost:5173',
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('includes CORS headers for allowlisted origin', async () => {
    const request = new Request('http://localhost/api/translate-quiz', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5173' },
    })

    const response = await handleTranslateQuiz(request, {
      geminiApiKey: 'test-gemini',
      allowedOrigins: 'http://localhost:5173',
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:5173',
    )
  })

  it('returns CONFIG_ERROR when gemini key missing', async () => {
    const request = new Request('http://localhost/api/translate-quiz', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    })

    const response = await handleTranslateQuiz(request, {})
    const data = (await response.json()) as {
      error?: { code?: string; message?: string }
    }

    expect(response.status).toBe(500)
    expect(data.error?.code).toBe('CONFIG_ERROR')
    expect(data.error?.message).toBe('Server misconfiguration')
  })
})
