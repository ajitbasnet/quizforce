import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsAutoSave } from '../../hooks/useSettingsAutoSave'
import { useSpeechVoices } from '../../hooks/useSpeechVoices'
import { useShallow } from 'zustand/react/shallow'
import { useSettingsStore } from '../../store/settingsStore'
import { Select } from '../ui/Select'
import { SettingsSectionCard } from './SettingsSectionCard'
import { SettingsVoiceFields } from './SettingsVoiceFields'

export function VoiceSettingsSection() {
  const { t } = useLanguage()
  const { voiceEnabled, voiceRate, voicePitch, voiceURI, language } =
    useSettingsStore(
      useShallow((s) => ({
        voiceEnabled: s.settings.voiceEnabled,
        voiceRate: s.settings.voiceRate,
        voicePitch: s.settings.voicePitch,
        voiceURI: s.settings.voiceURI,
        language: s.settings.language,
      })),
    )
  const { saved, save } = useSettingsAutoSave()
  const { voices } = useSpeechVoices(language)

  return (
    <SettingsSectionCard
      id="voice"
      title={t('settings.sectionVoice')}
      saved={saved}
    >
      <div className="flex flex-col gap-5">
        <SettingsVoiceFields
          voiceEnabled={voiceEnabled}
          voiceRate={voiceRate}
          voicePitch={voicePitch}
          onVoiceEnabledChange={(nextVoiceEnabled) =>
            save({ voiceEnabled: nextVoiceEnabled })
          }
          onVoiceRateChange={(nextVoiceRate) => save({ voiceRate: nextVoiceRate })}
          onVoicePitchChange={(nextVoicePitch) =>
            save({ voicePitch: nextVoicePitch })
          }
        />

        {voices.length > 0 && (
          <Select
            label={t('settings.preferredVoice')}
            value={voiceURI ?? ''}
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
