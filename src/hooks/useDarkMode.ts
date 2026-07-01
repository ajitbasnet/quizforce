export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_KEY = 'quizforge:theme'
export const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)'

const VALID_THEMES: ThemePreference[] = ['light', 'dark', 'system']

function isValidThemePreference(value: string | null): value is ThemePreference {
  return value !== null && (VALID_THEMES as string[]).includes(value)
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (isValidThemePreference(stored)) return stored
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
  return 'system'
}

export function writeStoredTheme(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_KEY, preference)
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia(DARK_MODE_MEDIA_QUERY).matches ? 'dark' : 'light'
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return getSystemTheme()
  return preference
}

export function applyThemeToDocument(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}
