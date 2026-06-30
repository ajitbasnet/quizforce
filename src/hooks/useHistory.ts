import { useCallback, useMemo, useState } from 'react'
import { useHistoryStore } from '../store/historyStore'
import type { QuizAttempt } from '../types/quiz'

export interface HistoryStats {
  totalQuizzes: number
  totalQuestionsAnswered: number
  bestScore: number
  averageScore: number
}

export function useHistory() {
  const quizzes = useHistoryStore((s) => s.quizzes)
  const attempts = useHistoryStore((s) => s.attempts)
  const [searchQuery, setSearchQuery] = useState('')

  const sortedQuizzes = useMemo(
    () =>
      [...quizzes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [quizzes],
  )

  const getLatestAttempt = useCallback(
    (quizId: string): QuizAttempt | null => {
      const latest = attempts
        .filter((a) => a.quizId === quizId)
        .sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime(),
        )[0]
      return latest ?? null
    },
    [attempts],
  )

  const stats = useMemo((): HistoryStats => {
    const totalQuizzes = sortedQuizzes.length
    const totalQuestionsAnswered = attempts.reduce(
      (sum, attempt) => sum + attempt.feedback.length,
      0,
    )

    if (attempts.length === 0) {
      return {
        totalQuizzes,
        totalQuestionsAnswered,
        bestScore: 0,
        averageScore: 0,
      }
    }

    const percentages = attempts.map((a) => a.percentage)
    const bestScore = Math.max(...percentages)
    const averageScore = Math.round(
      percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
    )

    return {
      totalQuizzes,
      totalQuestionsAnswered,
      bestScore,
      averageScore,
    }
  }, [sortedQuizzes.length, attempts])

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return sortedQuizzes
    }

    return sortedQuizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query),
    )
  }, [sortedQuizzes, searchQuery])

  return {
    quizzes: sortedQuizzes,
    getLatestAttempt,
    stats,
    searchQuery,
    setSearchQuery,
    filteredQuizzes,
  }
}
