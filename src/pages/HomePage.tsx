import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <PageWrapper title={t('input.title')} description={t('input.subtitle')}>
      <div />
    </PageWrapper>
  )
}
