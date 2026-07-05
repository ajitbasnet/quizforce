import clsx from 'clsx'
import { Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQuiz } from '../../api/claude'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuizStore } from '../../store/quizStore'
import { useShallow } from 'zustand/react/shallow'
import { useSettingsStore } from '../../store/settingsStore'
import { QuizGenerationError } from '../../types/api'
import type { Quiz } from '../../types/quiz'
import { trackEvent } from '../../utils/analytics'
import { QuizValidationErrorModal } from '../quiz/QuizValidationErrorModal'
import { Button } from '../ui/Button'
import { ErrorBanner } from '../ui/ErrorBanner'
import { GenerationProgress } from './GenerationProgress'

const LARGE_CONTENT_THRESHOLD = 8000

type GenerationInputResult =
  | { ok: true; content: string; sourceType: Quiz['sourceType'] }
  | { ok: false }

type CachedGenerationInput = {
  content: string
  sourceType: Quiz['sourceType']
}

interface GenerateButtonProps {
  getGenerationInput: () => Promise<GenerationInputResult>
  disabled?: boolean
}

function getErrorMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  if (error instanceof QuizGenerationError) {
    if (
      error.code === 'AUTH_ERROR' ||
      error.apiErrorType === 'CONFIG_ERROR'
    ) {
      return t('errors.missingApiKey')
    }
    if (
      error.code === 'INVALID_API_KEY' ||
      error.apiErrorType === 'INVALID_API_KEY'
    ) {
      return t('errors.invalidApiKeyConfig')
    }
    switch (error.code) {
      case 'RATE_LIMIT_ERROR':
        return t('errors.rateLimit')
      case 'RATE_LIMIT_CLIENT':
        return t('errors.generationCooldown')
      case 'OVERLOADED_ERROR':
        return t('errors.overloaded')
      case 'NETWORK_ERROR':
        return t('errors.network')
      case 'EMPTY_QUIZ':
        return t('errors.zeroQuestions')
      default:
        return t('errors.generationFailed')
    }
  }
  return t('errors.generationFailed')
}

function getErrorSuggestion(
  error: unknown,
  contentLength: number,
  t: (key: string) => string,
): string {
  if (error instanceof QuizGenerationError) {
    if (
      error.code === 'AUTH_ERROR' ||
      error.apiErrorType === 'CONFIG_ERROR'
    ) {
      return t('errors.suggestionMissingApiKey')
    }
    if (error.code === 'INVALID_API_KEY') {
      return t('errors.suggestionInvalidApiKey')
    }
    if (error.code === 'NETWORK_ERROR') {
      return t('errors.suggestionNetwork')
    }
  }
  if (contentLength > LARGE_CONTENT_THRESHOLD) {
    return t('errors.suggestionLessContent')
  }
  return t('errors.suggestionGeneric')
}

export function GenerateButton({
  getGenerationInput,
  disabled = false,
}: GenerateButtonProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const settings = useSettingsStore(useShallow((s) => s.settings))
  const isGenerating = useQuizStore((s) => s.isGenerating)
  const generationError = useQuizStore((s) => s.generationError)
  const setGenerating = useQuizStore((s) => s.setGenerating)
  const setProgress = useQuizStore((s) => s.setProgress)
  const setCurrentQuiz = useQuizStore((s) => s.setCurrentQuiz)
  const setError = useQuizStore((s) => s.setError)
  const abortRef = useRef<AbortController | null>(null)
  const lastInputRef = useRef<CachedGenerationInput | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [errorSuggestion, setErrorSuggestion] = useState<string | undefined>()
  const [validationModal, setValidationModal] = useState<{
    rawResponse: string
  } | null>(null)

  const clearGenerationError = () => {
    setError(null)
    setErrorSuggestion(undefined)
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    setGenerating(false)
    setProgress(0)
    clearGenerationError()
  }

  const runGeneration = async (input: CachedGenerationInput) => {
    const controller = new AbortController()
    abortRef.current = controller

    setGenerating(true)
    setProgress(0)
    setIsPending(false)
    clearGenerationError()

    try {
      const quiz = await generateQuiz({
        content: input.content,
        settings,
        sourceType: input.sourceType,
        onProgress: setProgress,
        signal: controller.signal,
      })
      setCurrentQuiz(quiz)
      trackEvent('quiz_generated', {
        sourceType: input.sourceType,
        questionCount: quiz.questions.length,
        language: settings.language,
      })
      navigate('/quiz')
    } catch (error) {
      if (
        error instanceof QuizGenerationError &&
        error.code === 'ABORTED'
      ) {
        return
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      if (
        error instanceof QuizGenerationError &&
        (error.code === 'VALIDATION_ERROR' || error.code === 'PARSE_ERROR') &&
        error.rawResponse
      ) {
        setValidationModal({ rawResponse: error.rawResponse })
        setGenerating(false)
        return
      }
      const message = getErrorMessage(error, t)
      const suggestion = getErrorSuggestion(error, input.content.length, t)
      setError(message)
      setErrorSuggestion(suggestion)
      setGenerating(false)
      setIsPending(false)
    } finally {
      abortRef.current = null
    }
  }

  const handleGenerate = async () => {
    if (disabled || isPending) return
    setIsPending(true)
    const input = await getGenerationInput()
    if (!input.ok) {
      setIsPending(false)
      return
    }

    lastInputRef.current = {
      content: input.content,
      sourceType: input.sourceType,
    }
    await runGeneration(lastInputRef.current)
  }

  const handleRetry = () => {
    if (lastInputRef.current) {
      void runGeneration(lastInputRef.current)
      return
    }
    void handleGenerate()
  }

  if (isGenerating) {
    return <GenerationProgress onCancel={handleCancel} />
  }

  const handleValidationModalClose = () => {
    setValidationModal(null)
  }

  const handleValidationModalRetry = () => {
    setValidationModal(null)
    void handleGenerate()
  }

  return (
    <div className="flex flex-col gap-3">
      <QuizValidationErrorModal
        isOpen={validationModal !== null}
        rawResponse={validationModal?.rawResponse ?? ''}
        onClose={handleValidationModalClose}
        onRetry={handleValidationModalRetry}
      />
      {generationError && (
        <ErrorBanner
          message={generationError}
          suggestion={errorSuggestion}
          onRetry={handleRetry}
          retryLabel={t('errors.tryAgain')}
          onDismiss={clearGenerationError}
        />
      )}
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        disabled={disabled || isPending}
        isLoading={isPending}
        className={clsx('min-w-[11.5rem]')}
        data-testid="generate-quiz"
        leftIcon={
          !isPending ? <Sparkles className="h-5 w-5" aria-hidden /> : undefined
        }
        onClick={() => void handleGenerate()}
      >
        {isPending ? t('input.generating') : t('input.generateButton')}
      </Button>
    </div>
  )
}
