import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsStore } from '../../store/settingsStore'
import type { QuizSettings } from '../../types/quiz'
import { LanguageSelector } from '../layout/LanguageSelector'
import { Card } from '../ui/Card'
import { NumberInput } from '../ui/NumberInput'
import { RangeSlider } from '../ui/RangeSlider'
import { fieldLabelClass } from '../ui/formFieldUtils'

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

type Difficulty = QuizSettings['difficulty']

const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard', 'mixed']

const DIFFICULTY_LABEL_KEYS: Record<Difficulty, string> = {
  easy: 'quiz.difficultyEasy',
  medium: 'quiz.difficultyMedium',
  hard: 'quiz.difficultyHard',
  mixed: 'quiz.difficultyMixed',
}

export function QuizSettingsPanel() {
  const { t } = useLanguage()
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const [expanded, setExpanded] = useState(false)

  const formatVoiceValue = (v: number) => `${v.toFixed(1)}x`

  return (
    <Card>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium text-text-primary">
          {t('input.customizeQuiz')}
        </span>
        <ChevronRight
          className={clsx(
            'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200',
            expanded && 'rotate-90',
          )}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-5">
          <NumberInput
            label={t('input.questionsCount')}
            min={5}
            max={50}
            value={settings.questionsCount}
            onChange={(e) =>
              updateSettings({
                questionsCount: clamp(Number(e.target.value), 5, 50),
              })
            }
          />

          <RangeSlider
            label={t('input.pointsPerQuestion')}
            min={1}
            max={100}
            value={settings.pointsPerQuestion}
            onChange={(value) => updateSettings({ pointsPerQuestion: value })}
            valueFormatter={(v) => String(v)}
          />

          <div>
            <span className={fieldLabelClass}>{t('input.difficulty')}</span>
            <div
              role="radiogroup"
              aria-label={t('input.difficulty')}
              className="flex rounded-lg bg-gray-100 p-1"
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
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-text-muted hover:text-text-primary',
                  )}
                  onClick={() => updateSettings({ difficulty: option })}
                >
                  {t(DIFFICULTY_LABEL_KEYS[option])}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={fieldLabelClass}>{t('settings.language')}</span>
            <LanguageSelector />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className={clsx(fieldLabelClass, 'mb-0')}>
              {t('input.voiceNarration')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.voiceEnabled}
              aria-label={t('input.voiceNarration')}
              onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
              className={clsx(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
                settings.voiceEnabled ? 'bg-indigo-600' : 'bg-gray-200',
              )}
            >
              <span
                className={clsx(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                  settings.voiceEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          {settings.voiceEnabled && (
            <>
              <RangeSlider
                label={t('voice.rate')}
                min={0.5}
                max={2}
                step={0.1}
                value={settings.voiceRate}
                onChange={(value) => updateSettings({ voiceRate: value })}
                valueFormatter={formatVoiceValue}
              />
              <RangeSlider
                label={t('voice.pitch')}
                min={0.5}
                max={2}
                step={0.1}
                value={settings.voicePitch}
                onChange={(value) => updateSettings({ voicePitch: value })}
                valueFormatter={formatVoiceValue}
              />
            </>
          )}
        </div>
      )}
    </Card>
  )
}
