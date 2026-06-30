import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsAutoSave } from '../../hooks/useSettingsAutoSave'
import { useSpeechVoices } from '../../hooks/useSpeechVoices'
import { useSettingsStore } from '../../store/settingsStore'
import { Select } from '../ui/Select'
import { SettingsSectionCard } from './SettingsSectionCard'
import { SettingsVoiceFields } from './SettingsVoiceFields'

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
        <SettingsVoiceFields
          voiceEnabled={settings.voiceEnabled}
          voiceRate={settings.voiceRate}
          voicePitch={settings.voicePitch}
          onVoiceEnabledChange={(voiceEnabled) => save({ voiceEnabled })}
          onVoiceRateChange={(voiceRate) => save({ voiceRate })}
          onVoicePitchChange={(voicePitch) => save({ voicePitch })}
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
