import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { registerSW } from 'virtual:pwa-register'
import { ToastProvider } from './components/ui/Toast'
import { ThemeProvider } from './hooks/useDarkMode.tsx'
import './index.css'
import './i18n'
import App from './App.tsx'

if (import.meta.env.PROD) {
  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = 'quizforge.app'
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <HelmetProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ToastProvider>
      </HelmetProvider>
    </ThemeProvider>
  </StrictMode>,
)
