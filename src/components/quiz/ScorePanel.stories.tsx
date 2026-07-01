import type { Meta, StoryObj } from '@storybook/react'
import { makeQuiz } from '../../__tests__/fixtures/quiz'
import type { QuizAttempt } from '../../types/quiz'
import { ScorePanel } from './ScorePanel'

const quiz = makeQuiz({
  title: 'Biology Basics',
  description: 'A short quiz on plant biology',
})

function makeAttemptWithPercentage(percentage: number): QuizAttempt {
  const totalPoints = quiz.totalPoints
  const score = Math.round((percentage / 100) * totalPoints)
  const correctCount = Math.round((percentage / 100) * quiz.questions.length)

  return {
    id: `attempt-${percentage}`,
    quizId: quiz.id,
    answers: {},
    score,
    totalPoints,
    percentage,
    timeTaken: 185,
    completedAt: '2026-06-15T14:30:00.000Z',
    feedback: quiz.questions.map((q, index) => ({
      questionId: q.id,
      selectedOptionId: q.correctOptionId,
      isCorrect: index < correctCount,
      explanation: q.explanation,
      pointsAwarded: index < correctCount ? q.points : 0,
    })),
  }
}

const meta = {
  title: 'Quiz/ScorePanel',
  component: ScorePanel,
  tags: ['autodocs'],
  args: {
    quiz,
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScorePanel>

export default meta
type Story = StoryObj<typeof meta>

export const HighScore: Story = {
  args: {
    attempt: makeAttemptWithPercentage(92),
  },
}

export const PassingScore: Story = {
  args: {
    attempt: makeAttemptWithPercentage(65),
  },
}

export const FailingScore: Story = {
  args: {
    attempt: makeAttemptWithPercentage(30),
  },
}
