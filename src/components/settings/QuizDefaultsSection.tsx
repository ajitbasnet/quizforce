import clsx from 'clsx'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsAutoSave } from '../../hooks/useSettingsAutoSave'
import { useShallow } from 'zustand/react/shallow'
import { useSettingsStore } from '../../store/settingsStore'
import type { QuizSettings } from '../../types/quiz'
import { fieldLabelClass } from '../ui/formFieldUtils'
import { SettingsSectionCard } from './SettingsSectionCard'
import { SettingsDefaultsFields } from './SettingsDefaultsFields'
import { SettingsLanguageField } from './SettingsLanguageField'

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
  const { questionsCount, pointsPerQuestion, difficulty, language } =
    useSettingsStore(
      useShallow((s) => ({
        questionsCount: s.settings.questionsCount,
        pointsPerQuestion: s.settings.pointsPerQuestion,
        difficulty: s.settings.difficulty,
        language: s.settings.language,
      })),
    )
  const { saved, save, markSaved } = useSettingsAutoSave()

  return (
    <SettingsSectionCard
      id="defaults"
      title={t('settings.sectionDefaults')}
      saved={saved}
    >
      <div className="flex flex-col gap-5">
        <SettingsDefaultsFields
          questionsCount={questionsCount}
          pointsPerQuestion={pointsPerQuestion}
          onQuestionsCountChange={(nextQuestionsCount) =>
            save({ questionsCount: nextQuestionsCount })
          }
          onPointsPerQuestionChange={(nextPointsPerQuestion) =>
            save({ pointsPerQuestion: nextPointsPerQuestion })
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
                aria-checked={difficulty === option}
                className={clsx(
                  'flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                  difficulty === option
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

        <SettingsLanguageField
          value={language}
          onChange={(language) => {
            void changeLanguage(language).then(markSaved)
          }}
          showDescription
        />
      </div>
    </SettingsSectionCard>
  )
}
