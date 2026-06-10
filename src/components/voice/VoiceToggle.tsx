import { Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsStore } from '../../store/settingsStore'
import { topBarToggleClass } from '../layout/topBarActionStyles'

export function VoiceToggle() {
  const { t } = useLanguage()
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <button
      type="button"
      className={topBarToggleClass(voiceEnabled)}
      aria-label={voiceEnabled ? t('voice.disable') : t('voice.enable')}
      aria-pressed={voiceEnabled}
      onClick={() => updateSettings({ voiceEnabled: !voiceEnabled })}
    >
      {voiceEnabled ? (
        <Volume2 className="h-4 w-4" aria-hidden />
      ) : (
        <VolumeX className="h-4 w-4" aria-hidden />
      )}
    </button>
  )
}
