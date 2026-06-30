import clsx from 'clsx'
import { useLanguage } from '../../hooks/useLanguage'
import { RangeSlider } from '../ui/RangeSlider'
import { fieldLabelClass } from '../ui/formFieldUtils'

function formatVoiceValue(value: number): string {
  return `${value.toFixed(1)}x`
}

interface SettingsVoiceFieldsProps {
  voiceEnabled: boolean
  voiceRate: number
  voicePitch: number
  onVoiceEnabledChange: (enabled: boolean) => void
  onVoiceRateChange: (rate: number) => void
  onVoicePitchChange: (pitch: number) => void
}

export function SettingsVoiceFields({
  voiceEnabled,
  voiceRate,
  voicePitch,
  onVoiceEnabledChange,
  onVoiceRateChange,
  onVoicePitchChange,
}: SettingsVoiceFieldsProps) {
  const { t } = useLanguage()

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className={clsx(fieldLabelClass, 'mb-0')}>
          {t('settings.voiceEnabled')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={voiceEnabled}
          aria-label={t('settings.voiceEnabled')}
          onClick={() => onVoiceEnabledChange(!voiceEnabled)}
          className={clsx(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2',
            voiceEnabled ? 'bg-brand-600' : 'bg-gray-200',
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

      <RangeSlider
        label={t('settings.voiceRate')}
        min={0.5}
        max={2}
        step={0.1}
        value={voiceRate}
        valueFormatter={formatVoiceValue}
        onChange={onVoiceRateChange}
      />

      <RangeSlider
        label={t('settings.voicePitch')}
        min={0.5}
        max={2}
        step={0.1}
        value={voicePitch}
        valueFormatter={formatVoiceValue}
        onChange={onVoicePitchChange}
      />
    </>
  )
}
