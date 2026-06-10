import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { generateQuiz } from '../../api/claude'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuizStore } from '../../store/quizStore'
import { useSettingsStore } from '../../store/settingsStore'
import { QuizGenerationError } from '../../types/api'
import type { Quiz } from '../../types/quiz'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { GenerationProgress } from './GenerationProgress'

type GenerationInputResult =
  | { ok: true; content: string; sourceType: Quiz['sourceType'] }
  | { ok: false; error: string }

interface GenerateButtonProps {
  getGenerationInput: () => GenerationInputResult
  disabled?: boolean
}

function getErrorMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  if (error instanceof QuizGenerationError) {
    if (error.code === 'AUTH_ERROR') {
      return t('errors.missingApiKey')
    }
    return t('errors.generationFailed')
  }
  return t('errors.generationFailed')
}

export function GenerateButton({
  getGenerationInput,
  disabled = false,
}: GenerateButtonProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { toast } = useToast()
  const settings = useSettingsStore((s) => s.settings)
  const isGenerating = useQuizStore((s) => s.isGenerating)
  const setGenerating = useQuizStore((s) => s.setGenerating)
  const setProgress = useQuizStore((s) => s.setProgress)
  const setCurrentQuiz = useQuizStore((s) => s.setCurrentQuiz)
  const setError = useQuizStore((s) => s.setError)

  const handleGenerate = async () => {
    const input = getGenerationInput()
    if (!input.ok) {
      toast.error(input.error)
      return
    }

    setGenerating(true)
    setProgress(0)
    setError(null)

    try {
      const quiz = await generateQuiz({
        content: input.content,
        settings,
        sourceType: input.sourceType,
        onProgress: setProgress,
      })
      setCurrentQuiz(quiz)
      navigate('/quiz')
    } catch (error) {
      const message = getErrorMessage(error, t)
      setError(message)
      toast.error(message)
      setGenerating(false)
    }
  }

  if (isGenerating) {
    return <GenerationProgress />
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      fullWidth
      disabled={disabled}
      leftIcon={<Sparkles className="h-5 w-5" aria-hidden />}
      onClick={() => void handleGenerate()}
    >
      {t('input.generateButton')}
    </Button>
  )
}
