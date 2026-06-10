import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'

export default function HistoryPage() {
  const { t } = useLanguage()

  return (
    <PageWrapper title={t('history.title')}>
      <div />
    </PageWrapper>
  )
}
