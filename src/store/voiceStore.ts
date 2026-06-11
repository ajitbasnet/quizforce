import { create } from 'zustand'

interface VoiceState {
  isSpeaking: boolean
  isPaused: boolean
  currentText: string
  setSpeaking: (isSpeaking: boolean) => void
  setPaused: (isPaused: boolean) => void
  setCurrentText: (currentText: string) => void
  clearVoice: () => void
}

export const useVoiceStore = create<VoiceState>()((set) => ({
  isSpeaking: false,
  isPaused: false,
  currentText: '',
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setPaused: (isPaused) => set({ isPaused }),
  setCurrentText: (currentText) => set({ currentText }),
  clearVoice: () => set({ isSpeaking: false, isPaused: false, currentText: '' }),
}))
