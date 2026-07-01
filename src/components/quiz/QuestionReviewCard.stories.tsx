import type { Meta, StoryObj } from '@storybook/react'
import { makeQuiz } from '../../__tests__/fixtures/quiz'
import type { AnswerFeedback } from '../../types/quiz'
import { QuestionReviewCard } from './QuestionReviewCard'

const quiz = makeQuiz({
  questions: [
    {
      id: 'q1',
      questionText: 'Which process do plants use to convert sunlight into energy?',
      topic: 'Biology',
      options: [
        { id: 'q1-a', text: 'Photosynthesis' },
        { id: 'q1-b', text: 'Respiration' },
        { id: 'q1-c', text: 'Fermentation' },
        { id: 'q1-d', text: 'Osmosis' },
      ],
      correctOptionId: 'q1-a',
      explanation:
        'Photosynthesis uses chlorophyll to absorb light and produce glucose.',
      wrongExplanations: {
        'q1-b': 'Respiration breaks down glucose; it does not capture sunlight.',
        'q1-c': 'Fermentation is anaerobic and unrelated to sunlight capture.',
        'q1-d': 'Osmosis moves water across membranes, not energy conversion.',
      },
      points: 10,
      difficulty: 'easy',
    },
  ],
})

const question = quiz.questions[0]

const correctFeedback: AnswerFeedback = {
  questionId: question.id,
  selectedOptionId: question.correctOptionId,
  isCorrect: true,
  explanation: question.explanation,
  pointsAwarded: question.points,
}

const wrongFeedback: AnswerFeedback = {
  questionId: question.id,
  selectedOptionId: 'q1-b',
  isCorrect: false,
  explanation: question.wrongExplanations['q1-b'],
  pointsAwarded: 0,
}

const meta = {
  title: 'Quiz/QuestionReviewCard',
  component: QuestionReviewCard,
  tags: ['autodocs'],
  args: {
    question,
    questionNumber: 1,
    previewMode: true,
    animateReveal: false,
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuestionReviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const CorrectAnswer: Story = {
  args: {
    feedback: correctFeedback,
  },
}

export const WrongAnswer: Story = {
  args: {
    feedback: wrongFeedback,
  },
}
