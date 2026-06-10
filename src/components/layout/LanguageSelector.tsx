import { useLanguage } from '../../hooks/useLanguage'
import type { SupportedLanguage } from '../../types/quiz'

export function LanguageSelector() {
  const { t, changeLanguage, currentLang, supportedLanguages } = useLanguage()

  return (
    <select
      value={currentLang}
      onChange={(e) => void changeLanguage(e.target.value as SupportedLanguage)}
      className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
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
