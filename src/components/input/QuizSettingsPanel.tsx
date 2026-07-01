import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useLanguage } from '../../hooks/useLanguage'
import { useShallow } from 'zustand/react/shallow'
import { useSettingsStore } from '../../store/settingsStore'
import type { QuizSettings } from '../../types/quiz'
import {
  settingsSchema,
  translateValidationMessage,
} from '../../utils/validators'
import { LanguageSelector } from '../layout/LanguageSelector'
import { Card } from '../ui/Card'
import { NumberInput } from '../ui/NumberInput'
import { RangeSlider } from '../ui/RangeSlider'
import { fieldErrorClass, fieldLabelClass } from '../ui/formFieldUtils'

export interface QuizSettingsPanelHandle {
  validate: () => Promise<{ ok: true } | { ok: false }>
  expand: () => void
}

type Difficulty = QuizSettings['difficulty']

const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard', 'mixed']

const DIFFICULTY_LABEL_KEYS: Record<Difficulty, string> = {
  easy: 'quiz.difficultyEasy',
  medium: 'quiz.difficultyMedium',
  hard: 'quiz.difficultyHard',
  mixed: 'quiz.difficultyMixed',
}

function toTranslatedError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined
  return {
    message: translateValidationMessage(message, t) ?? message,
    type: 'manual' as const,
  }
}

export const QuizSettingsPanel = forwardRef<QuizSettingsPanelHandle>(
  function QuizSettingsPanel(_, ref) {
    const { t } = useLanguage()
    const settings = useSettingsStore(useShallow((s) => s.settings))
    const updateSettings = useSettingsStore((s) => s.updateSettings)
    const [expanded, setExpanded] = useState(false)

    const {
      register,
      control,
      watch,
      trigger,
      setValue,
      formState: { errors },
    } = useForm<QuizSettings>({
      resolver: zodResolver(settingsSchema),
      values: settings,
      mode: 'onSubmit',
    })

    const voiceEnabled = watch('voiceEnabled')

    useEffect(() => {
      const subscription = watch((value) => {
        const next = value as QuizSettings
        const current = useSettingsStore.getState().settings
        const hasChange = (Object.keys(next) as (keyof QuizSettings)[]).some(
          (key) => next[key] !== current[key],
        )
        if (hasChange) {
          updateSettings(next)
        }
      })
      return () => subscription.unsubscribe()
    }, [watch, updateSettings])

    useImperativeHandle(
      ref,
      () => ({
        validate: async () => {
          const ok = await trigger()
          return ok ? { ok: true } : { ok: false }
        },
        expand: () => setExpanded(true),
      }),
      [trigger],
    )

    const formatVoiceValue = (v: number) => `${v.toFixed(1)}x`

    return (
      <Card>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          <span className="text-sm font-medium text-text-primary dark:text-gray-100">
            {t('input.customizeQuiz')}
          </span>
          <ChevronRight
            className={clsx(
              'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 dark:text-gray-400',
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
              register={register('questionsCount', { valueAsNumber: true })}
              error={toTranslatedError(errors.questionsCount?.message, t)}
            />

            <Controller
              name="pointsPerQuestion"
              control={control}
              render={({ field }) => (
                <RangeSlider
                  label={t('input.pointsPerQuestion')}
                  min={1}
                  max={100}
                  value={field.value}
                  onChange={field.onChange}
                  valueFormatter={(v) => String(v)}
                  error={toTranslatedError(errors.pointsPerQuestion?.message, t)}
                />
              )}
            />

            <div>
              <span className={fieldLabelClass}>{t('input.difficulty')}</span>
              <div
                role="radiogroup"
                aria-label={t('input.difficulty')}
                className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800"
              >
                {DIFFICULTY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={watch('difficulty') === option}
                    className={clsx(
                      'flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                      watch('difficulty') === option
                        ? 'bg-surface text-brand-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400'
                        : 'text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-gray-100',
                    )}
                    onClick={() =>
                      setValue('difficulty', option, { shouldDirty: true })
                    }
                  >
                    {t(DIFFICULTY_LABEL_KEYS[option])}
                  </button>
                ))}
              </div>
              {errors.difficulty?.message && (
                <p className={fieldErrorClass} role="alert">
                  {translateValidationMessage(errors.difficulty.message, t)}
                </p>
              )}
            </div>

            <div>
              <span className={fieldLabelClass}>{t('settings.language')}</span>
              <LanguageSelector />
              {errors.language?.message && (
                <p className={fieldErrorClass} role="alert">
                  {translateValidationMessage(errors.language.message, t)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className={clsx(fieldLabelClass, 'mb-0')}>
                {t('input.voiceNarration')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={voiceEnabled}
                aria-label={t('input.voiceNarration')}
                onClick={() =>
                  setValue('voiceEnabled', !voiceEnabled, { shouldDirty: true })
                }
                className={clsx(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2',
                  voiceEnabled ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600',
                )}
              >
                <span
                  className={clsx(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    voiceEnabled ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {voiceEnabled && (
              <>
                <Controller
                  name="voiceRate"
                  control={control}
                  render={({ field }) => (
                    <RangeSlider
                      label={t('voice.rate')}
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={field.value}
                      onChange={field.onChange}
                      valueFormatter={formatVoiceValue}
                      error={toTranslatedError(errors.voiceRate?.message, t)}
                    />
                  )}
                />
                <Controller
                  name="voicePitch"
                  control={control}
                  render={({ field }) => (
                    <RangeSlider
                      label={t('voice.pitch')}
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={field.value}
                      onChange={field.onChange}
                      valueFormatter={formatVoiceValue}
                      error={toTranslatedError(errors.voicePitch?.message, t)}
                    />
                  )}
                />
              </>
            )}
          </div>
        )}
      </Card>
    )
  },
)
