import { motion } from 'framer-motion'
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { QuestionReviewCard } from '../components/quiz/QuestionReviewCard'
import { ScorePanel } from '../components/quiz/ScorePanel'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import { useLanguage } from '../hooks/useLanguage'
import { useHistoryStore } from '../store/historyStore'
import { useQuizStore } from '../store/quizStore'

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
  const completedAttempt = useQuizStore((s) => s.completedAttempt)
  const currentQuiz = useQuizStore((s) => s.currentQuiz)
  const setCurrentQuiz = useQuizStore((s) => s.setCurrentQuiz)
  const getAttemptById = useHistoryStore((s) => s.getAttemptById)
  const historyQuizzes = useHistoryStore((s) => s.quizzes)

  const attempt = useMemo(
    () =>
      (attemptId ? getAttemptById(attemptId) : undefined) ??
      (completedAttempt?.id === attemptId ? completedAttempt : undefined),
    [attemptId, completedAttempt, getAttemptById],
  )

  const quiz = useMemo(
    () =>
      historyQuizzes.find((q) => q.id === attempt?.quizId) ??
      (currentQuiz?.id === attempt?.quizId ? currentQuiz : undefined),
    [historyQuizzes, attempt?.quizId, currentQuiz],
  )

  const handlePlayAgain = useCallback(() => {
    if (!quiz) {
      toast.error(t('errors.quizNotFound'))
      return
    }
    setCurrentQuiz(quiz)
    navigate('/quiz')
  }, [quiz, setCurrentQuiz, navigate, toast, t])

  const handleShare = useCallback(async () => {
    if (!attempt) return

    const text = t('results.shareText', {
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      title: quiz?.title ?? '',
    })

    if (navigator.share) {
      try {
        await navigator.share({ title: t('results.title'), text })
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      }
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('results.shareCopied'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }, [attempt, quiz?.title, t, toast])

  if (!attemptId || !attempt) {
    return (
      <PageWrapper>
        <Card className="mx-auto max-w-md text-center">
          <p className="text-text-primary">{t('errors.attemptNotFound')}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            {t('results.backToHome')}
          </Button>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={t('results.title')}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ScorePanel attempt={attempt} quiz={quiz} />
        </motion.div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-text-primary">
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
                <motion.div key={question.id} variants={reviewItemVariants}>
                  <QuestionReviewCard
                    question={question}
                    feedback={feedback}
                    selectedOptionId={selectedOptionId}
                    index={index}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={handlePlayAgain}>
            {t('results.playAgain')}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/')}>
            {t('results.backToHome')}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => void handleShare()}>
            {t('results.shareScore')}
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
