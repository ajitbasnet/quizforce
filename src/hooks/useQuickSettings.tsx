import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface QuickSettingsContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const QuickSettingsContext = createContext<QuickSettingsContextValue | null>(null)

export function QuickSettingsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((value) => !value), [])

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  )

  return (
    <QuickSettingsContext.Provider value={value}>
      {children}
    </QuickSettingsContext.Provider>
  )
}

export function useQuickSettings(): QuickSettingsContextValue {
  const context = useContext(QuickSettingsContext)
  if (!context) {
    throw new Error('useQuickSettings must be used within a QuickSettingsProvider')
  }
  return context
}
