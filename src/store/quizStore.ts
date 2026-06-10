import { create } from 'zustand'
import type { Quiz, QuizAttempt } from '../types/quiz'

interface QuizState {
  currentQuiz: Quiz | null
  currentAttempt: Partial<QuizAttempt>
  userAnswers: Record<string, string>
  isGenerating: boolean
  generationProgress: number
  generationError: string | null
  setCurrentQuiz: (quiz: Quiz | null) => void
  setAnswer: (questionId: string, optionId: string) => void
  resetAttempt: () => void
  setGenerating: (isGenerating: boolean) => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuiz: null,
  currentAttempt: {},
  userAnswers: {},
  isGenerating: false,
  generationProgress: 0,
  generationError: null,

  setCurrentQuiz: (quiz) =>
    set({
      currentQuiz: quiz,
      currentAttempt: {},
      userAnswers: {},
      isGenerating: false,
      generationProgress: 0,
      generationError: null,
    }),

  setAnswer: (questionId, optionId) =>
    set((state) => ({
      userAnswers: { ...state.userAnswers, [questionId]: optionId },
      currentAttempt: {
        ...state.currentAttempt,
        answers: { ...state.currentAttempt.answers, [questionId]: optionId },
      },
    })),

  resetAttempt: () => set({ currentAttempt: {}, userAnswers: {} }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setProgress: (progress) =>
    set({ generationProgress: Math.min(100, Math.max(0, progress)) }),

  setError: (error) => set({ generationError: error }),
}))
