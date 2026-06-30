import clsx from 'clsx'
import { LANGUAGE_OPTIONS } from '../../i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsAutoSave } from '../../hooks/useSettingsAutoSave'
import { useSettingsStore } from '../../store/settingsStore'
import type { QuizSettings } from '../../types/quiz'
import { NumberInput } from '../ui/NumberInput'
import { Select } from '../ui/Select'
import { fieldLabelClass } from '../ui/formFieldUtils'
import { SettingsSectionCard } from './SettingsSectionCard'

type Difficulty = QuizSettings['difficulty']

const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard', 'mixed']

const DIFFICULTY_LABEL_KEYS: Record<Difficulty, string> = {
  easy: 'quiz.difficultyEasy',
  medium: 'quiz.difficultyMedium',
  hard: 'quiz.difficultyHard',
  mixed: 'quiz.difficultyMixed',
}

export function QuizDefaultsSection() {
  const { t, changeLanguage } = useLanguage()
  const settings = useSettingsStore((s) => s.settings)
  const { saved, save, markSaved } = useSettingsAutoSave()

  return (
    <SettingsSectionCard
      id="defaults"
      title={t('settings.sectionDefaults')}
      saved={saved}
    >
      <div className="flex flex-col gap-5">
        <NumberInput
          label={t('settings.questionsCount')}
          min={5}
          max={50}
          value={settings.questionsCount}
          onChange={(event) =>
            save({ questionsCount: Number(event.target.value) })
          }
        />

        <NumberInput
          label={t('settings.pointsPerQuestion')}
          min={1}
          max={100}
          value={settings.pointsPerQuestion}
          onChange={(event) =>
            save({ pointsPerQuestion: Number(event.target.value) })
          }
        />

        <div>
          <span className={fieldLabelClass}>{t('settings.difficulty')}</span>
          <div
            role="radiogroup"
            aria-label={t('settings.difficulty')}
            className="flex rounded-lg bg-surface-subtle p-1"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={settings.difficulty === option}
                className={clsx(
                  'flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                  settings.difficulty === option
                    ? 'bg-surface text-brand-600 shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                )}
                onClick={() => save({ difficulty: option })}
              >
                {t(DIFFICULTY_LABEL_KEYS[option])}
              </button>
            ))}
          </div>
        </div>

        <Select
          label={t('settings.language')}
          value={settings.language}
          onChange={(event) => {
            void changeLanguage(
              event.target.value as QuizSettings['language'],
            ).then(markSaved)
          }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.flag} {option.nativeName}
            </option>
          ))}
        </Select>
        <p className="-mt-3 text-sm text-text-muted">
          {t('settings.languageDescription')}
        </p>
      </div>
    </SettingsSectionCard>
  )
}
