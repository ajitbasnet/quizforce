import { ChevronDown } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import type { SupportedLanguage } from '../../types/quiz'
import { topBarLanguageSelectClass } from './topBarActionStyles'

export function LanguageSelector() {
  const { t, changeLanguage, currentLang, supportedLanguages } = useLanguage()

  return (
    <div className="group/lang relative inline-flex">
      <select
        value={currentLang}
        onChange={(e) => void changeLanguage(e.target.value as SupportedLanguage)}
        className={topBarLanguageSelectClass}
        aria-label={t('settings.language')}
      >
        {supportedLanguages.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted transition-colors duration-200 group-hover/lang:text-indigo-700"
        aria-hidden
      />
    </div>
  )
}
