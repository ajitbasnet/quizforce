import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HistoryCardSkeleton } from '../components/history/HistoryCardSkeleton'
import { AppShell } from '../components/layout/AppShell'
import { PageErrorBoundary } from '../components/layout/PageErrorBoundary'
import { PageWrapper } from '../components/layout/PageWrapper'
import HomePage from '../pages/HomePage'
import { QuizPageSkeleton } from '../components/quiz/QuizPageSkeleton'
import { ScorePanelSkeleton } from '../components/quiz/ScorePanelSkeleton'
import { Skeleton } from '../components/ui/Skeleton'

const QuizPage = lazy(() => import('../pages/QuizPage'))
const ResultsPage = lazy(() => import('../pages/ResultsPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const HistoryDetailPage = lazy(() => import('../pages/HistoryDetailPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

function DefaultPageFallback() {
  return (
    <PageWrapper>
      <div
        className="flex flex-col gap-4"
        aria-busy="true"
        aria-label="Loading page"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="mt-2 h-64 w-full rounded-xl" />
      </div>
    </PageWrapper>
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

function HistoryDetailPageFallback() {
  return (
    <PageWrapper>
      <div
        className="mx-auto flex w-full max-w-4xl flex-col gap-8"
        aria-busy="true"
        aria-label="Loading quiz details"
      >
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
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

function SettingsPageFallback() {
  return (
    <PageWrapper>
      <div
        className="grid gap-8 lg:grid-cols-[220px_1fr]"
        aria-busy="true"
        aria-label="Loading settings"
      >
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-28 shrink-0 rounded-lg" />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-xl" />
          ))}
        </div>
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
          <Route
            path="/history/:quizId"
            element={
              <LazyPage
                Page={HistoryDetailPage}
                fallback={<HistoryDetailPageFallback />}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <LazyPage Page={SettingsPage} fallback={<SettingsPageFallback />} />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
