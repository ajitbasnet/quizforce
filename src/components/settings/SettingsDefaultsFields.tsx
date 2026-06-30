import { useLanguage } from '../../hooks/useLanguage'
import { NumberInput } from '../ui/NumberInput'

interface SettingsDefaultsFieldsProps {
  questionsCount: number
  pointsPerQuestion: number
  onQuestionsCountChange: (count: number) => void
  onPointsPerQuestionChange: (points: number) => void
}

export function SettingsDefaultsFields({
  questionsCount,
  pointsPerQuestion,
  onQuestionsCountChange,
  onPointsPerQuestionChange,
}: SettingsDefaultsFieldsProps) {
  const { t } = useLanguage()

  return (
    <>
      <NumberInput
        label={t('settings.questionsCount')}
        min={5}
        max={50}
        value={questionsCount}
        onChange={(event) =>
          onQuestionsCountChange(Number(event.target.value))
        }
      />

      <NumberInput
        label={t('settings.pointsPerQuestion')}
        min={1}
        max={100}
        value={pointsPerQuestion}
        onChange={(event) =>
          onPointsPerQuestionChange(Number(event.target.value))
        }
      />
    </>
  )
}
