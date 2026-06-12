import { useEffect, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuizStore } from '../../store/quizStore'

interface OfflineGenerationBannerProps {
  onOffline?: () => void
}

export function OfflineGenerationBanner({
  onOffline,
}: OfflineGenerationBannerProps) {
  const { t } = useLanguage()
  const isGenerating = useQuizStore((s) => s.isGenerating)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      onOffline?.()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [onOffline])

  if (isOnline || !isGenerating) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-16 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
      {t('errors.offlineGenerationPaused')}
    </div>
  )
}
