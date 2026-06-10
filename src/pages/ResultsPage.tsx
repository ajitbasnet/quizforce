import { useParams } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'

export default function ResultsPage() {
  const { t } = useLanguage()
  const { attemptId } = useParams()

  return (
    <PageWrapper title={t('results.title')}>
      <div data-attempt-id={attemptId} />
    </PageWrapper>
  )
}
