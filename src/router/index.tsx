import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HistoryCardSkeleton } from '../components/history/HistoryCardSkeleton'
import { AppShell } from '../components/layout/AppShell'
import { PageErrorBoundary } from '../components/layout/PageErrorBoundary'
import { PageWrapper } from '../components/layout/PageWrapper'
import HomePage from '../pages/HomePage'
import { QuizPageSkeleton } from '../components/quiz/QuizPageSkeleton'
import { ScorePanelSkeleton } from '../components/quiz/ScorePanelSkeleton'
import { Spinner } from '../components/ui/Spinner'

const QuizPage = lazy(() => import('../pages/QuizPage'))
const ResultsPage = lazy(() => import('../pages/ResultsPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const HistoryDetailPage = lazy(() => import('../pages/HistoryDetailPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

function DefaultPageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  )
}

function QuizPageFallback() {
  return (
    <PageWrapper>
      <div className="mx-auto w-full max-w-5xl">
        <QuizPageSkeleton />
      </div>
    </PageWrapper>
  )
}

function HistoryPageFallback() {
  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <HistoryCardSkeleton key={index} />
        ))}
      </div>
    </PageWrapper>
  )
}

function ResultsPageFallback() {
  return (
    <PageWrapper>
      <div className="mx-auto w-full max-w-4xl">
        <ScorePanelSkeleton />
      </div>
    </PageWrapper>
  )
}

function LazyPage({
  Page,
  fallback = <DefaultPageFallback />,
}: {
  Page: React.ComponentType
  fallback?: ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <PageErrorBoundary>
        <Page />
      </PageErrorBoundary>
    </Suspense>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <PageErrorBoundary>
                <HomePage />
              </PageErrorBoundary>
            }
          />
          <Route
            path="/quiz"
            element={<LazyPage Page={QuizPage} fallback={<QuizPageFallback />} />}
          />
          <Route
            path="/results"
            element={<LazyPage Page={ResultsPage} fallback={<ResultsPageFallback />} />}
          />
          <Route
            path="/results/:attemptId"
            element={<LazyPage Page={ResultsPage} fallback={<ResultsPageFallback />} />}
          />
          <Route
            path="/history"
            element={<LazyPage Page={HistoryPage} fallback={<HistoryPageFallback />} />}
          />
          <Route path="/history/:quizId" element={<LazyPage Page={HistoryDetailPage} />} />
          <Route path="/settings" element={<LazyPage Page={SettingsPage} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
