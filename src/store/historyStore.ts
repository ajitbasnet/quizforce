import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Quiz, QuizAttempt } from '../types/quiz'

interface HistoryState {
  quizzes: Quiz[]
  attempts: QuizAttempt[]
  addQuiz: (quiz: Quiz) => void
  addAttempt: (attempt: QuizAttempt) => void
  removeQuiz: (quizId: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      quizzes: [],
      attempts: [],

      addQuiz: (quiz) =>
        set((state) => ({
          quizzes: [...state.quizzes, quiz],
        })),

      addAttempt: (attempt) =>
        set((state) => ({
          attempts: [...state.attempts, attempt],
        })),

      removeQuiz: (quizId) =>
        set((state) => ({
          quizzes: state.quizzes.filter((q) => q.id !== quizId),
          attempts: state.attempts.filter((a) => a.quizId !== quizId),
        })),

      clearHistory: () => set({ quizzes: [], attempts: [] }),
    }),
    { name: 'quizforge-history' }
  )
)
