import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CircleHelp } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WidgetErrorBoundary } from '../components/layout/WidgetErrorBoundary'
import { PageMeta } from '../components/seo/PageMeta'
import { QuestionBlock } from '../components/quiz/QuestionBlock'
import { SpeechControls } from '../components/voice/SpeechControls'
import { VoicePlayer } from '../components/voice/VoicePlayer'
import { IosVoiceGestureHint } from '../components/voice/IosVoiceGestureHint'
import { QuestionMap } from '../components/quiz/QuestionMap'
import { UnansweredQuestionsModal } from '../components/quiz/UnansweredQuestionsModal'
import { topBarIconButtonClass } from '../components/layout/topBarActionStyles'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Tooltip } from '../components/ui/Tooltip'
import { useToast } from '../components/ui/Toast'
import { useRegisterShortcutActions } from '../hooks/useKeyboardShortcuts'
import { useLanguage } from '../hooks/useLanguage'
import { useShortcutHelp } from '../hooks/useShortcutHelp'
import { useQuizNavigation } from '../hooks/useQuizNavigation'
import { useSpeechCleanup } from '../hooks/useSpeechCleanup'
import { useVoice } from '../hooks/useVoice'
import { LANGUAGE_OPTIONS } from '../i18n'
import { persistQuizAttempt } from '../services/persistQuizAttempt'
import { useQuizStore } from '../store/quizStore'
import { useSettingsStore } from '../store/settingsStore'
import type { QuizSettings } from '../types/quiz'
import { trackEvent } from '../utils/analytics'
import { calculateScore } from '../utils/scoreCalculator'

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function getDifficultyLabel(
  difficulty: QuizSettings['difficulty'],
  t: (key: string) => string,
): string {
  switch (difficulty) {
    case 'easy':
      return t('quiz.difficultyEasy')
    case 'medium':
      return t('quiz.difficultyMedium')
    case 'hard':
      return t('quiz.difficultyHard')
    case 'mixed':
      return t('quiz.difficultyMixed')
  }
}

export default function QuizPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const navigate = useNavigate()
  const currentQuiz = useQuizStore((s) => s.currentQuiz)
  const userAnswers = useQuizStore((s) => s.userAnswers)
  const setAnswer = useQuizStore((s) => s.setAnswer)
  const setCompletedAttempt = useQuizStore((s) => s.setCompletedAttempt)

  const {
    currentQuestionIndex,
    navigate: navigateQuestion,
    jumpTo,
    canGoNext,
    canGoPrev,
    totalQuestions,
    isAnswered,
  } = useQuizNavigation()

  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const { stop } = useVoice()
  useSpeechCleanup()

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unansweredModalOpen, setUnansweredModalOpen] = useState(false)
  const { open: openShortcutHelp } = useShortcutHelp()

  useEffect(() => {
    if (currentQuiz) return
    toast.info(t('quiz.createQuizFirst'))
    const timer = window.setTimeout(() => navigate('/', { replace: true }), 300)
    return () => window.clearTimeout(timer)
  }, [currentQuiz, navigate, toast, t])

  useEffect(() => {
    setElapsedSeconds(0)
  }, [currentQuiz?.id])

  useEffect(() => {
    if (!currentQuiz?.settings.timerEnabled) return

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [currentQuiz?.id, currentQuiz?.settings.timerEnabled])

  const unansweredNumbers = useMemo(() => {
    if (!currentQuiz) return []
    return currentQuiz.questions
      .map((q, index) => ({ id: q.id, number: index + 1 }))
      .filter(({ id }) => !userAnswers[id])
      .map(({ number }) => number)
  }, [currentQuiz, userAnswers])

  const confirmSubmit = useCallback(async () => {
    if (!currentQuiz || isSubmitting) return

    setIsSubmitting(true)
    setUnansweredModalOpen(false)

    try {
      const attempt = calculateScore(
        currentQuiz,
        userAnswers,
        currentQuiz.settings.customPointsMap,
        elapsedSeconds,
      )
      setCompletedAttempt(attempt)
      trackEvent('quiz_completed', {
        score: attempt.score,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
      })
      await persistQuizAttempt(currentQuiz, attempt)
      navigate(`/results/${attempt.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    currentQuiz,
    userAnswers,
    elapsedSeconds,
    isSubmitting,
    setCompletedAttempt,
    navigate,
  ])

  const handleSubmitClick = useCallback(() => {
    if (unansweredNumbers.length > 0) {
      setUnansweredModalOpen(true)
    } else {
      void confirmSubmit()
    }
  }, [unansweredNumbers.length, confirmSubmit])

  const question = currentQuiz?.questions[currentQuestionIndex]
  const isLastQuestion = currentQuiz
    ? currentQuestionIndex === totalQuestions - 1
    : false

  useRegisterShortcutActions(
    {
      'quiz-next': () => {
        if (isSubmitting || !currentQuiz || !canGoNext) return false
        navigateQuestion('next')
      },
      'quiz-prev': () => {
        if (isSubmitting || !currentQuiz || !canGoPrev) return false
        navigateQuestion('prev')
      },
      'quiz-select': (event) => {
        if (isSubmitting || !currentQuiz || !question) return false
        const index = Number(event.key) - 1
        if (!question.options[index]) return false
        setAnswer(question.id, question.options[index].id)
      },
      'quiz-advance': () => {
        if (isSubmitting || !currentQuiz || !question || !userAnswers[question.id]) {
          return false
        }
        if (isLastQuestion) handleSubmitClick()
        else if (canGoNext) navigateQuestion('next')
      },
      'quiz-submit': () => {
        if (isSubmitting || !currentQuiz || !isLastQuestion) return false
        handleSubmitClick()
      },
      'quiz-voice': () => {
        if (isSubmitting || !currentQuiz) return false
        updateSettings({ voiceEnabled: !voiceEnabled })
      },
      'quiz-skip-voice': () => {
        if (isSubmitting || !currentQuiz) return false
        stop()
      },
    },
    [
      isSubmitting,
      currentQuiz,
      canGoPrev,
      canGoNext,
      question,
      userAnswers,
      isLastQuestion,
      voiceEnabled,
      navigateQuestion,
      setAnswer,
      handleSubmitClick,
      updateSettings,
      stop,
    ],
  )

  if (!currentQuiz) {
    return null
  }

  if (currentQuiz.questions.length === 0) {
    return (
      <>
        <PageMeta title={`${currentQuiz.title} — QuizForge`} />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <p>{t('quiz.noQuestionsGenerated')}</p>
          <Button
            className="mt-4"
            leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
            onClick={() => navigate('/')}
          >
            {t('quiz.backToHome')}
          </Button>
        </Card>
      </div>
      </>
    )
  }

  const { questions, settings } = currentQuiz
  const total = totalQuestions
  const currentQuestion = questions[currentQuestionIndex]
  const languageOption = LANGUAGE_OPTIONS.find(
    (opt) => opt.code === currentQuiz.language,
  )

  return (
    <>
      <PageMeta title={`${currentQuiz.title} — QuizForge`} />
    <div className="flex min-h-[calc(100vh-4rem)] flex-col overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-5xl lg:grid lg:grid-cols-[minmax(0,48rem)_17rem] lg:items-start lg:gap-8">
        <div
          className={clsx(
            'flex min-w-0 flex-1 flex-col gap-6',
            isLastQuestion &&
              'max-lg:pb-[calc(5rem+env(safe-area-inset-bottom))]',
          )}
        >
        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="break-words font-display text-2xl font-bold text-text-primary dark:text-gray-100">
                {currentQuiz.title}
              </h1>
              {currentQuiz.description && (
                <p className="mt-1 text-text-muted dark:text-gray-400">{currentQuiz.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {settings.timerEnabled && (
                <span
                  className="font-mono text-sm tabular-nums text-text-primary dark:text-gray-100"
                  aria-label={formatElapsed(elapsedSeconds)}
                >
                  {formatElapsed(elapsedSeconds)}
                </span>
              )}
              <Tooltip content={t('quiz.keyboardShortcuts')}>
                <button
                  type="button"
                  className={`${topBarIconButtonClass} min-h-11 min-w-11`}
                  aria-label={t('quiz.keyboardShortcuts')}
                  onClick={openShortcutHelp}
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="default">
              {t('quiz.questionsCount', { count: total })}
            </Badge>
            <Badge variant="info">
              {t('quiz.totalPoints', { count: currentQuiz.totalPoints })}
            </Badge>
            <Badge variant="default">
              {getDifficultyLabel(settings.difficulty, t)}
            </Badge>
            {languageOption && (
              <Badge variant="default">
                {languageOption.flag} {languageOption.nativeName}
              </Badge>
            )}
          </div>
        </header>

        <div className="sticky top-16 z-10 max-sm:-mx-4 bg-bg/95 px-4 py-2 backdrop-blur sm:max-lg:-mx-6 sm:px-6 lg:mx-0 lg:px-0 dark:bg-gray-950/95">
          <div className="flex flex-col gap-1">
            <ProgressBar
              value={((currentQuestionIndex + 1) / total) * 100}
              height="thin"
              data-testid="quiz-progress"
            />
            <p className="text-sm text-text-muted dark:text-gray-400">
              {t('quiz.questionOf', {
                current: currentQuestionIndex + 1,
                total,
              })}
            </p>
          </div>
        </div>

        <QuestionMap
          total={total}
          currentIndex={currentQuestionIndex}
          isAnswered={isAnswered}
          onJump={jumpTo}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <WidgetErrorBoundary>
                <QuestionBlock
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  selectedOptionId={userAnswers[currentQuestion.id] ?? null}
                  onSelect={(optionId) => setAnswer(currentQuestion.id, optionId)}
                  isSubmitted={false}
                  voiceEnabled={voiceEnabled}
                  language={currentQuiz.language}
                />
              </WidgetErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-4 pt-4">
          <Button
            variant="ghost"
            className="min-h-11"
            disabled={!canGoPrev || isSubmitting}
            onClick={() => navigateQuestion('prev')}
          >
            {t('quiz.previousQuestion')}
          </Button>

          <span className="min-w-0 text-sm text-text-muted dark:text-gray-400">
            {t('quiz.questionOf', {
              current: currentQuestionIndex + 1,
              total,
            })}
          </span>

          {isLastQuestion ? (
            <Button
              variant="primary"
              className="min-h-11 hidden lg:inline-flex"
              data-testid="submit-quiz"
              isLoading={isSubmitting}
              onClick={handleSubmitClick}
            >
              {t('quiz.submitQuiz')}
            </Button>
          ) : (
            <Button
              variant="primary"
              className="min-h-11"
              data-testid="next-question"
              disabled={!canGoNext || isSubmitting}
              onClick={() => navigateQuestion('next')}
            >
              {t('quiz.nextQuestion')}
            </Button>
          )}
        </nav>
        </div>

        <SpeechControls
          question={currentQuestion}
          language={currentQuiz.language}
        />
      </div>

      <UnansweredQuestionsModal
        isOpen={unansweredModalOpen}
        unansweredNumbers={unansweredNumbers}
        onClose={() => setUnansweredModalOpen(false)}
        onConfirmSubmit={() => void confirmSubmit()}
      />

      {isLastQuestion && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <Button
            variant="primary"
            className="min-h-11 w-full"
            data-testid="submit-quiz-mobile"
            isLoading={isSubmitting}
            onClick={handleSubmitClick}
          >
            {t('quiz.submitQuiz')}
          </Button>
        </div>
      )}

      <VoicePlayer />
      <IosVoiceGestureHint voiceEnabled={voiceEnabled} />
    </div>
    </>
  )
}
