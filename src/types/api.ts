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

export class QuizGenerationError extends Error {
  code: QuizGenerationErrorCode

  constructor(message: string, code: QuizGenerationErrorCode) {
    super(message)
    this.name = 'QuizGenerationError'
    this.code = code
  }
}

export interface GenerateQuizParams {
  content: string
  settings: QuizSettings
  sourceType: Quiz['sourceType']
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}
