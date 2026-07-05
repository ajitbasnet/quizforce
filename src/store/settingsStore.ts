import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizSettings } from '../types/quiz'
import {
  DEFAULT_QUIZ_SETTINGS,
  normalizeQuizSettings,
} from '../utils/normalizeQuizSettings'

const defaultSettings: QuizSettings = DEFAULT_QUIZ_SETTINGS

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
    {
      name: 'quizforge-settings',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<SettingsState> | undefined
        return {
          ...currentState,
          ...persisted,
          settings: normalizeQuizSettings(persisted?.settings ?? {}),
        }
      },
    },
  ),
)
