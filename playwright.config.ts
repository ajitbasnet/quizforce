import { defineConfig, devices } from '@playwright/test'

const previewPort = 4173
const baseURL = `http://localhost:${previewPort}`

const responsiveViewports = [
  { name: 'iphone-14', width: 375, height: 812 },
  { name: 'ipad', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
] as const

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /responsive\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    ...responsiveViewports.map((viewport) => ({
      name: `responsive-${viewport.name}`,
      testMatch: /responsive\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: viewport.width, height: viewport.height },
      },
    })),
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${previewPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_ANTHROPIC_API_KEY: 'test-key-for-e2e',
    },
  },
})
