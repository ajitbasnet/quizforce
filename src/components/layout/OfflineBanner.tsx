import { useEffect, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

export function OfflineBanner() {
  const { t } = useLanguage()
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-16 z-40 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-700"
    >
      {t('pwa.offlineBanner')}
    </div>
  )
}
