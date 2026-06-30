import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuickSettings } from '../../hooks/useQuickSettings'
import { useSettingsStore } from '../../store/settingsStore'
import type { QuizSettings } from '../../types/quiz'
import { Drawer } from '../ui/Drawer'
import { SettingsDefaultsFields } from './SettingsDefaultsFields'
import { SettingsLanguageField } from './SettingsLanguageField'
import { SettingsVoiceFields } from './SettingsVoiceFields'

export function QuickSettingsDrawer() {
  const { t, changeLanguage } = useLanguage()
  const { isOpen, close } = useQuickSettings()
  const settings = useSettingsStore((s) => s.settings)

  const updateSettings = (partial: Partial<QuizSettings>) => {
    useSettingsStore.getState().updateSettings(partial)
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('settings.quickSettings')}
      footer={
        <Link
          to="/settings"
          onClick={close}
          className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          {t('settings.fullSettings')}
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        <SettingsLanguageField
          value={settings.language}
          onChange={(language) => void changeLanguage(language)}
        />

        <SettingsDefaultsFields
          questionsCount={settings.questionsCount}
          pointsPerQuestion={settings.pointsPerQuestion}
          onQuestionsCountChange={(questionsCount) =>
            updateSettings({ questionsCount })
          }
          onPointsPerQuestionChange={(pointsPerQuestion) =>
            updateSettings({ pointsPerQuestion })
          }
        />

        <SettingsVoiceFields
          voiceEnabled={settings.voiceEnabled}
          voiceRate={settings.voiceRate}
          voicePitch={settings.voicePitch}
          onVoiceEnabledChange={(voiceEnabled) =>
            updateSettings({ voiceEnabled })
          }
          onVoiceRateChange={(voiceRate) => updateSettings({ voiceRate })}
          onVoicePitchChange={(voicePitch) => updateSettings({ voicePitch })}
        />
      </div>
    </Drawer>
  )
}
