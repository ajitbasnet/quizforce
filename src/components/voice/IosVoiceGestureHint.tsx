import { X } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { useIosVoiceGestureHint } from '../../hooks/useIosVoiceGestureHint'

interface IosVoiceGestureHintProps {
  voiceEnabled: boolean
}

export function IosVoiceGestureHint({ voiceEnabled }: IosVoiceGestureHintProps) {
  const { t } = useLanguage()
  const { showHint, dismissHint } = useIosVoiceGestureHint(voiceEnabled)

  if (!showHint) return null

  return (
    <div
      className="fixed inset-x-4 bottom-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom)))] z-50 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 shadow-lg dark:border-brand-800 dark:bg-brand-950/90 lg:bottom-6"
      role="status"
    >
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-sm text-brand-900 dark:text-brand-100">
          {t('voice.iosGestureHint')}
        </p>
        <button
          type="button"
          className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-md text-brand-700 hover:bg-brand-100 dark:text-brand-200 dark:hover:bg-brand-900"
          aria-label={t('voice.iosGestureHintDismiss')}
          onClick={dismissHint}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
