import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import {
  dismissOnboardingModal,
  selectSettingsLanguage,
  setupTestStorage,
} from './helpers'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

type ResponsiveSeed = {
  quiz: Record<string, unknown>
  attempt: Record<string, unknown>
}

async function loadQuizResponse() {
  return readFile(path.join(fixturesDir, 'quiz-api-response.json'), 'utf-8')
}

async function loadHistoryText() {
  return readFile(path.join(fixturesDir, 'history.txt'), 'utf-8')
}

async function mockQuizApi(page: Page, quizResponse: string) {
  await page.route('**/api/generate-quiz', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: quizResponse,
    })
  })
}

async function seedHistory(page: Page, seed: ResponsiveSeed) {
  await page.addInitScript((payload) => {
    localStorage.setItem(
      'quizforge-history',
      JSON.stringify({
        state: {
          quizzes: [payload.quiz],
          attempts: [payload.attempt],
        },
        version: 0,
      }),
    )
  }, seed)
}

async function completeQuiz(page: Page, questionCount = 5) {
  for (let i = 0; i < questionCount - 1; i += 1) {
    await page.getByTestId('answer-option').first().click()
    await page.getByTestId('next-question').click()
    await expect(page.getByText(`Question ${i + 2} of ${questionCount}`).first()).toBeVisible()
  }

  await page.getByTestId('answer-option').first().click()
  await page.getByTestId('submit-quiz').click()
  await expect(page).toHaveURL(/\/results\//)
}

test.describe('integration journeys', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestStorage(page)
  })

  test('J1: text quiz flow reaches history and switches to Spanish', async ({ page }) => {
    const [historyText, quizResponse] = await Promise.all([
      loadHistoryText(),
      loadQuizResponse(),
    ])

    await mockQuizApi(page, quizResponse)

    await page.goto('/')
    await page.getByRole('tab', { name: 'Paste Text' }).click()
    await page.getByLabel('Source text').fill(historyText)
    await page.getByRole('button', { name: 'Customize Quiz →' }).click()
    await page.getByLabel('Number of questions').fill('5')
    await page.getByTestId('generate-quiz').click()

    await expect(page).toHaveURL(/\/quiz$/)
    await completeQuiz(page)

    await dismissOnboardingModal(page)
    await page.goto('/history')
    await expect(page).toHaveURL(/\/history$/)
    await expect(page.getByText('Industrial Revolution Quiz')).toBeVisible()

    await page.getByRole('banner').getByRole('button', { name: 'Language' }).click()
    await page.getByRole('option', { name: 'Español' }).click()
    await page.goto('/')
    await expect(
      page.getByRole('heading', {
        name: 'Convierte cualquier contenido en un cuestionario',
      }),
    ).toBeVisible()
  })

  test('J2: PDF upload generates quiz and exports CSV results', async ({ page }) => {
    const quizResponse = await loadQuizResponse()
    await mockQuizApi(page, quizResponse)

    await page.goto('/')
    await page.getByRole('tab', { name: 'Upload PDF' }).click()

    const fileInput = page.locator('input[type="file"][accept*="pdf"]')
    await fileInput.setInputFiles(path.join(fixturesDir, 'sample.pdf'))

    await expect(page.getByText('Ready to generate quiz')).toBeVisible()

    await page.getByRole('button', { name: 'Customize Quiz →' }).click()
    await page.getByLabel('Number of questions').fill('5')
    await page.getByTestId('generate-quiz').click()

    await expect(page).toHaveURL(/\/quiz$/)
    await completeQuiz(page)

    await dismissOnboardingModal(page)
    await page.getByRole('button', { name: 'Export Results' }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'Export as CSV' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.csv$/)
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const csvContent = await readFile(downloadPath!, 'utf-8')
    expect(csvContent).toContain('Question')
    expect(csvContent).toContain('Your Answer')
    expect(csvContent).toContain('Correct Answer')
  })

  test('J3: Hindi settings language appears on history and retake', async ({ page }) => {
    const seed = JSON.parse(
      await readFile(path.join(fixturesDir, 'responsive-seed.json'), 'utf-8'),
    ) as ResponsiveSeed

    await seedHistory(page, seed)
    await page.goto('/settings')
    await selectSettingsLanguage(page, 'hi')
    await expect(
      page.getByRole('heading', { level: 1, name: 'सेटिंग्स' }),
    ).toBeVisible()

    await page.goto('/history')
    await expect(
      page.getByRole('heading', { level: 1, name: 'क्विज़ इतिहास' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'फिर से लें', exact: true }),
    ).toBeVisible()
  })
})
