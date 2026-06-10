import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Spinner } from '../components/ui/Spinner'

const HomePage = lazy(() => import('../pages/HomePage'))
const QuizPage = lazy(() => import('../pages/QuizPage'))
const ResultsPage = lazy(() => import('../pages/ResultsPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const HistoryDetailPage = lazy(() => import('../pages/HistoryDetailPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

function LazyPage({ Page }: { Page: React.ComponentType }) {
  return (
    <Suspense fallback={<Spinner />}>
      <Page />
    </Suspense>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LazyPage Page={HomePage} />} />
          <Route path="/quiz" element={<LazyPage Page={QuizPage} />} />
          <Route path="/results/:attemptId" element={<LazyPage Page={ResultsPage} />} />
          <Route path="/history" element={<LazyPage Page={HistoryPage} />} />
          <Route path="/history/:quizId" element={<LazyPage Page={HistoryDetailPage} />} />
          <Route path="/settings" element={<LazyPage Page={SettingsPage} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
