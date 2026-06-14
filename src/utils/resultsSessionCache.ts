import type { Quiz, QuizAttempt } from '../types/quiz'

export const RESULTS_ATTEMPT_KEY = 'quizforge:last-attempt'
export const RESULTS_QUIZ_KEY = 'quizforge:last-quiz'

export function cacheResultsSession(attempt: QuizAttempt, quiz: Quiz): void {
  try {
    sessionStorage.setItem(RESULTS_ATTEMPT_KEY, JSON.stringify(attempt))
    sessionStorage.setItem(RESULTS_QUIZ_KEY, JSON.stringify(quiz))
  } catch {
    // quota exceeded or private browsing — ignore
  }
}

function isValidAttempt(value: unknown): value is QuizAttempt {
  if (typeof value !== 'object' || value === null) return false
  const attempt = value as Record<string, unknown>
  return (
    typeof attempt.id === 'string' &&
    typeof attempt.quizId === 'string' &&
    Array.isArray(attempt.feedback)
  )
}

function isValidQuiz(value: unknown): value is Quiz {
  if (typeof value !== 'object' || value === null) return false
  const quiz = value as Record<string, unknown>
  return typeof quiz.id === 'string' && Array.isArray(quiz.questions)
}

export function loadResultsSession(
  attemptId: string,
): { attempt: QuizAttempt; quiz: Quiz } | null {
  try {
    const attemptRaw = sessionStorage.getItem(RESULTS_ATTEMPT_KEY)
    const quizRaw = sessionStorage.getItem(RESULTS_QUIZ_KEY)
    if (!attemptRaw || !quizRaw) return null

    const attempt: unknown = JSON.parse(attemptRaw)
    const quiz: unknown = JSON.parse(quizRaw)

    if (!isValidAttempt(attempt) || !isValidQuiz(quiz)) return null
    if (attempt.id !== attemptId) return null
    if (quiz.id !== attempt.quizId) return null

    return { attempt, quiz }
  } catch {
    return null
  }
}
