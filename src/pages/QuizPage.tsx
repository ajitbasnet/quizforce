import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { QuestionBlock } from '../components/quiz/QuestionBlock'
import { QuestionMap } from '../components/quiz/QuestionMap'
import { UnansweredQuestionsModal } from '../components/quiz/UnansweredQuestionsModal'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useLanguage } from '../hooks/useLanguage'
import { useQuizNavigation } from '../hooks/useQuizNavigation'
import { LANGUAGE_OPTIONS } from '../i18n'
import { persistQuizAttempt } from '../services/persistQuizAttempt'
import { useQuizStore } from '../store/quizStore'
import type { QuizSettings } from '../types/quiz'
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

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unansweredModalOpen, setUnansweredModalOpen] = useState(false)

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

  if (!currentQuiz) {
    return <Navigate to="/" replace />
  }

  const { questions, settings } = currentQuiz
  const total = totalQuestions
  const question = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === total - 1
  const languageOption = LANGUAGE_OPTIONS.find(
    (opt) => opt.code === currentQuiz.language,
  )

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold text-text-primary">
                {currentQuiz.title}
              </h1>
              {currentQuiz.description && (
                <p className="mt-1 text-text-muted">{currentQuiz.description}</p>
              )}
            </div>
            {settings.timerEnabled && (
              <span
                className="shrink-0 font-mono text-sm tabular-nums text-text-primary"
                aria-label={formatElapsed(elapsedSeconds)}
              >
                {formatElapsed(elapsedSeconds)}
              </span>
            )}
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

        <div className="sticky top-16 z-10 -mx-4 bg-bg/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
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
              key={question.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <QuestionBlock
                question={question}
                questionNumber={currentQuestionIndex + 1}
                selectedOptionId={userAnswers[question.id] ?? null}
                onSelect={(optionId) => setAnswer(question.id, optionId)}
                isSubmitted={false}
                voiceEnabled={settings.voiceEnabled}
                language={currentQuiz.language}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="mt-auto flex items-center justify-between gap-4 pt-4">
          <Button
            variant="ghost"
            disabled={!canGoPrev || isSubmitting}
            onClick={() => navigateQuestion('prev')}
          >
            {t('quiz.previousQuestion')}
          </Button>

          <span className="text-sm text-text-muted">
            {t('quiz.questionOf', {
              current: currentQuestionIndex + 1,
              total,
            })}
          </span>

          {isLastQuestion ? (
            <Button
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleSubmitClick}
            >
              {t('quiz.submitQuiz')}
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!canGoNext || isSubmitting}
              onClick={() => navigateQuestion('next')}
            >
              {t('quiz.nextQuestion')}
            </Button>
          )}
        </nav>
      </div>

      <UnansweredQuestionsModal
        isOpen={unansweredModalOpen}
        unansweredNumbers={unansweredNumbers}
        onClose={() => setUnansweredModalOpen(false)}
        onConfirmSubmit={() => void confirmSubmit()}
      />
    </div>
  )
}
