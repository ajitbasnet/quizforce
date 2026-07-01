import { Download, Search, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { isSupabaseConfigured } from '../api/supabase'
import { ClearHistoryModal } from '../components/history/ClearHistoryModal'
import { DeleteQuizModal } from '../components/history/DeleteQuizModal'
import { HistoryCard } from '../components/history/HistoryCard'
import { HistoryCardSkeleton } from '../components/history/HistoryCardSkeleton'
import { HistoryEmptyState } from '../components/history/HistoryEmptyState'
import { HistoryFilterToolbar } from '../components/history/HistoryFilterToolbar'
import { HistoryStatsBar } from '../components/history/HistoryStatsBar'
import { PageWrapper } from '../components/layout/PageWrapper'
import { PageMeta } from '../components/seo/PageMeta'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { useHistory } from '../hooks/useHistory'
import { useDebounce } from '../hooks/useDebounce'
import { useHistorySync } from '../hooks/useHistorySync'
import { useRegisterShortcutActions } from '../hooks/useKeyboardShortcuts'
import { useLanguage } from '../hooks/useLanguage'
import { useHistoryStore } from '../store/historyStore'
import { downloadFile } from '../utils/downloadFile'
import {
  buildHistoryExport,
  getHistoryExportFilename,
  validateHistoryImport,
} from '../utils/historyExport'

const PAGE_SIZE = 12

export default function HistoryPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { isLoading: isHistorySyncLoading } = useHistorySync()
  const clearHistory = useHistoryStore((s) => s.clearHistory)
  const removeQuiz = useHistoryStore((s) => s.removeQuiz)
  const importHistory = useHistoryStore((s) => s.importHistory)
  const allAttempts = useHistoryStore((s) => s.attempts)
  const importInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const {
    quizzes,
    getLatestAttempt,
    stats,
    filters,
    setFilters,
    clearFilters,
    filteredQuizzes,
  } = useHistory()

  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(filters.q)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const debouncedSearch = useDebounce(searchInput, 200)

  useEffect(() => {
    setSearchInput(filters.q)
  }, [filters.q])

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setFilters({ q: debouncedSearch })
    }
  }, [debouncedSearch, filters.q, setFilters])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filters.q, filters.type, filters.sort, filters.starred, filters.tag])

  useRegisterShortcutActions(
    {
      'history-focus-search': () => {
        searchInputRef.current?.focus()
      },
    },
    [],
  )

  const visibleQuizzes = filteredQuizzes.slice(0, visibleCount)
  const showLoadMore = filteredQuizzes.length > visibleCount
  const showHistorySkeletons =
    isSupabaseConfigured() && isHistorySyncLoading && quizzes.length === 0

  const handleClearConfirm = useCallback(() => {
    clearHistory()
    setClearModalOpen(false)
    clearFilters()
  }, [clearHistory, clearFilters])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteQuizId) return
    removeQuiz(deleteQuizId)
    setDeleteQuizId(null)
  }, [deleteQuizId, removeQuiz])

  const handleDeleteRequest = useCallback((quizId: string) => {
    setDeleteQuizId(quizId)
  }, [])

  const deleteQuizTitle = useMemo(
    () => quizzes.find((quiz) => quiz.id === deleteQuizId)?.title ?? '',
    [deleteQuizId, quizzes],
  )

  const handleExport = useCallback(() => {
    const payload = buildHistoryExport(quizzes, allAttempts)
    const filename = getHistoryExportFilename()
    downloadFile(
      JSON.stringify(payload, null, 2),
      filename,
      'application/json',
    )
  }, [allAttempts, quizzes])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      try {
        const text = await file.text()
        const data: unknown = JSON.parse(text)
        const payload = validateHistoryImport(data)

        if (!payload) {
          toast.error(t('history.importInvalid'))
          return
        }

        const { quizzesAdded, attemptsAdded } = importHistory(payload)
        toast.success(
          t('history.importSuccess', {
            quizzes: quizzesAdded,
            attempts: attemptsAdded,
          }),
        )
      } catch {
        toast.error(t('history.importFailed'))
      }
    },
    [importHistory, t, toast],
  )

  return (
    <PageWrapper
      title={t('history.title')}
      actions={
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            disabled={quizzes.length === 0}
            onClick={handleExport}
          >
            <Download className="h-4 w-4" aria-hidden />
            {t('history.exportAll')}
          </Button>
          <Button type="button" variant="ghost" onClick={handleImportClick}>
            <Upload className="h-4 w-4" aria-hidden />
            {t('history.importHistory')}
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-hidden
            onChange={handleImportFile}
          />
          <Button
            type="button"
            variant="ghost"
            className="text-danger-600 hover:bg-danger-50"
            disabled={quizzes.length === 0}
            onClick={() => setClearModalOpen(true)}
          >
            {t('history.clearAll')}
          </Button>
          <Input
            ref={searchInputRef}
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('history.searchPlaceholder')}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full sm:w-64"
            aria-label={t('history.searchPlaceholder')}
          />
        </div>
      }
    >
      <PageMeta title="Quiz History — QuizForge" />
      <HistoryStatsBar stats={stats} />

      {quizzes.length > 0 && (
        <HistoryFilterToolbar filters={filters} onFiltersChange={setFilters} />
      )}

      {showHistorySkeletons ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <HistoryCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <HistoryEmptyState
          variant={quizzes.length > 0 ? 'noSearchResults' : 'firstVisit'}
          searchQuery={filters.q}
          onClearSearch={() => setFilters({ q: '' })}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleQuizzes.map((quiz) => (
              <HistoryCard
                key={quiz.id}
                quiz={quiz}
                latestAttempt={getLatestAttempt(quiz.id)}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
          {showLoadMore ? (
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                {t('history.loadMore')}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <ClearHistoryModal
        isOpen={clearModalOpen}
        quizCount={quizzes.length}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearConfirm}
      />

      <DeleteQuizModal
        isOpen={deleteQuizId !== null}
        quizTitle={deleteQuizTitle}
        onClose={() => setDeleteQuizId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </PageWrapper>
  )
}
