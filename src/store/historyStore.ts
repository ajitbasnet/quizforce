import { create } from 'zustand'

interface HistoryState {
  // populated in later phases
}

export const useHistoryStore = create<HistoryState>(() => ({}))
