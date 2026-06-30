import { QuizGenerationError } from '../types/api'

const STORAGE_KEY = 'quizforge:last-generation'
const COOLDOWN_MS = 10_000

export function assertGenerationAllowed(): void {
  const last = localStorage.getItem(STORAGE_KEY)
  if (!last) return

  const elapsed = Date.now() - Number(last)
  if (Number.isFinite(elapsed) && elapsed < COOLDOWN_MS) {
    throw new QuizGenerationError(
      'Please wait before generating another quiz.',
      'RATE_LIMIT_CLIENT',
    )
  }
}

export function recordGeneration(): void {
  localStorage.setItem(STORAGE_KEY, String(Date.now()))
}
