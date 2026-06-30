import {
  QuizGenerationError,
  type GenerateQuizParams,
} from '../types/api'
import type { Quiz } from '../types/quiz'
import {
  assertGenerationAllowed,
  recordGeneration,
} from '../utils/generationRateLimit'
import { buildQuizPrompt } from '../utils/promptBuilder'
import { parseAndValidateClaudeQuiz } from '../utils/quizSchema'
import { stripHtmlTags } from '../utils/sanitizeText'
import { z } from 'zod'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const PROXY_API_URL = '/api/generate-quiz'
const useProxy =
  import.meta.env.PROD || import.meta.env.VITE_USE_PROXY !== 'false'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4000
const PROGRESS_DURATION_MS = 3000
const PROGRESS_INTERVAL_MS = 150
const PROGRESS_CAP = 90

interface AnthropicMessageResponse {
  content?: Array<{ type?: string; text?: string }>
}

interface AnthropicErrorResponse {
  type?: string
  error?: {
    type?: string
    message?: string
  }
}

async function parseAnthropicError(
  response: Response,
): Promise<QuizGenerationError> {
  let errorType: string | undefined
  let message = `API request failed with status ${response.status}`

  const text = await response.text()
  if (text) {
    try {
      const body = JSON.parse(text) as AnthropicErrorResponse
      errorType = body.error?.type
      if (body.error?.message) {
        message = body.error.message
      }
    } catch {
      message = text
    }
  }

  switch (errorType) {
    case 'rate_limit_error':
      return new QuizGenerationError(message, 'RATE_LIMIT_ERROR', errorType)
    case 'overloaded_error':
      return new QuizGenerationError(message, 'OVERLOADED_ERROR', errorType)
    case 'invalid_api_key':
    case 'authentication_error':
      return new QuizGenerationError(message, 'INVALID_API_KEY', errorType)
    default:
      if (response.status === 401) {
        return new QuizGenerationError(message, 'INVALID_API_KEY', errorType)
      }
      return new QuizGenerationError(message, 'API_ERROR', errorType)
  }
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
  assertGenerationAllowed()

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!useProxy && !apiKey) {
    throw new QuizGenerationError('Missing API key', 'AUTH_ERROR')
  }

  const sanitizedContent = stripHtmlTags(content)
  const { system, user } = buildQuizPrompt(
    sanitizedContent,
    settings,
    sourceType,
  )
  const progress = startProgressSimulation(onProgress)

  const headers: Record<string, string> = {
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  }
  if (!useProxy) {
    headers['x-api-key'] = apiKey!
    headers['anthropic-dangerous-direct-browser-access'] = 'true'
  }

  try {
    const response = await fetch(useProxy ? PROXY_API_URL : ANTHROPIC_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: 'user', content: user }],
      }),
      signal,
    })

    if (!response.ok) {
      throw await parseAnthropicError(response)
    }

    const data = (await response.json()) as AnthropicMessageResponse
    const text = data.content?.[0]?.text

    if (!text) {
      throw new QuizGenerationError(
        'API response did not contain quiz content',
        'PARSE_ERROR',
      )
    }

    let quiz: Quiz
    try {
      quiz = parseAndValidateClaudeQuiz(text, {
        content: sanitizedContent,
        settings,
        sourceType,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new QuizGenerationError(
          error.message,
          'VALIDATION_ERROR',
          undefined,
          text,
        )
      }
      if (error instanceof SyntaxError) {
        throw new QuizGenerationError(
          'Failed to parse quiz JSON from API response',
          'PARSE_ERROR',
          undefined,
          text,
        )
      }
      throw error
    }

    if (quiz.questions.length === 0) {
      throw new QuizGenerationError(
        'Quiz has no questions',
        'EMPTY_QUIZ',
      )
    }

    recordGeneration()
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
