import { useLanguage } from '../../hooks/useLanguage'
import type { SupportedLanguage } from '../../types/quiz'
import { topBarLanguageSelectClass } from './topBarActionStyles'

export function LanguageSelector() {
  const { t, changeLanguage, currentLang, supportedLanguages } = useLanguage()

  return (
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
  )
}
