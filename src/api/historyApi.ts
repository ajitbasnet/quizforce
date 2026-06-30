import type { Quiz, QuizAttempt } from '../types/quiz'
import { getLocalUserId } from '../utils/localUserId'
import {
  deleteQuiz as deleteQuizFromSupabase,
  fetchAttemptsForUser,
  getQuizHistory,
  getSupabaseClient,
  isSupabaseConfigured,
  saveAttempt,
  saveQuiz,
} from './supabase'

export async function getSyncUserId(): Promise<string> {
  const supabase = getSupabaseClient()
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user?.id) return session.user.id
  }
  return getLocalUserId()
}

export async function syncQuiz(quiz: Quiz): Promise<void> {
  if (!isSupabaseConfigured()) return
  const userId = await getSyncUserId()
  await saveQuiz(quiz, userId)
}

export async function syncAttempt(attempt: QuizAttempt): Promise<void> {
  if (!isSupabaseConfigured()) return
  const userId = await getSyncUserId()
  await saveAttempt(attempt, userId)
}

export async function fetchHistory(
  userId: string,
): Promise<{ quizzes: Quiz[]; attempts: QuizAttempt[] }> {
  const [quizzes, attempts] = await Promise.all([
    getQuizHistory(userId),
    fetchAttemptsForUser(userId),
  ])
  return { quizzes, attempts }
}

export async function deleteQuiz(
  quizId: string,
  userId?: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const uid = userId ?? (await getSyncUserId())
  await deleteQuizFromSupabase(quizId, uid)
}
