import { create } from 'zustand'

interface QuizState {
  // populated in later phases
}

export const useQuizStore = create<QuizState>(() => ({}))
