export const ONBOARDING_KEY = 'quizforge:onboarded'

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
  } catch {
    return false
  }
}

export function markOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true')
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}
