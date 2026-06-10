import type { QuizQuestion, SupportedLanguage } from '../../types/quiz'

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

export function QuestionBlock(_props: QuestionBlockProps) {
  return null
}
