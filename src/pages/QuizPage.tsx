import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'

export default function QuizPage() {
  const { t } = useLanguage()

  return (
    <PageWrapper title={t('nav.quiz')}>
      <div />
    </PageWrapper>
  )
}
