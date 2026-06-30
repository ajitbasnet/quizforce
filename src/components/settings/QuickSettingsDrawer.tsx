import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuickSettings } from '../../hooks/useQuickSettings'
import { useShallow } from 'zustand/react/shallow'
import { useSettingsStore } from '../../store/settingsStore'
import type { QuizSettings } from '../../types/quiz'
import { Drawer } from '../ui/Drawer'
import { SettingsDefaultsFields } from './SettingsDefaultsFields'
import { SettingsLanguageField } from './SettingsLanguageField'
import { SettingsVoiceFields } from './SettingsVoiceFields'

export function QuickSettingsDrawer() {
  const { t, changeLanguage } = useLanguage()
  const { isOpen, close } = useQuickSettings()
  const {
    language,
    questionsCount,
    pointsPerQuestion,
    voiceEnabled,
    voiceRate,
    voicePitch,
  } = useSettingsStore(
    useShallow((s) => ({
      language: s.settings.language,
      questionsCount: s.settings.questionsCount,
      pointsPerQuestion: s.settings.pointsPerQuestion,
      voiceEnabled: s.settings.voiceEnabled,
      voiceRate: s.settings.voiceRate,
      voicePitch: s.settings.voicePitch,
    })),
  )

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
          value={language}
          onChange={(nextLanguage) => void changeLanguage(nextLanguage)}
        />

        <SettingsDefaultsFields
          questionsCount={questionsCount}
          pointsPerQuestion={pointsPerQuestion}
          onQuestionsCountChange={(nextQuestionsCount) =>
            updateSettings({ questionsCount: nextQuestionsCount })
          }
          onPointsPerQuestionChange={(nextPointsPerQuestion) =>
            updateSettings({ pointsPerQuestion: nextPointsPerQuestion })
          }
        />

        <SettingsVoiceFields
          voiceEnabled={voiceEnabled}
          voiceRate={voiceRate}
          voicePitch={voicePitch}
          onVoiceEnabledChange={(nextVoiceEnabled) =>
            updateSettings({ voiceEnabled: nextVoiceEnabled })
          }
          onVoiceRateChange={(nextVoiceRate) =>
            updateSettings({ voiceRate: nextVoiceRate })
          }
          onVoicePitchChange={(nextVoicePitch) =>
            updateSettings({ voicePitch: nextVoicePitch })
          }
        />
      </div>
    </Drawer>
  )
}
