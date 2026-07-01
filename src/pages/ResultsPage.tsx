import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getAttempt, isSupabaseConfigured } from '../api/supabase'
import { PageWrapper } from '../components/layout/PageWrapper'
import { PageMeta } from '../components/seo/PageMeta'
import { WidgetErrorBoundary } from '../components/layout/WidgetErrorBoundary'
import { QuestionReviewCard } from '../components/quiz/QuestionReviewCard'
import { RetryQuizModal } from '../components/quiz/RetryQuizModal'
import { ScorePanel } from '../components/quiz/ScorePanel'
import { ScorePanelSkeleton } from '../components/quiz/ScorePanelSkeleton'
import { CachedResultsBanner } from '../components/results/CachedResultsBanner'
import { ExportResultsDropdown } from '../components/results/ExportResultsDropdown'
import { OnboardingWelcomeModal } from '../components/onboarding/OnboardingWelcomeModal'
import { HighScoreCelebration } from '../components/results/HighScoreCelebration'
import { ScoreBreakdown } from '../components/results/ScoreBreakdown'
import { ShareScoreModal } from '../components/results/ShareScoreModal'
import { StopReadingButton } from '../components/results/StopReadingButton'
import { IosVoiceGestureHint } from '../components/voice/IosVoiceGestureHint'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import { useLanguage } from '../hooks/useLanguage'
import { hasOnboarded, markOnboarded } from '../hooks/useOnboarding'
import { useSpeechCleanup } from '../hooks/useSpeechCleanup'
import { useRegisterShortcutActions } from '../hooks/useKeyboardShortcuts'
import { useResultsVoiceReading } from '../hooks/useResultsVoiceReading'
import { useHistoryStore } from '../store/historyStore'
import { useQuizStore } from '../store/quizStore'
import { useSettingsStore } from '../store/settingsStore'
import type { RegenerateState } from '../types/regenerate'
import type { QuizAttempt } from '../types/quiz'
import {
  cacheResultsSession,
  loadResultsSession,
} from '../utils/resultsSessionCache'
import { decodeSharePayload } from '../utils/shareScore'

const reviewContainerVariants = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.3, staggerChildren: 0.05 },
  },
}

const reviewItemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function ResultsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { attemptId } = useParams()
  const [searchParams] = useSearchParams()
  const dataParam = searchParams.get('data')
  const completedAttempt = useQuizStore((s) => s.completedAttempt)
  const currentQuiz = useQuizStore((s) => s.currentQuiz)
  const setCurrentQuiz = useQuizStore((s) => s.setCurrentQuiz)
  const resetAttempt = useQuizStore((s) => s.resetAttempt)
  const setCompletedAttempt = useQuizStore((s) => s.setCompletedAttempt)
  const getAttemptById = useHistoryStore((s) => s.getAttemptById)
  const historyAttempts = useHistoryStore((s) => s.attempts)
  const historyQuizzes = useHistoryStore((s) => s.quizzes)
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled)
  useSpeechCleanup()

  const [remoteAttempt, setRemoteAttempt] = useState<QuizAttempt | null>(null)
  const [isLoadingRemote, setIsLoadingRemote] = useState(false)
  const [remoteFetchSettled, setRemoteFetchSettled] = useState(false)
  const [remoteFetchFailed, setRemoteFetchFailed] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const scoreHeadingRef = useRef<HTMLHeadingElement>(null)
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null)

  const sharedPayload = useMemo(() => {
    if (!dataParam) return null
    return decodeSharePayload(dataParam)
  }, [dataParam])

  const hasInvalidShareData = dataParam !== null && sharedPayload === null

  useEffect(() => {
    if (!sharedPayload) return

    const { addQuiz, addAttempt, getAttemptById: getById, quizzes } =
      useHistoryStore.getState()

    if (!getById(sharedPayload.attempt.id)) {
      addAttempt(sharedPayload.attempt)
    }
    if (!quizzes.some((q) => q.id === sharedPayload.quiz.id)) {
      addQuiz(sharedPayload.quiz)
    }
  }, [sharedPayload])

  const sessionCache = useMemo(
    () => (attemptId ? loadResultsSession(attemptId) : null),
    [attemptId],
  )

  const localAttempt = useMemo(
    () =>
      (attemptId ? getAttemptById(attemptId) : undefined) ??
      (completedAttempt?.id === attemptId ? completedAttempt : undefined),
    [attemptId, completedAttempt, getAttemptById],
  )

  useEffect(() => {
    if (sharedPayload || !attemptId || localAttempt) {
      setRemoteAttempt(null)
      setIsLoadingRemote(false)
      setRemoteFetchSettled(true)
      setRemoteFetchFailed(false)
      return
    }

    if (!isSupabaseConfigured()) {
      setRemoteAttempt(null)
      setIsLoadingRemote(false)
      setRemoteFetchSettled(true)
      setRemoteFetchFailed(false)
      return
    }

    let cancelled = false
    setIsLoadingRemote(true)
    setRemoteAttempt(null)
    setRemoteFetchSettled(false)
    setRemoteFetchFailed(false)

    void getAttempt(attemptId)
      .then((attempt) => {
        if (!cancelled) {
          setRemoteAttempt(attempt)
          setRemoteFetchFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteAttempt(null)
          setRemoteFetchFailed(true)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingRemote(false)
          setRemoteFetchSettled(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [attemptId, localAttempt, sharedPayload])

  const attempt = useMemo(
    () =>
      sharedPayload?.attempt ??
      localAttempt ??
      remoteAttempt ??
      sessionCache?.attempt,
    [sharedPayload, localAttempt, remoteAttempt, sessionCache],
  )

  const quiz = useMemo(
    () =>
      sharedPayload?.quiz ??
      historyQuizzes.find((q) => q.id === attempt?.quizId) ??
      (currentQuiz?.id === attempt?.quizId ? currentQuiz : undefined) ??
      sessionCache?.quiz,
    [sharedPayload, historyQuizzes, attempt?.quizId, currentQuiz, sessionCache],
  )

  const isFromSessionCache = useMemo(
    () =>
      Boolean(sessionCache?.attempt) &&
      attempt === sessionCache?.attempt &&
      !sharedPayload?.attempt &&
      !localAttempt &&
      !remoteAttempt,
    [sessionCache, attempt, sharedPayload, localAttempt, remoteAttempt],
  )

  const isShowingCachedBanner =
    isFromSessionCache &&
    remoteFetchSettled &&
    (remoteFetchFailed || !isSupabaseConfigured())

  useEffect(() => {
    if (!attempt || !quiz || attempt.id !== attemptId) return
    cacheResultsSession(attempt, quiz)
  }, [attempt, quiz, attemptId])

  const handleRetryConfirm = useCallback(() => {
    if (!quiz) {
      toast.error(t('errors.quizNotFound'))
      return
    }
    if (currentQuiz?.id !== quiz.id) {
      setCurrentQuiz(quiz)
    } else {
      resetAttempt()
      setCompletedAttempt(null)
    }
    setRetryModalOpen(false)
    navigate('/quiz')
  }, [
    quiz,
    currentQuiz?.id,
    setCurrentQuiz,
    resetAttempt,
    setCompletedAttempt,
    navigate,
    toast,
    t,
  ])

  const handleRegenerate = useCallback(() => {
    if (!quiz) {
      toast.error(t('errors.quizNotFound'))
      return
    }
    setCurrentQuiz(null)
    const regenerate: RegenerateState = {
      sourceType: quiz.sourceType,
      sourceContent: quiz.sourceContent,
    }
    navigate('/', { state: { regenerate } })
  }, [quiz, setCurrentQuiz, navigate, toast, t])

  const handleOpenShare = useCallback(() => {
    if (!attempt) return
    if (!quiz) {
      toast.error(t('errors.quizNotFound'))
      return
    }
    setShareModalOpen(true)
  }, [attempt, quiz, toast, t])

  const { isResultsReading, startReading, stopReading, registerCardRef } =
    useResultsVoiceReading({ attempt, quiz: quiz ?? undefined, voiceEnabled })

  useRegisterShortcutActions(
    {
      'results-focus-review': () => {
        reviewHeadingRef.current?.focus()
      },
    },
    [],
  )

  useEffect(() => {
    if (!attempt) return
    scoreHeadingRef.current?.focus()
  }, [attempt?.id])

  useEffect(() => {
    if (!attempt || !quiz || sharedPayload || hasOnboarded()) return
    if (historyAttempts.length !== 1) return
    setOnboardingOpen(true)
  }, [attempt, quiz, sharedPayload, historyAttempts.length])

  const handleOnboardingDismiss = useCallback(() => {
    markOnboarded()
    setOnboardingOpen(false)
  }, [])

  if (hasInvalidShareData) {
    return (
      <PageWrapper>
        <PageMeta title="Your Results — QuizForge" />
        <Card className="mx-auto max-w-md text-center">
          <p className="text-text-primary dark:text-gray-100">{t('errors.attemptNotFound')}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            {t('results.backToHome')}
          </Button>
        </Card>
      </PageWrapper>
    )
  }

  if (!attempt) {
    if (!remoteFetchSettled || isLoadingRemote) {
      return (
        <PageWrapper>
          <PageMeta title="Your Results — QuizForge" />
          <div className="mx-auto w-full max-w-4xl">
            <p className="sr-only" aria-live="polite">
              {t('results.tallyingScore')}
            </p>
            <ScorePanelSkeleton />
          </div>
        </PageWrapper>
      )
    }

    return (
      <PageWrapper>
        <PageMeta title="Your Results — QuizForge" />
        <Card className="mx-auto max-w-md text-center">
          <p className="text-text-primary dark:text-gray-100">{t('errors.attemptNotFound')}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            {t('results.backToHome')}
          </Button>
        </Card>
      </PageWrapper>
    )
  }

  const resultsTitle = quiz
    ? `Your Results: ${quiz.title} — QuizForge`
    : 'Your Results — QuizForge'

  return (
    <PageWrapper title={t('results.title')}>
      <PageMeta title={resultsTitle} />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        {isShowingCachedBanner ? <CachedResultsBanner /> : null}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WidgetErrorBoundary>
            <ScorePanel
              attempt={attempt}
              quiz={quiz}
              voiceEnabled={voiceEnabled}
              onReadResults={startReading}
              headingRef={scoreHeadingRef}
            />
          </WidgetErrorBoundary>
        </motion.div>

        {quiz ? <ScoreBreakdown quiz={quiz} attempt={attempt} /> : null}

        <section>
          <h2
            ref={reviewHeadingRef}
            tabIndex={-1}
            className="mb-4 text-xl font-semibold text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-100"
          >
            {t('results.answerReview')}
          </h2>
          <motion.div
            className="flex flex-col gap-3"
            variants={reviewContainerVariants}
            initial="hidden"
            animate="show"
          >
            {(quiz?.questions ?? []).map((question, index) => {
              const feedback = attempt.feedback.find(
                (entry) => entry.questionId === question.id,
              )
              const selectedOptionId = attempt.answers[question.id]

              return (
                <motion.div
                  key={question.id}
                  ref={(el) => registerCardRef(question.id, el)}
                  variants={reviewItemVariants}
                  className="print:break-inside-avoid"
                >
                  <QuestionReviewCard
                    question={question}
                    feedback={
                      feedback ?? {
                        questionId: question.id,
                        selectedOptionId: selectedOptionId ?? '',
                        isCorrect: false,
                        explanation: '',
                        pointsAwarded: 0,
                      }
                    }
                    questionNumber={index + 1}
                    maxPoints={
                      quiz?.settings.customPointsMap[question.id] ??
                      question.points
                    }
                    voiceEnabled={voiceEnabled}
                    language={quiz?.language}
                    animateReveal
                    attemptId={attempt.id}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        <div className="flex flex-wrap gap-3 print:hidden">
          <Button size="lg" onClick={() => setRetryModalOpen(true)}>
            {t('results.retryQuiz')}
          </Button>
          <Button size="lg" variant="secondary" onClick={handleRegenerate}>
            {t('results.regenerateQuiz')}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/')}>
            {t('results.backToHome')}
          </Button>
          {quiz ? (
            <ExportResultsDropdown quiz={quiz} attempt={attempt} />
          ) : null}
          <Button size="lg" variant="secondary" onClick={handleOpenShare}>
            {t('results.shareScore')}
          </Button>
        </div>
      </div>

      <RetryQuizModal
        isOpen={retryModalOpen}
        onClose={() => setRetryModalOpen(false)}
        onConfirm={handleRetryConfirm}
      />

      {quiz ? (
        <ShareScoreModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          attempt={attempt}
          quiz={quiz}
        />
      ) : null}

      <HighScoreCelebration percentage={attempt.percentage} />

      <OnboardingWelcomeModal
        isOpen={onboardingOpen}
        onDismiss={handleOnboardingDismiss}
      />

      <StopReadingButton visible={isResultsReading} onStop={stopReading} />
      <IosVoiceGestureHint voiceEnabled={voiceEnabled} />
    </PageWrapper>
  )
}
