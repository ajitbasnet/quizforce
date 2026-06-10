import type { Quiz, QuizSettings } from './quiz'

export type ApiResponse<T> = {
  data: T
}

export type QuizGenerationErrorCode =
  | 'AUTH_ERROR'
  | 'API_ERROR'
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'ABORTED'
  | 'RATE_LIMIT_ERROR'
  | 'OVERLOADED_ERROR'
  | 'INVALID_API_KEY'

export class QuizGenerationError extends Error {
  code: QuizGenerationErrorCode
  apiErrorType?: string

  constructor(
    message: string,
    code: QuizGenerationErrorCode,
    apiErrorType?: string,
  ) {
    super(message)
    this.name = 'QuizGenerationError'
    this.code = code
    this.apiErrorType = apiErrorType
  }
}

export interface GenerateQuizParams {
  content: string
  settings: QuizSettings
  sourceType: Quiz['sourceType']
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}
