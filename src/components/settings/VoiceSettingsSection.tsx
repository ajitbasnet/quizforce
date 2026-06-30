import clsx from 'clsx'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsAutoSave } from '../../hooks/useSettingsAutoSave'
import { useSpeechVoices } from '../../hooks/useSpeechVoices'
import { useSettingsStore } from '../../store/settingsStore'
import { RangeSlider } from '../ui/RangeSlider'
import { Select } from '../ui/Select'
import { fieldLabelClass } from '../ui/formFieldUtils'
import { SettingsSectionCard } from './SettingsSectionCard'

function formatVoiceValue(value: number): string {
  return `${value.toFixed(1)}x`
}

export function VoiceSettingsSection() {
  const { t } = useLanguage()
  const settings = useSettingsStore((s) => s.settings)
  const { saved, save } = useSettingsAutoSave()
  const { voices } = useSpeechVoices(settings.language)

  return (
    <SettingsSectionCard
      id="voice"
      title={t('settings.sectionVoice')}
      saved={saved}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <span className={clsx(fieldLabelClass, 'mb-0')}>
            {t('settings.voiceEnabled')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.voiceEnabled}
            aria-label={t('settings.voiceEnabled')}
            onClick={() => save({ voiceEnabled: !settings.voiceEnabled })}
            className={clsx(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2',
              settings.voiceEnabled ? 'bg-brand-600' : 'bg-gray-200',
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

        <RangeSlider
          label={t('settings.voiceRate')}
          min={0.5}
          max={2}
          step={0.1}
          value={settings.voiceRate}
          valueFormatter={formatVoiceValue}
          onChange={(value) => save({ voiceRate: value })}
        />

        <RangeSlider
          label={t('settings.voicePitch')}
          min={0.5}
          max={2}
          step={0.1}
          value={settings.voicePitch}
          valueFormatter={formatVoiceValue}
          onChange={(value) => save({ voicePitch: value })}
        />

        {voices.length > 0 && (
          <Select
            label={t('settings.preferredVoice')}
            value={settings.voiceURI ?? ''}
            onChange={(event) =>
              save({ voiceURI: event.target.value || null })
            }
          >
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </Select>
        )}
      </div>
    </SettingsSectionCard>
  )
}
