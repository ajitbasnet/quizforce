import type { QuizSettings } from '../types/quiz'

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
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

/** Merge partial / legacy persisted settings with defaults before API or form use. */
export function normalizeQuizSettings(
  settings: Partial<QuizSettings> | QuizSettings,
): QuizSettings {
  return {
    ...DEFAULT_QUIZ_SETTINGS,
    ...settings,
    customPointsMap: settings.customPointsMap ?? {},
    voiceURI: settings.voiceURI ?? null,
    timerEnabled: settings.timerEnabled ?? false,
  }
}
