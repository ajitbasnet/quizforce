import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
        coverage: {
          provider: 'v8',
          include: ['src/utils/**', 'src/hooks/**'],
          exclude: [
            // Integration-heavy modules covered by E2E / manual QA (phases 85–86)
            'src/hooks/useAuth.tsx',
            'src/hooks/useHistory.ts',
            'src/hooks/useHistorySync.ts',
            'src/hooks/useKeyboardShortcuts.ts',
            'src/hooks/useLanguage.ts',
            'src/hooks/usePwaInstall.ts',
            'src/hooks/useQuickSettings.tsx',
            'src/hooks/useShortcutHelp.tsx',
            'src/hooks/useResultsVoiceReading.ts',
            'src/hooks/useFocusTrap.ts',
            'src/utils/pdfParser.ts',
            'src/utils/runCanvasConfetti.ts',
          ],
          thresholds: {
            lines: 70,
          },
        },
      },
    }),
  ),
)
