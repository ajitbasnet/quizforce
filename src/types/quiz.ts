export type SupportedLanguage = 'en' | 'es' | 'fr' | 'hi' | 'ne' | 'de' | 'zh'

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  questionText: string
  options: QuizOption[]
  correctOptionId: string
  explanation: string
  wrongExplanations: Record<string, string>
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  topic?: string
}

export interface QuizSettings {
  pointsPerQuestion: number
  customPointsMap: Record<string, number>
  questionsCount: number
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  voiceEnabled: boolean
  voiceRate: number
  voicePitch: number
  voiceURI: string | null
  timerEnabled: boolean
  language: SupportedLanguage
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  totalPoints: number
  language: SupportedLanguage
  createdAt: string
  sourceType: 'text' | 'pdf' | 'prompt' | 'url'
  sourceContent: string
  settings: QuizSettings
  isFavorited?: boolean
  tags?: string[]
}

export interface AnswerFeedback {
  questionId: string
  selectedOptionId: string
  isCorrect: boolean
  explanation: string
  pointsAwarded: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  answers: Record<string, string>
  score: number
  totalPoints: number
  percentage: number
  completedAt: string
  timeTaken: number
  feedback: AnswerFeedback[]
}
