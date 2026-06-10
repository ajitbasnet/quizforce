import { create } from 'zustand'

interface SettingsState {
  // populated in later phases
}

export const useSettingsStore = create<SettingsState>(() => ({}))
