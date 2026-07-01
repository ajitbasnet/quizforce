import { expect, type Page } from '@playwright/test'

export async function setupTestStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('quizforge:e2e-init')) return
    sessionStorage.setItem('quizforge:e2e-init', '1')
    localStorage.clear()
    localStorage.setItem('quizforge:onboarded', 'true')
    localStorage.setItem('quizforge:e2e-mock-pdf', 'true')
  })
}

export async function dismissOnboardingModal(page: Page): Promise<void> {
  const gotIt = page.getByRole('button', { name: 'Got it!' })
  if (await gotIt.isVisible()) {
    await gotIt.click()
  }
}

export async function selectSettingsLanguage(
  page: Page,
  languageCode: string,
): Promise<void> {
  const languageSelect = page.locator('#language')
  await expect(languageSelect).toBeVisible()
  await languageSelect.selectOption(languageCode)
}
