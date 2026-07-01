import clsx from 'clsx'
import { Download } from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode.tsx'
import type { ThemePreference } from '../../hooks/useDarkMode'
import { useLanguage } from '../../hooks/useLanguage'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { Button } from '../ui/Button'
import { fieldLabelClass } from '../ui/formFieldUtils'
import { SettingsSectionCard } from './SettingsSectionCard'

const THEME_OPTIONS: ThemePreference[] = ['light', 'system', 'dark']

const THEME_LABEL_KEYS: Record<ThemePreference, string> = {
  light: 'settings.themeLight',
  system: 'settings.themeSystem',
  dark: 'settings.themeDark',
}

export function AppearanceSection() {
  const { t } = useLanguage()
  const { theme, setTheme } = useDarkMode()
  const { canInstall, promptInstall } = usePwaInstall()

  return (
    <SettingsSectionCard
      id="appearance"
      title={t('settings.sectionAppearance')}
      saved={false}
    >
      <div className="flex flex-col gap-3">
        <div>
          <span className={fieldLabelClass}>{t('settings.darkMode')}</span>
          <div
            role="radiogroup"
            aria-label={t('settings.darkMode')}
            className="flex rounded-lg bg-surface-subtle p-1 dark:bg-gray-800"
          >
            {THEME_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={theme === option}
                className={clsx(
                  'flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                  theme === option
                    ? 'bg-surface text-brand-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400'
                    : 'text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-gray-100',
                )}
                onClick={() => setTheme(option)}
              >
                {t(THEME_LABEL_KEYS[option])}
              </button>
            ))}
          </div>
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
