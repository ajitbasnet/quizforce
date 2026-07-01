import { Globe, History, Volume2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface OnboardingWelcomeModalProps {
  isOpen: boolean
  onDismiss: () => void
}

const TIPS: { key: string; icon: LucideIcon }[] = [
  { key: 'onboarding.tipVoice', icon: Volume2 },
  { key: 'onboarding.tipLanguage', icon: Globe },
  { key: 'onboarding.tipHistory', icon: History },
]

export function OnboardingWelcomeModal({
  isOpen,
  onDismiss,
}: OnboardingWelcomeModalProps) {
  const { t } = useLanguage()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      title={t('onboarding.welcomeTitle')}
      size="md"
      footer={
        <Button type="button" variant="primary" onClick={onDismiss}>
          {t('onboarding.gotIt')}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl dark:bg-gray-800"
          aria-hidden
        >
          🎉
        </div>

        <ul className="w-full space-y-3">
          {TIPS.map(({ key, icon: Icon }) => (
            <li key={key} className="flex gap-3 text-sm text-text-primary dark:text-gray-100">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-gray-800 dark:text-indigo-400">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
