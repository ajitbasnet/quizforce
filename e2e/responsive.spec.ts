import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')
const screenshotsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'screenshots',
)

type ResponsiveSeed = {
  quiz: Record<string, unknown>
  attempt: Record<string, unknown>
}

function getViewportName(projectName: string): string {
  return projectName.replace(/^responsive-/, '')
}

async function loadFixtures() {
  const [historyText, quizResponse, seed] = await Promise.all([
    readFile(path.join(fixturesDir, 'history.txt'), 'utf-8'),
    readFile(path.join(fixturesDir, 'quiz-response.json'), 'utf-8'),
    readFile(path.join(fixturesDir, 'responsive-seed.json'), 'utf-8'),
  ])

  return {
    historyText,
    quizResponse,
    seed: JSON.parse(seed) as ResponsiveSeed,
  }
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

async function mockQuizApi(page: Page, quizResponse: string) {
  await page.route('**/api/generate-quiz', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: quizResponse,
    })
  })
}

async function navigateToQuiz(page: Page, historyText: string) {
  await page.goto('/')
  await page.getByRole('tab', { name: 'Paste Text' }).click()
  await page.getByLabel('Source text').fill(historyText)
  await page.getByRole('button', { name: 'Customize Quiz →' }).click()
  await page.getByLabel('Number of questions').fill('5')
  await page.getByLabel('Default Points per Question').fill('20')
  await page.getByTestId('generate-quiz').click()
  await expect(page).toHaveURL(/\/quiz$/)
  await expect(page.getByTestId('quiz-progress')).toBeVisible()
}

async function captureScreenshot(
  page: Page,
  viewportName: string,
  pageName: string,
) {
  await page.screenshot({
    path: path.join(screenshotsDir, viewportName, `${pageName}.png`),
    fullPage: true,
  })
}

test.describe('responsive screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('captures key pages at the configured viewport', async ({ page }, testInfo) => {
    const viewportName = getViewportName(testInfo.project.name)
    const { historyText, quizResponse, seed } = await loadFixtures()

    await mockQuizApi(page, quizResponse)
    await seedHistory(page, seed)

    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Turn Any Content Into a Quiz' }),
    ).toBeVisible()
    await captureScreenshot(page, viewportName, 'home')

    await navigateToQuiz(page, historyText)
    await captureScreenshot(page, viewportName, 'quiz')

    await page.goto(`/results/${seed.attempt.id}`)
    await expect(
      page.getByRole('heading', { name: 'Industrial Revolution Quiz' }),
    ).toBeVisible()
    await captureScreenshot(page, viewportName, 'results')

    await page.goto('/history')
    await expect(page.getByText('Industrial Revolution Quiz')).toBeVisible()
    await captureScreenshot(page, viewportName, 'history')
  })
})
