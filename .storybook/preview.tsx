import type { Preview } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/hooks/useDarkMode.tsx'
import { THEME_KEY } from '../src/hooks/useDarkMode'
import '../src/i18n'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#F8F7FF' },
        { name: 'dark', value: '#030712' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Light or dark mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      const theme = globals.theme === 'dark' ? 'dark' : 'light'
      try {
        localStorage.setItem(THEME_KEY, theme)
      } catch {
        // ignore storage errors in Storybook iframe
      }

      return (
        <MemoryRouter key={theme}>
          <ThemeProvider>
            <Story />
          </ThemeProvider>
        </MemoryRouter>
      )
    },
  ],
}

export default preview
