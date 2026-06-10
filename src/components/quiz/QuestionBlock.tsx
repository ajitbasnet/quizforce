import { useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useVoice } from '../../hooks/useVoice'
import type { QuizQuestion, SupportedLanguage } from '../../types/quiz'
import { Badge } from '../ui/Badge'
import { AnswerOption } from './AnswerOption'

export interface QuestionBlockProps {
  question: QuizQuestion
  questionNumber: number
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  isSubmitted: boolean
  voiceEnabled: boolean
  voiceRate?: number
  voicePitch?: number
  language?: SupportedLanguage
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

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
  voiceRate,
  voicePitch,
  language,
}: QuestionBlockProps) {
  const { t } = useLanguage()
  const { speak, cancel } = useVoice()

  useEffect(() => {
    if (!voiceEnabled) return
    speak(question.questionText, {
      rate: voiceRate,
      pitch: voicePitch,
      lang: language,
    })
    return () => cancel()
  }, [
    question.id,
    question.questionText,
    voiceEnabled,
    voiceRate,
    voicePitch,
    language,
    speak,
    cancel,
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

      <Badge variant="info" size="sm" className="w-fit">
        {t('quiz.worthPoints', { count: question.points })}
      </Badge>

      <p className="py-4 text-xl font-semibold leading-relaxed text-text-primary">
        {question.questionText}
      </p>

      <div className="flex flex-col gap-3">
        {question.options.map((option, index) => (
          <AnswerOption
            key={option.id}
            letter={OPTION_LETTERS[index] ?? String(index + 1)}
            label={option.text}
            isSelected={selectedOptionId === option.id}
            onSelect={() => onSelect(option.id)}
            isSubmitted={isSubmitted}
          />
        ))}
      </div>
    </div>
  )
}
