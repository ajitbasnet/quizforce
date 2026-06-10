import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { QuestionBlock } from '../components/quiz/QuestionBlock'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGE_OPTIONS } from '../i18n'
import { useQuizStore } from '../store/quizStore'
import type { QuizSettings } from '../types/quiz'

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
  const currentQuiz = useQuizStore((s) => s.currentQuiz)
  const userAnswers = useQuizStore((s) => s.userAnswers)
  const setAnswer = useQuizStore((s) => s.setAnswer)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
    setElapsedSeconds(0)
  }, [currentQuiz?.id])

  useEffect(() => {
    if (!currentQuiz?.settings.timerEnabled) return

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [currentQuiz?.id, currentQuiz?.settings.timerEnabled])

  if (!currentQuiz) {
    return <Navigate to="/" replace />
  }

  const { questions, settings } = currentQuiz
  const total = questions.length
  const question = questions[currentIndex]
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
              value={((currentIndex + 1) / total) * 100}
              height="thin"
            />
            <p className="text-sm text-text-muted">
              {t('quiz.questionOf', {
                current: currentIndex + 1,
                total,
              })}
            </p>
          </div>
        </div>

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
                questionNumber={currentIndex + 1}
                selectedOptionId={userAnswers[question.id] ?? null}
                onSelect={(optionId) => setAnswer(question.id, optionId)}
                isSubmitted={false}
                voiceEnabled={settings.voiceEnabled}
                voiceRate={settings.voiceRate}
                voicePitch={settings.voicePitch}
                language={currentQuiz.language}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="mt-auto flex items-center justify-between gap-4 pt-4">
          <Button
            variant="ghost"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            {t('quiz.previousQuestion')}
          </Button>

          <span className="text-sm text-text-muted">
            {t('quiz.questionOf', {
              current: currentIndex + 1,
              total,
            })}
          </span>

          <Button
            variant="primary"
            disabled={currentIndex === total - 1}
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            {t('quiz.nextQuestion')}
          </Button>
        </nav>
      </div>
    </div>
  )
}
