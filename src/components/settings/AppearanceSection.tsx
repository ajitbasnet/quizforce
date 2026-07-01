import clsx from 'clsx'
import { Download } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { fieldLabelClass } from '../ui/formFieldUtils'
import { SettingsSectionCard } from './SettingsSectionCard'

export function AppearanceSection() {
  const { t } = useLanguage()
  const { canInstall, promptInstall } = usePwaInstall()

  return (
    <SettingsSectionCard
      id="appearance"
      title={t('settings.sectionAppearance')}
      saved={false}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={clsx(fieldLabelClass, 'mb-0')}>
              {t('settings.darkMode')}
            </span>
            <Badge variant="warning" size="sm">
              {t('settings.comingSoon')}
            </Badge>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={false}
            aria-label={t('settings.darkMode')}
            disabled
            className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-200 opacity-50 dark:bg-gray-600"
          >
            <span className="pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow ring-0" />
          </button>
        </div>
        <p className="text-sm text-text-muted dark:text-gray-400">
          {t('settings.appearanceDescription')}
        </p>
        {canInstall ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Download aria-hidden className="h-4 w-4" />}
            onClick={() => void promptInstall()}
          >
            {t('pwa.installApp')}
          </Button>
        ) : null}
      </div>
    </SettingsSectionCard>
  )
}
