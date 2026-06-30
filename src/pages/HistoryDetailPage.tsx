import clsx from 'clsx'
import { Bookmark } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HistoryDetail } from '../components/history/HistoryDetail'
import { TagInput } from '../components/history/TagInput'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useLanguage } from '../hooks/useLanguage'
import { useHistoryStore } from '../store/historyStore'

export default function HistoryDetailPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { quizId } = useParams()
  const quizzes = useHistoryStore((s) => s.quizzes)
  const attempts = useHistoryStore((s) => s.attempts)
  const updateQuiz = useHistoryStore((s) => s.updateQuiz)
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite)

  const quiz = useMemo(
    () => (quizId ? quizzes.find((q) => q.id === quizId) : undefined),
    [quizzes, quizId],
  )

  const attempt = useMemo(() => {
    if (!quizId) return undefined
    return [...attempts]
      .filter((a) => a.quizId === quizId)
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      )[0]
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

  return (
    <PageWrapper title={quiz.title}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-text-primary">
                {t('history.metadata')}
              </h2>
              {quiz.description ? (
                <p className="mt-1 text-sm text-text-muted">
                  {quiz.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className={clsx(
                'shrink-0 rounded-full p-2 transition-colors',
                'hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600',
                isFavorited ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400',
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

        {attempt ? <HistoryDetail quiz={quiz} attempt={attempt} /> : null}

        <Button variant="secondary" onClick={() => navigate('/history')}>
          {t('history.backToHistory')}
        </Button>
      </div>
    </PageWrapper>
  )
}
