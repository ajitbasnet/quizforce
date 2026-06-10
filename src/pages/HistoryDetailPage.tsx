import { useParams } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'

export default function HistoryDetailPage() {
  const { t } = useLanguage()
  const { quizId } = useParams()

  return (
    <PageWrapper title={t('history.title')}>
      <div data-quiz-id={quizId} />
    </PageWrapper>
  )
}
