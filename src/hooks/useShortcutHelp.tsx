import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface ShortcutHelpContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const ShortcutHelpContext = createContext<ShortcutHelpContextValue | null>(null)

export function ShortcutHelpProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
  )

  return (
    <ShortcutHelpContext.Provider value={value}>
      {children}
    </ShortcutHelpContext.Provider>
  )
}

export function useShortcutHelp(): ShortcutHelpContextValue {
  const context = useContext(ShortcutHelpContext)
  if (!context) {
    throw new Error('useShortcutHelp must be used within a ShortcutHelpProvider')
  }
  return context
}
