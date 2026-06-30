import type { Quiz, QuizAttempt, QuizQuestion, QuizSettings } from '../../types/quiz'

export const baseSettings: QuizSettings = {
  pointsPerQuestion: 10,
  customPointsMap: {},
  questionsCount: 3,
  difficulty: 'mixed',
  voiceEnabled: false,
  voiceRate: 1,
  voicePitch: 1,
  voiceURI: null,
  timerEnabled: false,
  language: 'en',
}

export function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: 'quiz-1',
    title: 'Test Quiz',
    description: 'A test quiz',
    totalPoints: 30,
    language: 'en',
    createdAt: '2026-01-01T00:00:00.000Z',
    sourceType: 'text',
    sourceContent: 'content',
    settings: baseSettings,
    questions: [
      {
        id: 'q1',
        questionText: 'Question 1?',
        options: [
          { id: 'q1-a', text: 'A' },
          { id: 'q1-b', text: 'B' },
        ],
        correctOptionId: 'q1-a',
        explanation: 'Because A.',
        wrongExplanations: { 'q1-b': 'B is wrong.' },
        points: 10,
        difficulty: 'easy',
      },
      {
        id: 'q2',
        questionText: 'Question 2?',
        options: [
          { id: 'q2-a', text: 'A' },
          { id: 'q2-b', text: 'B' },
        ],
        correctOptionId: 'q2-b',
        explanation: 'Because B.',
        wrongExplanations: { 'q2-a': 'A is wrong.' },
        points: 10,
        difficulty: 'medium',
      },
      {
        id: 'q3',
        questionText: 'Question 3?',
        options: [
          { id: 'q3-a', text: 'A' },
          { id: 'q3-b', text: 'B' },
        ],
        correctOptionId: 'q3-a',
        explanation: 'Because A again.',
        wrongExplanations: { 'q3-b': 'B is wrong again.' },
        points: 10,
        difficulty: 'hard',
      },
    ],
    ...overrides,
  }
}

export function makeAttempt(quiz: Quiz): QuizAttempt {
  return {
    id: 'attempt-1',
    quizId: quiz.id,
    answers: { q1: 'q1-a', q2: 'q2-a', q3: 'q3-a' },
    score: 10,
    totalPoints: 30,
    percentage: 33.3,
    timeTaken: 60,
    completedAt: '2026-01-01T01:00:00.000Z',
    feedback: quiz.questions.map((q: QuizQuestion, i: number) => ({
      questionId: q.id,
      selectedOptionId: i === 0 ? 'q1-a' : i === 1 ? 'q2-a' : 'q3-a',
      isCorrect: i === 0,
      explanation: i === 0 ? q.explanation : q.wrongExplanations['q2-a'] ?? '',
      pointsAwarded: i === 0 ? 10 : 0,
    })),
  }
}
