import { describe, expect, it } from 'vitest'
import { handleGenerateQuiz } from '../../api/lib/handleGenerateQuiz'

const VALID_BODY = {
  content:
    'The Industrial Revolution began in Britain and spread across Europe, transforming agriculture, manufacturing, and transport through steam power and mechanized factories over many decades.',
  settings: {
    pointsPerQuestion: 20,
    customPointsMap: {},
    questionsCount: 5,
    difficulty: 'medium' as const,
    voiceEnabled: false,
    voiceRate: 1,
    voicePitch: 1,
    voiceURI: null,
    timerEnabled: false,
    language: 'en' as const,
  },
  sourceType: 'text' as const,
}

describe('handleGenerateQuiz CORS', () => {
  it('omits CORS headers for non-allowlisted origin', async () => {
    const request = new Request('http://localhost/api/generate-quiz', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://evil.example.com',
      },
      body: JSON.stringify(VALID_BODY),
    })

    const response = await handleGenerateQuiz(request, {
      geminiApiKey: 'test-gemini',
      groqApiKey: 'test-groq',
      allowedOrigins: 'http://localhost:5173',
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('includes CORS headers for allowlisted origin', async () => {
    const request = new Request('http://localhost/api/generate-quiz', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5173' },
    })

    const response = await handleGenerateQuiz(request, {
      geminiApiKey: 'test-gemini',
      allowedOrigins: 'http://localhost:5173',
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:5173',
    )
  })

  it('returns CONFIG_ERROR when gemini key missing', async () => {
    const request = new Request('http://localhost/api/generate-quiz', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    })

    const response = await handleGenerateQuiz(request, {})
    const data = (await response.json()) as {
      error?: { code?: string; message?: string }
    }

    expect(response.status).toBe(500)
    expect(data.error?.code).toBe('CONFIG_ERROR')
    expect(data.error?.message).toBe('Server misconfiguration')
  })
})
