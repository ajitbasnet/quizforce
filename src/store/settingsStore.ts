import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizSettings } from '../types/quiz'

const defaultSettings: QuizSettings = {
  pointsPerQuestion: 10,
  customPointsMap: {},
  questionsCount: 10,
  difficulty: 'mixed',
  voiceEnabled: false,
  voiceRate: 1,
  voicePitch: 1,
  voiceURI: null,
  timerEnabled: false,
  language: 'en',
}

interface SettingsState {
  settings: QuizSettings
  updateSettings: (partial: Partial<QuizSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    { name: 'quizforge-settings' }
  )
)
