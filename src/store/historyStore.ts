import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as historyApi from '../api/historyApi'
import { isSupabaseConfigured } from '../api/supabase'
import type { Quiz, QuizAttempt } from '../types/quiz'

function normalizeQuiz(quiz: Quiz): Quiz {
  return {
    ...quiz,
    isFavorited: quiz.isFavorited ?? false,
    tags: quiz.tags ?? [],
  }
}

interface HistoryState {
  quizzes: Quiz[]
  attempts: QuizAttempt[]
  isSyncing: boolean
  addQuiz: (quiz: Quiz) => void
  addAttempt: (attempt: QuizAttempt) => void
  updateQuiz: (id: string, patch: Partial<Quiz>) => void
  toggleFavorite: (quizId: string) => void
  mergeRemoteHistory: (payload: {
    quizzes: Quiz[]
    attempts: QuizAttempt[]
  }) => void
  importHistory: (payload: {
    quizzes: Quiz[]
    attempts: QuizAttempt[]
  }) => { quizzesAdded: number; attemptsAdded: number }
  setSyncing: (syncing: boolean) => void
  getAttemptById: (id: string) => QuizAttempt | undefined
  removeQuiz: (quizId: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      quizzes: [],
      attempts: [],
      isSyncing: false,

      addQuiz: (quiz) => {
        const normalized = normalizeQuiz(quiz)
        set((state) => ({
          quizzes: [...state.quizzes, normalized],
        }))
        void historyApi.syncQuiz(normalized).catch((error) => {
          console.error('Failed to sync quiz:', error)
        })
      },

      addAttempt: (attempt) => {
        set((state) => ({
          attempts: [...state.attempts, attempt],
        }))
        void historyApi.syncAttempt(attempt).catch((error) => {
          console.error('Failed to sync attempt:', error)
        })
      },

      updateQuiz: (id, patch) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === id ? normalizeQuiz({ ...q, ...patch }) : q,
          ),
        }))
        const updated = get().quizzes.find((q) => q.id === id)
        if (updated) {
          void historyApi.syncQuiz(updated).catch((error) => {
            console.error('Failed to sync quiz update:', error)
          })
        }
      },

      toggleFavorite: (quizId) => {
        const quiz = get().quizzes.find((q) => q.id === quizId)
        if (!quiz) return
        get().updateQuiz(quizId, { isFavorited: !(quiz.isFavorited ?? false) })
      },

      mergeRemoteHistory: ({ quizzes: remoteQuizzes, attempts: remoteAttempts }) => {
        set((state) => {
          const quizMap = new Map(
            state.quizzes.map((q) => [q.id, normalizeQuiz(q)]),
          )

          for (const remote of remoteQuizzes) {
            const normalized = normalizeQuiz(remote)
            const local = quizMap.get(normalized.id)
            if (!local) {
              quizMap.set(normalized.id, normalized)
            } else {
              const remoteNewer =
                new Date(normalized.createdAt) > new Date(local.createdAt)
              const winner = remoteNewer ? normalized : local
              quizMap.set(
                normalized.id,
                normalizeQuiz({
                  ...winner,
                  isFavorited: local.isFavorited,
                  tags: local.tags,
                }),
              )
            }
          }

          const attemptMap = new Map(state.attempts.map((a) => [a.id, a]))
          for (const remote of remoteAttempts) {
            const local = attemptMap.get(remote.id)
            if (!local) {
              attemptMap.set(remote.id, remote)
            } else {
              const winner =
                new Date(remote.completedAt) > new Date(local.completedAt)
                  ? remote
                  : local
              attemptMap.set(remote.id, winner)
            }
          }

          return {
            quizzes: Array.from(quizMap.values()),
            attempts: Array.from(attemptMap.values()),
          }
        })
      },

      importHistory: (payload) => {
        let quizzesAdded = 0
        let attemptsAdded = 0

        set((state) => {
          const quizIds = new Set(state.quizzes.map((q) => q.id))
          const attemptIds = new Set(state.attempts.map((a) => a.id))
          const newQuizzes = [...state.quizzes]
          const newAttempts = [...state.attempts]

          for (const quiz of payload.quizzes) {
            if (!quizIds.has(quiz.id)) {
              newQuizzes.push(normalizeQuiz(quiz))
              quizIds.add(quiz.id)
              quizzesAdded++
            }
          }

          for (const attempt of payload.attempts) {
            if (!attemptIds.has(attempt.id)) {
              newAttempts.push(attempt)
              attemptIds.add(attempt.id)
              attemptsAdded++
            }
          }

          return { quizzes: newQuizzes, attempts: newAttempts }
        })

        return { quizzesAdded, attemptsAdded }
      },

      setSyncing: (syncing) => set({ isSyncing: syncing }),

      getAttemptById: (id) => get().attempts.find((a) => a.id === id),

      removeQuiz: (quizId) => {
        set((state) => ({
          quizzes: state.quizzes.filter((q) => q.id !== quizId),
          attempts: state.attempts.filter((a) => a.quizId !== quizId),
        }))
        void historyApi.deleteQuiz(quizId).catch((error) => {
          console.error('Failed to delete quiz from Supabase:', error)
        })
      },

      clearHistory: () => {
        const quizIds = get().quizzes.map((q) => q.id)
        set({ quizzes: [], attempts: [] })
        if (isSupabaseConfigured()) {
          void Promise.all(
            quizIds.map((id) =>
              historyApi.deleteQuiz(id).catch((error) => {
                console.error('Failed to delete quiz from Supabase:', error)
              }),
            ),
          )
        }
      },
    }),
    {
      name: 'quizforge-history',
      partialize: (state) => ({
        quizzes: state.quizzes,
        attempts: state.attempts,
      }),
    },
  ),
)
