import { Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useVoice } from '../../hooks/useVoice'
import { useQuizStore } from '../../store/quizStore'
import type { QuizQuestion, SupportedLanguage } from '../../types/quiz'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { NumberInput } from '../ui/NumberInput'
import { AnswerOption } from './AnswerOption'

export interface QuestionBlockProps {
  question: QuizQuestion
  questionNumber: number
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  isSubmitted: boolean
  voiceEnabled: boolean
  language?: SupportedLanguage
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

function getOptionFeedback(
  q: QuizQuestion,
  optionId: string,
  submitted: boolean,
): string | null {
  if (!submitted) return null
  if (optionId === q.correctOptionId) return q.explanation
  return q.wrongExplanations[optionId] ?? null
}

function getDifficultyVariant(
  difficulty: QuizQuestion['difficulty'],
): 'info' | 'warning' | 'danger' {
  switch (difficulty) {
    case 'easy':
      return 'info'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
  }
}

function getDifficultyLabel(
  difficulty: QuizQuestion['difficulty'],
  t: (key: string) => string,
): string {
  switch (difficulty) {
    case 'easy':
      return t('quiz.difficultyEasy')
    case 'medium':
      return t('quiz.difficultyMedium')
    case 'hard':
      return t('quiz.difficultyHard')
  }
}

export function QuestionBlock({
  question,
  questionNumber,
  selectedOptionId,
  onSelect,
  isSubmitted,
  voiceEnabled,
  language,
}: QuestionBlockProps) {
  const { t } = useLanguage()
  const { speak, stop } = useVoice()
  const customPointsMap = useQuizStore(
    (s) => s.currentQuiz?.settings.customPointsMap ?? {},
  )
  const setCustomPoints = useQuizStore((s) => s.setCustomPoints)

  const [pointsOpen, setPointsOpen] = useState(false)
  const [draftPoints, setDraftPoints] = useState(question.points)
  const pointsRef = useRef<HTMLDivElement>(null)

  const effectivePoints = customPointsMap[question.id] ?? question.points

  useEffect(() => {
    if (!pointsOpen) return

    const handleMouseDown = (event: MouseEvent) => {
      if (
        pointsRef.current &&
        !pointsRef.current.contains(event.target as Node)
      ) {
        setPointsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setPointsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [pointsOpen])

  useEffect(() => {
    if (!pointsOpen) {
      setDraftPoints(effectivePoints)
    }
  }, [effectivePoints, pointsOpen])

  const handleTogglePoints = () => {
    if (!pointsOpen) {
      setDraftPoints(effectivePoints)
    }
    setPointsOpen((open) => !open)
  }

  const handleApplyPoints = () => {
    setCustomPoints(question.id, draftPoints)
    setPointsOpen(false)
  }

  useEffect(() => {
    if (!voiceEnabled) return
    speak(question.questionText, language)
    return () => stop()
  }, [
    question.id,
    question.questionText,
    voiceEnabled,
    language,
    speak,
    stop,
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default" size="sm">
          {t('quiz.questionChip', { number: questionNumber })}
        </Badge>
        <Badge
          variant={getDifficultyVariant(question.difficulty)}
          size="sm"
        >
          {getDifficultyLabel(question.difficulty, t)}
        </Badge>
        {question.topic && (
          <Badge variant="default" size="sm">
            {question.topic}
          </Badge>
        )}
      </div>

      <p className="py-4 text-xl font-semibold leading-relaxed text-text-primary">
        {question.questionText}
      </p>

      <div ref={pointsRef} className="relative w-fit">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          leftIcon={<Settings className="h-3.5 w-3.5" aria-hidden />}
          onClick={handleTogglePoints}
          aria-expanded={pointsOpen}
          aria-haspopup="dialog"
        >
          {t('quiz.customPoints', { count: effectivePoints })}
        </Button>

        {pointsOpen && (
          <div
            role="dialog"
            aria-label={t('quiz.customPointsLabel')}
            className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          >
            <NumberInput
              label={t('quiz.customPointsLabel')}
              min={1}
              max={1000}
              step={1}
              value={draftPoints}
              onChange={(event) =>
                setDraftPoints(
                  Number.isNaN(event.target.valueAsNumber)
                    ? 1
                    : event.target.valueAsNumber,
                )
              }
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              className="mt-2"
              onClick={handleApplyPoints}
            >
              {t('quiz.customPointsApply')}
            </Button>
          </div>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={question.questionText}
        className="flex flex-col gap-3"
      >
        {question.options.map((option, index) => (
          <AnswerOption
            key={option.id}
            option={option}
            letter={OPTION_LETTERS[index] ?? String(index + 1)}
            isSelected={selectedOptionId === option.id}
            isSubmitted={isSubmitted}
            isCorrect={option.id === question.correctOptionId}
            onSelect={() => onSelect(option.id)}
            feedback={getOptionFeedback(question, option.id, isSubmitted)}
            voiceEnabled={voiceEnabled}
            language={language}
          />
        ))}
      </div>
    </div>
  )
}
