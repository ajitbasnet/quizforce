// Requires VITE_ANTHROPIC_API_KEY in .env at runtime
import {
  QuizGenerationError,
  type GenerateQuizParams,
} from '../types/api'
import type { Quiz } from '../types/quiz'
import { buildQuizPrompt } from '../utils/promptBuilder'
import { parseAndValidateClaudeQuiz } from '../utils/quizSchema'
import { z } from 'zod'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4000
const PROGRESS_DURATION_MS = 3000
const PROGRESS_INTERVAL_MS = 150
const PROGRESS_CAP = 90

interface AnthropicMessageResponse {
  content?: Array<{ type?: string; text?: string }>
}

function startProgressSimulation(
  onProgress: ((progress: number) => void) | undefined,
): { stop: (finalProgress?: number) => void } {
  if (!onProgress) {
    return { stop: () => undefined }
  }

  const startTime = Date.now()
  onProgress(0)

  const intervalId = window.setInterval(() => {
    const elapsed = Date.now() - startTime
    const ratio = Math.min(elapsed / PROGRESS_DURATION_MS, 1)
    const progress = Math.min(
      PROGRESS_CAP,
      Math.round(ratio * PROGRESS_CAP),
    )
    onProgress(progress)
  }, PROGRESS_INTERVAL_MS)

  return {
    stop(finalProgress?: number) {
      window.clearInterval(intervalId)
      if (finalProgress !== undefined) {
        onProgress(finalProgress)
      }
    },
  }
}

function toQuizGenerationError(error: unknown): QuizGenerationError {
  if (error instanceof QuizGenerationError) {
    return error
  }

  if (error instanceof z.ZodError) {
    return new QuizGenerationError(
      `Invalid quiz response: ${error.message}`,
      'VALIDATION_ERROR',
    )
  }

  if (error instanceof SyntaxError) {
    return new QuizGenerationError(
      'Failed to parse quiz JSON from API response',
      'PARSE_ERROR',
    )
  }

  if (error instanceof TypeError) {
    return new QuizGenerationError(
      error.message || 'Network request failed',
      'NETWORK_ERROR',
    )
  }

  if (error instanceof Error) {
    return new QuizGenerationError(error.message, 'API_ERROR')
  }

  return new QuizGenerationError(
    'An unknown error occurred during quiz generation',
    'API_ERROR',
  )
}

export async function generateQuiz({
  content,
  settings,
  sourceType,
  onProgress,
  signal,
}: GenerateQuizParams): Promise<Quiz> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new QuizGenerationError('Missing API key', 'AUTH_ERROR')
  }

  const { system, user } = buildQuizPrompt(content, settings, sourceType)
  const progress = startProgressSimulation(onProgress)

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: 'user', content: user }],
      }),
      signal,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      const code = response.status === 401 ? 'AUTH_ERROR' : 'API_ERROR'
      throw new QuizGenerationError(
        errorBody || `API request failed with status ${response.status}`,
        code,
      )
    }

    const data = (await response.json()) as AnthropicMessageResponse
    const text = data.content?.[0]?.text

    if (!text) {
      throw new QuizGenerationError(
        'API response did not contain quiz content',
        'PARSE_ERROR',
      )
    }

    const quiz = parseAndValidateClaudeQuiz(text, {
      content,
      settings,
      sourceType,
    })

    progress.stop(100)
    return quiz
  } catch (error) {
    progress.stop()
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new QuizGenerationError('Generation cancelled', 'ABORTED')
    }
    throw toQuizGenerationError(error)
  }
}
