import { LANGUAGE_OPTIONS } from '../../i18n'
import { useLanguage } from '../../hooks/useLanguage'
import type { QuizSettings } from '../../types/quiz'
import { Select } from '../ui/Select'

interface SettingsLanguageFieldProps {
  value: QuizSettings['language']
  onChange: (language: QuizSettings['language']) => void
  showDescription?: boolean
}

export function SettingsLanguageField({
  value,
  onChange,
  showDescription = false,
}: SettingsLanguageFieldProps) {
  const { t } = useLanguage()

  return (
    <>
      <Select
        label={t('settings.language')}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as QuizSettings['language'])
        }
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.flag} {option.nativeName}
          </option>
        ))}
      </Select>
      {showDescription && (
        <p className="-mt-3 text-sm text-text-muted">
          {t('settings.languageDescription')}
        </p>
      )}
    </>
  )
}
