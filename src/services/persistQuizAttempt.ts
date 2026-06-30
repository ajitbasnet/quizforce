import { useHistoryStore } from '../store/historyStore'
import type { Quiz, QuizAttempt } from '../types/quiz'

export async function persistQuizAttempt(
  quiz: Quiz,
  attempt: QuizAttempt,
): Promise<void> {
  const history = useHistoryStore.getState()
  const hasQuiz = history.quizzes.some((q) => q.id === quiz.id)
  if (!hasQuiz) {
    history.addQuiz(quiz)
  }
  history.addAttempt(attempt)
}
