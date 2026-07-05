import { z } from 'zod'
import { QuizGenerationError } from '../types/api'
import type { Quiz, SupportedLanguage } from '../types/quiz'
import { buildTranslateQuizPrompt } from '../utils/promptBuilder'
import {
  parseAndMergeTranslatedQuiz,
  TranslateQuizValidationError,
} from '../utils/translateQuizSchema'
import { callProvider, ProviderCallError } from '../../api/lib/callProvider'

const PROXY_API_URL = '/api/translate-quiz'
const useProxy =
  import.meta.env.PROD || import.meta.env.VITE_USE_PROXY !== 'false'

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
  return new QuizGenerationError(message, 'API_ERROR', code)
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
    'An unknown error occurred during quiz translation',
    'API_ERROR',
  )
}

export async function translateQuiz(
  quiz: Quiz,
  targetLanguage: SupportedLanguage,
  signal?: AbortSignal,
): Promise<Quiz> {
  if (quiz.language === targetLanguage) {
    return quiz
  }

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!useProxy && !geminiApiKey) {
    throw new QuizGenerationError('Missing API key', 'AUTH_ERROR')
  }

  const { system, user } = buildTranslateQuizPrompt(quiz, targetLanguage)

  try {
    if (useProxy) {
      const response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quiz, targetLanguage }),
        signal,
      })

      const data = (await response.json()) as {
        quiz?: Quiz
        error?: { message?: string; code?: string }
      }

      if (!response.ok) {
        throw mapProxyError(
          response.status,
          data.error?.code,
          data.error?.message ?? 'API request failed',
        )
      }

      const translated = data.quiz
      if (!translated) {
        throw new QuizGenerationError(
          'API response did not contain a quiz',
          'PARSE_ERROR',
        )
      }

      return translated
    }

    const { raw: text } = await callProvider(
      { system, user },
      { geminiApiKey: geminiApiKey!, groqApiKey },
      signal,
    )

    try {
      return parseAndMergeTranslatedQuiz(text, quiz, targetLanguage)
    } catch (error) {
      if (error instanceof TranslateQuizValidationError) {
        throw new QuizGenerationError(error.message, 'VALIDATION_ERROR')
      }
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
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new QuizGenerationError('Translation cancelled', 'ABORTED')
    }
    throw toQuizGenerationError(error)
  }
}
