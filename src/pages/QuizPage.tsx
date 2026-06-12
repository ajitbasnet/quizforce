import { AnimatePresence, motion } from 'framer-motion'
import { CircleHelp } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { QuestionBlock } from '../components/quiz/QuestionBlock'
import { SpeechControls } from '../components/voice/SpeechControls'
import { VoicePlayer } from '../components/voice/VoicePlayer'
import { QuestionMap } from '../components/quiz/QuestionMap'
import { UnansweredQuestionsModal } from '../components/quiz/UnansweredQuestionsModal'
import { topBarIconButtonClass } from '../components/layout/topBarActionStyles'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Tooltip } from '../components/ui/Tooltip'
import { useKeyboard } from '../hooks/useKeyboard'
import { useLanguage } from '../hooks/useLanguage'
import { useQuizNavigation } from '../hooks/useQuizNavigation'
import { useVoice } from '../hooks/useVoice'
import { LANGUAGE_OPTIONS } from '../i18n'
import { persistQuizAttempt } from '../services/persistQuizAttempt'
import { useQuizStore } from '../store/quizStore'
import { useSettingsStore } from '../store/settingsStore'
import type { QuizSettings } from '../types/quiz'
import { calculateScore } from '../utils/scoreCalculator'

const kbdClass =
  'inline-flex min-w-[1.5rem] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-text-primary'

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

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unansweredModalOpen, setUnansweredModalOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

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

  useKeyboard(
    {
      enabled: !isSubmitting && !!currentQuiz,
      canGoPrev,
      canSelectOption: (i) => !!question?.options[i],
      hasAnswer: !!question && !!userAnswers[question.id],
      isLastQuestion,
      onNext: () => {
        if (canGoNext) navigateQuestion('next')
      },
      onPrev: () => {
        if (canGoPrev) navigateQuestion('prev')
      },
      onSelectOption: (i) => {
        if (!question) return
        const opt = question.options[i]
        if (opt) setAnswer(question.id, opt.id)
      },
      onAdvance: () => {
        if (!question || !userAnswers[question.id]) return
        if (isLastQuestion) handleSubmitClick()
        else if (canGoNext) navigateQuestion('next')
      },
      onToggleVoice: () => updateSettings({ voiceEnabled: !voiceEnabled }),
      onSkipVoice: () => stop(),
      onSubmit: () => {
        if (isLastQuestion) handleSubmitClick()
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
    return <Navigate to="/" replace />
  }

  const { questions, settings } = currentQuiz
  const total = totalQuestions
  const currentQuestion = questions[currentQuestionIndex]
  const languageOption = LANGUAGE_OPTIONS.find(
    (opt) => opt.code === currentQuiz.language,
  )

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-5xl lg:grid lg:grid-cols-[minmax(0,48rem)_17rem] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="break-words font-display text-2xl font-bold text-text-primary">
                {currentQuiz.title}
              </h1>
              {currentQuiz.description && (
                <p className="mt-1 text-text-muted">{currentQuiz.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {settings.timerEnabled && (
                <span
                  className="font-mono text-sm tabular-nums text-text-primary"
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
                  onClick={() => setShortcutsOpen(true)}
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

        <div className="sticky top-16 z-10 max-sm:-mx-4 bg-bg/95 px-4 py-2 backdrop-blur sm:max-lg:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex flex-col gap-1">
            <ProgressBar
              value={((currentQuestionIndex + 1) / total) * 100}
              height="thin"
            />
            <p className="text-sm text-text-muted">
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
              <QuestionBlock
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                selectedOptionId={userAnswers[currentQuestion.id] ?? null}
                onSelect={(optionId) => setAnswer(currentQuestion.id, optionId)}
                isSubmitted={false}
                voiceEnabled={voiceEnabled}
                language={currentQuiz.language}
              />
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

          <span className="min-w-0 text-sm text-text-muted">
            {t('quiz.questionOf', {
              current: currentQuestionIndex + 1,
              total,
            })}
          </span>

          {isLastQuestion ? (
            <Button
              variant="primary"
              className="min-h-11"
              isLoading={isSubmitting}
              onClick={handleSubmitClick}
            >
              {t('quiz.submitQuiz')}
            </Button>
          ) : (
            <Button
              variant="primary"
              className="min-h-11"
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

      <Modal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title={t('quiz.keyboardShortcuts')}
        size="md"
      >
        <ul className="space-y-3">
          {[
            { label: t('quiz.shortcutNext'), keys: ['→'] },
            { label: t('quiz.shortcutPrev'), keys: ['←'] },
            { label: t('quiz.shortcutSelect'), keys: ['1', '–', '4'] },
            { label: t('quiz.shortcutAdvance'), keys: ['Space'] },
            { label: t('quiz.shortcutVoice'), keys: ['V'] },
            { label: t('quiz.shortcutSkipVoice'), keys: ['S'] },
            {
              label: t('quiz.shortcutSubmit'),
              keys: ['Enter'],
              hint: t('quiz.shortcutSubmitNote'),
            },
          ].map(({ label, keys, hint }) => (
            <li
              key={label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="text-text-primary">{label}</span>
              <span className="flex shrink-0 items-center gap-1">
                {keys.map((key) =>
                  key === '–' ? (
                    <span key={key} className="text-text-muted">
                      –
                    </span>
                  ) : (
                    <kbd key={key} className={kbdClass}>
                      {key}
                    </kbd>
                  ),
                )}
                {hint && (
                  <span className="ml-1 text-text-muted">({hint})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Modal>

      <VoicePlayer />
    </div>
  )
}
