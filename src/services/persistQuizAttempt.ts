import { isSupabaseConfigured, saveAttempt, saveQuiz } from '../api/supabase'
import { useHistoryStore } from '../store/historyStore'
import type { Quiz, QuizAttempt } from '../types/quiz'
import { getLocalUserId } from '../utils/localUserId'

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

  if (!isSupabaseConfigured()) return

  try {
    const userId = getLocalUserId()
    await saveQuiz(quiz, userId)
    await saveAttempt(attempt, userId)
  } catch (error) {
    console.error('Failed to persist quiz attempt to Supabase:', error)
  }
}
