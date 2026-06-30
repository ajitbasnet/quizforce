import type { Quiz, QuizAttempt } from '../types/quiz'

export interface HistoryExportPayload {
  version: 1
  exportedAt: string
  quizzes: Quiz[]
  attempts: QuizAttempt[]
}

function isQuizLike(value: unknown): value is Quiz {
  if (!value || typeof value !== 'object') return false
  const quiz = value as Record<string, unknown>
  return (
    typeof quiz.id === 'string' &&
    typeof quiz.title === 'string' &&
    Array.isArray(quiz.questions)
  )
}

function isAttemptLike(value: unknown): value is QuizAttempt {
  if (!value || typeof value !== 'object') return false
  const attempt = value as Record<string, unknown>
  return (
    typeof attempt.id === 'string' &&
    typeof attempt.quizId === 'string' &&
    Array.isArray(attempt.feedback)
  )
}

export function buildHistoryExport(
  quizzes: Quiz[],
  attempts: QuizAttempt[],
): HistoryExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    quizzes,
    attempts,
  }
}

export function validateHistoryImport(
  data: unknown,
): HistoryExportPayload | null {
  if (!data || typeof data !== 'object') return null

  const payload = data as Record<string, unknown>
  if (payload.version !== 1) return null
  if (typeof payload.exportedAt !== 'string') return null
  if (!Array.isArray(payload.quizzes) || !Array.isArray(payload.attempts)) {
    return null
  }

  if (!payload.quizzes.every(isQuizLike)) return null
  if (!payload.attempts.every(isAttemptLike)) return null

  return {
    version: 1,
    exportedAt: payload.exportedAt,
    quizzes: payload.quizzes as Quiz[],
    attempts: payload.attempts as QuizAttempt[],
  }
}

export function getHistoryExportFilename(): string {
  const date = new Date().toISOString().slice(0, 10)
  return `quizforge-history-${date}.json`
}
