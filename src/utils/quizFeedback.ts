import type { QuizQuestion } from '../types/quiz'

export function getOptionFeedback(
  q: QuizQuestion,
  optionId: string,
  submitted: boolean,
): string | null {
  if (!submitted) return null
  if (optionId === q.correctOptionId) return q.explanation
  return q.wrongExplanations[optionId] ?? null
}
