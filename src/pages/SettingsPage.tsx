import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'

export default function SettingsPage() {
  const { t } = useLanguage()

  return (
    <PageWrapper title={t('settings.title')}>
      <div />
    </PageWrapper>
  )
}
