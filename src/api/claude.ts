import {
  QuizGenerationError,
  type GenerateQuizParams,
} from '../types/api'
import type { Quiz } from '../types/quiz'
import {
  assertGenerationAllowed,
  recordGeneration,
} from '../utils/generationRateLimit'
import { normalizeQuizSettings } from '../utils/normalizeQuizSettings'
import { buildQuizPrompt } from '../utils/promptBuilder'
import { parseAndValidateClaudeQuiz } from '../utils/quizSchema'
import { stripHtmlTags } from '../utils/sanitizeText'
import { z } from 'zod'
import { callProvider, ProviderCallError } from '../../api/lib/callProvider'

const PROXY_API_URL = '/api/generate-quiz'
const useProxy =
  import.meta.env.PROD || import.meta.env.VITE_USE_PROXY !== 'false'
const PROGRESS_DURATION_MS = 3000
const PROGRESS_INTERVAL_MS = 150
const PROGRESS_CAP = 90

function mapProviderCallError(error: ProviderCallError): QuizGenerationError {
  switch (error.code) {
    case 'CONFIG_ERROR':
      return new QuizGenerationError(error.message, 'AUTH_ERROR', error.code)
    case 'INVALID_API_KEY':
      return new QuizGenerationError(error.message, 'INVALID_API_KEY', error.code)
    case 'RATE_LIMIT_ERROR':
      return new QuizGenerationError(error.message, 'RATE_LIMIT_ERROR', error.code)
    case 'NETWORK_ERROR':
      return new QuizGenerationError(error.message, 'NETWORK_ERROR', error.code)
    case 'PARSE_ERROR':
      return new QuizGenerationError(error.message, 'PARSE_ERROR', error.code)
    default:
      return new QuizGenerationError(error.message, 'API_ERROR', error.code)
  }
}

function mapProxyError(
  status: number,
  code: string | undefined,
  message: string,
): QuizGenerationError {
  if (status === 429 || code === 'RATE_LIMIT_ERROR') {
    return new QuizGenerationError(message, 'RATE_LIMIT_ERROR', code)
  }
  if (code === 'OVERLOADED_ERROR') {
    return new QuizGenerationError(message, 'OVERLOADED_ERROR', code)
  }
  if (code === 'CONFIG_ERROR') {
    return new QuizGenerationError(message, 'AUTH_ERROR', code)
  }
  if (code === 'INVALID_API_KEY') {
    return new QuizGenerationError(message, 'INVALID_API_KEY', code)
  }
  if (code === 'VALIDATION_ERROR') {
    return new QuizGenerationError(message, 'VALIDATION_ERROR', code)
  }
  if (code === 'PARSE_ERROR') {
    return new QuizGenerationError(message, 'PARSE_ERROR', code)
  }
  if (code === 'EMPTY_QUIZ') {
    return new QuizGenerationError(message, 'EMPTY_QUIZ', code)
  }
  return new QuizGenerationError(message, 'API_ERROR', code)
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

  if (error instanceof ProviderCallError) {
    return mapProviderCallError(error)
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

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!useProxy && !geminiApiKey) {
    throw new QuizGenerationError('Missing API key', 'AUTH_ERROR')
  }

  const sanitizedContent = stripHtmlTags(content)
  const { system, user } = buildQuizPrompt(
    sanitizedContent,
    settings,
    sourceType,
  )
  const progress = startProgressSimulation(onProgress)

  try {
    if (useProxy) {
      const response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          content,
          settings: normalizeQuizSettings(settings),
          sourceType,
        }),
        signal,
      })

      if (response.status === 404) {
        throw new QuizGenerationError(
          'Quiz API not found. Restart the dev server (npm run dev) and use the URL it prints — often http://localhost:5173 or :5174.',
          'NETWORK_ERROR',
        )
      }

      const data = (await response.json()) as {
        quiz?: Quiz
        meta?: { provider?: string }
        error?: { message?: string; code?: string }
      }

      if (!response.ok) {
        throw mapProxyError(
          response.status,
          data.error?.code,
          data.error?.message ?? 'API request failed',
        )
      }

      const quiz = data.quiz
      if (!quiz) {
        throw new QuizGenerationError(
          'API response did not contain a quiz',
          'PARSE_ERROR',
        )
      }
      if (quiz.questions.length === 0) {
        throw new QuizGenerationError('Quiz has no questions', 'EMPTY_QUIZ')
      }

      recordGeneration()
      progress.stop(100)
      return quiz
    }

    const { raw: text } = await callProvider(
      { system, user },
      { geminiApiKey: geminiApiKey!, groqApiKey },
      signal,
    )

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
