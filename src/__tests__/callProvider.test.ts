import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  callProvider,
  ProviderCallError,
  type QuizPromptParts,
} from '../../api/lib/callProvider'

const PARTS: QuizPromptParts = {
  system: 'You are QuizForge.',
  user: 'Generate a quiz about history.',
}

const QUIZ_JSON = JSON.stringify({
  title: 'Test Quiz',
  description: 'A test',
  questions: [
    {
      id: 'q1',
      questionText: 'Q?',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctOptionId: 'a',
      explanation: 'Because.',
      wrongExplanations: { b: 'No.' },
      points: 10,
      difficulty: 'easy',
    },
  ],
})

function geminiOkResponse(text: string): Response {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  )
}

function groqOkResponse(text: string): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content: text } }],
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  )
}

describe('callProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns gemini result on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse(QUIZ_JSON))

    const result = await callProvider(PARTS, {
      geminiApiKey: 'gemini-key',
      groqApiKey: 'groq-key',
    })

    expect(result.provider).toBe('gemini')
    expect(result.raw).toBe(QUIZ_JSON)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('falls back to groq on gemini 429', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Quota' } }), {
          status: 429,
        }),
      )
      .mockResolvedValueOnce(groqOkResponse(QUIZ_JSON))

    const result = await callProvider(PARTS, {
      geminiApiKey: 'gemini-key',
      groqApiKey: 'groq-key',
    })

    expect(result.provider).toBe('groq')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('falls back to groq on gemini 5xx', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('Server error', { status: 503 }))
      .mockResolvedValueOnce(groqOkResponse(QUIZ_JSON))

    const result = await callProvider(PARTS, {
      geminiApiKey: 'gemini-key',
      groqApiKey: 'groq-key',
    })

    expect(result.provider).toBe('groq')
  })

  it('does not fall back on gemini 400', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: 'Bad request' } }), {
        status: 400,
      }),
    )

    await expect(
      callProvider(PARTS, { geminiApiKey: 'gemini-key', groqApiKey: 'groq-key' }),
    ).rejects.toMatchObject({ code: 'API_ERROR', status: 400 })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not fall back on gemini 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: 'Invalid key' } }), {
        status: 401,
      }),
    )

    await expect(
      callProvider(PARTS, { geminiApiKey: 'bad-key', groqApiKey: 'groq-key' }),
    ).rejects.toMatchObject({ code: 'INVALID_API_KEY', status: 401 })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('throws CONFIG_ERROR when gemini key missing', async () => {
    await expect(
      callProvider(PARTS, { geminiApiKey: '', groqApiKey: 'groq-key' }),
    ).rejects.toMatchObject({ code: 'CONFIG_ERROR' })
  })

  it('throws CONFIG_ERROR when fallback needed but groq key missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('Quota', { status: 429 }),
    )

    await expect(
      callProvider(PARTS, { geminiApiKey: 'gemini-key' }),
    ).rejects.toMatchObject({ code: 'CONFIG_ERROR' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns groq error when both providers fail', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Invalid key' } }), {
          status: 401,
        }),
      )

    const error = await callProvider(PARTS, {
      geminiApiKey: 'gemini-key',
      groqApiKey: 'bad-groq',
    }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ProviderCallError)
    expect(error).toMatchObject({ code: 'INVALID_API_KEY' })
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
