import { create } from 'zustand'

interface VoiceState {
  isSpeaking: boolean
  isPaused: boolean
  currentText: string
  lastSpokenText: string
  setSpeaking: (isSpeaking: boolean) => void
  setPaused: (isPaused: boolean) => void
  setCurrentText: (currentText: string) => void
  setLastSpokenText: (lastSpokenText: string) => void
  endSpeech: () => void
  clearVoice: () => void
}

export const useVoiceStore = create<VoiceState>()((set) => ({
  isSpeaking: false,
  isPaused: false,
  currentText: '',
  lastSpokenText: '',
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setPaused: (isPaused) => set({ isPaused }),
  setCurrentText: (currentText) => set({ currentText }),
  setLastSpokenText: (lastSpokenText) => set({ lastSpokenText }),
  endSpeech: () => set({ isSpeaking: false, isPaused: false }),
  clearVoice: () =>
    set({
      isSpeaking: false,
      isPaused: false,
      currentText: '',
      lastSpokenText: '',
    }),
}))
