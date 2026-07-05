import { useLanguage } from '../../hooks/useLanguage'
import { LANGUAGE_OPTIONS } from '../../i18n'
import type { SupportedLanguage } from '../../types/quiz'
import { Spinner } from '../ui/Spinner'

interface TranslatingQuizBannerProps {
  isTranslating: boolean
  targetLanguage: SupportedLanguage
}

export function TranslatingQuizBanner({
  isTranslating,
  targetLanguage,
}: TranslatingQuizBannerProps) {
  const { t } = useLanguage()

  if (!isTranslating) return null

  const languageName =
    LANGUAGE_OPTIONS.find((option) => option.code === targetLanguage)
      ?.nativeName ?? targetLanguage

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 border-b border-brand-100 bg-brand-50 px-4 py-2 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200"
    >
      <Spinner size="sm" className="text-brand-600" />
      <span>{t('quiz.translating', { language: languageName })}</span>
    </div>
  )
}
