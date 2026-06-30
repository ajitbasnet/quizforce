import { Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ClearHistoryModal } from '../components/history/ClearHistoryModal'
import { DeleteQuizModal } from '../components/history/DeleteQuizModal'
import { HistoryCard } from '../components/history/HistoryCard'
import { HistoryEmptyState } from '../components/history/HistoryEmptyState'
import { HistoryStatsBar } from '../components/history/HistoryStatsBar'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useHistory } from '../hooks/useHistory'
import { useLanguage } from '../hooks/useLanguage'
import { useHistoryStore } from '../store/historyStore'

export default function HistoryPage() {
  const { t } = useLanguage()
  const clearHistory = useHistoryStore((s) => s.clearHistory)
  const removeQuiz = useHistoryStore((s) => s.removeQuiz)
  const {
    quizzes,
    getLatestAttempt,
    stats,
    searchQuery,
    setSearchQuery,
    filteredQuizzes,
  } = useHistory()

  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null)

  const handleClearConfirm = useCallback(() => {
    clearHistory()
    setClearModalOpen(false)
    setSearchQuery('')
  }, [clearHistory, setSearchQuery])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteQuizId) return
    removeQuiz(deleteQuizId)
    setDeleteQuizId(null)
  }, [deleteQuizId, removeQuiz])

  const handleDeleteRequest = useCallback((quizId: string) => {
    setDeleteQuizId(quizId)
  }, [])

  return (
    <PageWrapper
      title={t('history.title')}
      actions={
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            className="text-red-600 hover:bg-red-50"
            disabled={quizzes.length === 0}
            onClick={() => setClearModalOpen(true)}
          >
            {t('history.clearAll')}
          </Button>
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('history.searchPlaceholder')}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full sm:w-64"
            aria-label={t('history.searchPlaceholder')}
          />
        </div>
      }
    >
      <HistoryStatsBar stats={stats} />

      {filteredQuizzes.length === 0 ? (
        <HistoryEmptyState hasQuizzes={quizzes.length > 0} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredQuizzes.map((quiz) => (
            <HistoryCard
              key={quiz.id}
              quiz={quiz}
              latestAttempt={getLatestAttempt(quiz.id)}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      <ClearHistoryModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearConfirm}
      />

      <DeleteQuizModal
        isOpen={deleteQuizId !== null}
        onClose={() => setDeleteQuizId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </PageWrapper>
  )
}
