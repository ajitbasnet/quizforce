import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HistoryDetail } from '../components/history/HistoryDetail'
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

  if (!quizId || !quiz || !attempt) {
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

  return (
    <PageWrapper title={quiz.title}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <HistoryDetail quiz={quiz} attempt={attempt} />
        <Button variant="secondary" onClick={() => navigate('/history')}>
          {t('history.backToHistory')}
        </Button>
      </div>
    </PageWrapper>
  )
}
