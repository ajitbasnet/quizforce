import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { dismissOnboardingModal, setupTestStorage } from './helpers'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

test.describe('happy path', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestStorage(page)
  })

  test('generates a quiz from pasted text and completes it', async ({ page }) => {
    const historyText = await readFile(
      path.join(fixturesDir, 'history.txt'),
      'utf-8',
    )
    const quizResponse = await readFile(
      path.join(fixturesDir, 'quiz-api-response.json'),
      'utf-8',
    )

    await page.route('**/api/generate-quiz', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: quizResponse,
      })
    })

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Turn Any Content Into a Quiz' })).toBeVisible()

    await page.getByRole('tab', { name: 'Paste Text' }).click()
    await page.getByLabel('Source text').fill(historyText)

    await page.getByRole('button', { name: 'Customize Quiz →' }).click()
    await page.getByLabel('Number of questions').fill('5')
    await page.getByLabel('Default Points per Question').fill('20')

    await page.getByTestId('generate-quiz').click()

    await expect(page).toHaveURL(/\/quiz$/)
    await expect(page.getByTestId('quiz-progress')).toBeVisible()
    await expect(page.getByText('Question 1 of 5').first()).toBeVisible()
    await expect(
      page.getByText('Where did the Industrial Revolution begin?'),
    ).toBeVisible()

    for (let i = 0; i < 4; i += 1) {
      await page.getByTestId('answer-option').first().click()
      await page.getByTestId('next-question').click()
      await expect(page.getByText(`Question ${i + 2} of 5`).first()).toBeVisible()
    }

    await page.getByTestId('answer-option').first().click()
    await page.getByTestId('submit-quiz').click()

    await expect(page).toHaveURL(/\/results\//)
    await expect(page.getByRole('heading', { name: 'Industrial Revolution Quiz' })).toBeVisible()
    await expect(page.getByText('/ 100 points')).toBeVisible()

    await expect(page.getByText('Why this is correct:').first()).toBeVisible()
    await expect(page.locator('.border-success-500').first()).toBeVisible()

    await dismissOnboardingModal(page)
    await page.goto('/history')
    await expect(page).toHaveURL(/\/history$/)
    await expect(page.getByText('Industrial Revolution Quiz')).toBeVisible()
  })
})
