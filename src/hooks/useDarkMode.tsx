import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DARK_MODE_MEDIA_QUERY,
  type ResolvedTheme,
  type ThemePreference,
  applyThemeToDocument,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
} from './useDarkMode'

interface DarkModeContextValue {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (preference: ThemePreference) => void
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => readStoredTheme())
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(readStoredTheme()),
  )

  useEffect(() => {
    applyThemeToDocument(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    setResolvedTheme(resolveTheme(theme))
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return

    const mediaQueryList = window.matchMedia(DARK_MODE_MEDIA_QUERY)
    const onChange = () => setResolvedTheme(resolveTheme('system'))

    mediaQueryList.addEventListener('change', onChange)
    return () => mediaQueryList.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((preference: ThemePreference) => {
    writeStoredTheme(preference)
    setThemeState(preference)
    setResolvedTheme(resolveTheme(preference))
  }, [])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return (
    <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>
  )
}

export function useDarkMode(): DarkModeContextValue {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within a ThemeProvider')
  }
  return context
}
