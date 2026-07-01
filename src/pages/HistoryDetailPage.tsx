import clsx from 'clsx'
import { Bookmark, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AttemptComparisonTable } from '../components/history/AttemptComparisonTable'
import { AttemptHistoryList } from '../components/history/AttemptHistoryList'
import { AttemptScoreChart } from '../components/history/AttemptScoreChart'
import { DeleteQuizModal } from '../components/history/DeleteQuizModal'
import { QuestionPreviewList } from '../components/history/QuestionPreviewList'
import { QuizMetadataPanel } from '../components/history/QuizMetadataPanel'
import { SourceContentCollapsible } from '../components/history/SourceContentCollapsible'
import { TagInput } from '../components/history/TagInput'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useLanguage } from '../hooks/useLanguage'
import { useHistoryStore } from '../store/historyStore'
import { useQuizStore } from '../store/quizStore'

export default function HistoryDetailPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { quizId } = useParams()
  const quizzes = useHistoryStore((s) => s.quizzes)
  const attempts = useHistoryStore((s) => s.attempts)
  const updateQuiz = useHistoryStore((s) => s.updateQuiz)
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite)
  const removeQuiz = useHistoryStore((s) => s.removeQuiz)
  const setCurrentQuiz = useQuizStore((s) => s.setCurrentQuiz)
  const resetAttempt = useQuizStore((s) => s.resetAttempt)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const quiz = useMemo(
    () => (quizId ? quizzes.find((q) => q.id === quizId) : undefined),
    [quizzes, quizId],
  )

  const quizAttempts = useMemo(() => {
    if (!quizId) return []
    return [...attempts]
      .filter((a) => a.quizId === quizId)
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      )
  }, [attempts, quizId])

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      if (!quiz) return
      updateQuiz(quiz.id, { tags })
    },
    [quiz, updateQuiz],
  )

  const handleToggleFavorite = useCallback(() => {
    if (!quiz) return
    toggleFavorite(quiz.id)
  }, [quiz, toggleFavorite])

  const handleRetake = useCallback(() => {
    if (!quiz) return
    setCurrentQuiz(quiz)
    resetAttempt()
    navigate('/quiz')
  }, [navigate, quiz, resetAttempt, setCurrentQuiz])

  const handleDeleteConfirm = useCallback(() => {
    if (!quiz) return
    removeQuiz(quiz.id)
    setDeleteModalOpen(false)
    navigate('/history')
  }, [navigate, quiz, removeQuiz])

  if (!quizId || !quiz) {
    return (
      <PageWrapper title={t('history.title')}>
        <Card className="mx-auto max-w-md text-center">
          <p className="text-text-primary">{t('errors.quizNotFound')}</p>
          <Button className="mt-4" onClick={() => navigate('/history')}>
            {t('history.backToHistory')}
          </Button>
        </Card>
      </PageWrapper>
    )
  }

  const isFavorited = quiz.isFavorited ?? false
  const tags = quiz.tags ?? []
  const showComparison = quizAttempts.length >= 2

  return (
    <PageWrapper title={quiz.title}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
            {t('history.backToHistory')}
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleRetake}>{t('history.retakeQuiz')}</Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger-600 hover:bg-danger-50"
              aria-label={t('history.deleteQuiz')}
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('history.metadata')}
            </h2>
            <button
              type="button"
              className={clsx(
                'shrink-0 rounded-full p-2 transition-colors',
                'hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
                isFavorited
                  ? 'text-amber-500'
                  : 'text-gray-300 hover:text-amber-400',
              )}
              aria-label={
                isFavorited ? t('history.unfavorite') : t('history.favorite')
              }
              aria-pressed={isFavorited}
              onClick={handleToggleFavorite}
            >
              <Bookmark
                className={clsx('h-5 w-5', isFavorited && 'fill-current')}
                aria-hidden
              />
            </button>
          </div>
          <TagInput tags={tags} onChange={handleTagsChange} />
        </Card>

        <QuizMetadataPanel quiz={quiz} />

        <AttemptHistoryList attempts={quizAttempts} />

        {showComparison ? (
          <>
            <AttemptComparisonTable attempts={quizAttempts} />
            <AttemptScoreChart attempts={quizAttempts} />
          </>
        ) : null}

        <SourceContentCollapsible quiz={quiz} />

        <QuestionPreviewList quiz={quiz} />
      </div>

      <DeleteQuizModal
        isOpen={deleteModalOpen}
        quizTitle={quiz?.title ?? ''}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </PageWrapper>
  )
}
