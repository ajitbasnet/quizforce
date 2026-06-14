import { useLanguage } from '../../hooks/useLanguage'

export function CachedResultsBanner() {
  const { t } = useLanguage()

  return (
    <div
      role="status"
      className="print:hidden rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {t('results.cachedResultsBanner')}
    </div>
  )
}
