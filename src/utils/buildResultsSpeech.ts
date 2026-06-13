import type { TFunction } from 'i18next'
import type { AnswerFeedback, QuizAttempt, QuizQuestion } from '../types/quiz'
import { getGradeVoiceKey } from './scoreGrade'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

function getOptionLetter(index: number): string {
  return OPTION_LETTERS[index] ?? String(index + 1)
}

function getCorrectOptionInfo(question: QuizQuestion) {
  const correctOptionIndex = question.options.findIndex(
    (option) => option.id === question.correctOptionId,
  )
  const correctOption = question.options[correctOptionIndex]
  return {
    correctOption,
    correctLetter: getOptionLetter(correctOptionIndex),
  }
}

function getSelectedOptionInfo(question: QuizQuestion, selectedOptionId: string) {
  const selectedOptionIndex = question.options.findIndex(
    (option) => option.id === selectedOptionId,
  )
  const selectedOption = question.options[selectedOptionIndex]
  return {
    selectedOption,
    selectedLetter: getOptionLetter(selectedOptionIndex),
  }
}

function buildQuestionReviewExplanation(
  question: QuizQuestion,
  feedback: AnswerFeedback,
  t: TFunction,
): string {
  const { correctOption, correctLetter } = getCorrectOptionInfo(question)
  const wrongExplanation =
    question.wrongExplanations[feedback.selectedOptionId] ?? feedback.explanation

  if (feedback.isCorrect) {
    return question.explanation
  }

  return [
    wrongExplanation,
    t('results.correctAnswerIs', {
      letter: correctLetter,
      text: correctOption?.text ?? '',
    }),
    question.explanation,
  ]
    .filter(Boolean)
    .join(' ')
}

export function buildResultsIntroSpeech(
  attempt: QuizAttempt,
  t: TFunction,
): string[] {
  const correct = attempt.feedback.filter((f) => f.isCorrect).length
  const wrong = attempt.feedback.length - correct
  const gradeKey = getGradeVoiceKey(attempt.percentage)

  return [
    t('results.voiceScoreSummary', {
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      grade: t(gradeKey),
    }),
    t('results.voiceAnswerCounts', { correct, wrong }),
    t('results.voiceReviewIntro'),
  ]
}

export function buildQuestionReviewScrollSpeech(
  question: QuizQuestion,
  feedback: AnswerFeedback,
  t: TFunction,
): string[] {
  const statusLine = feedback.isCorrect
    ? t('results.voiceAnswerCorrect')
    : (() => {
        const { selectedOption, selectedLetter } = getSelectedOptionInfo(
          question,
          feedback.selectedOptionId,
        )
        return t('results.voiceAnswerIncorrect', {
          letter: selectedLetter,
          text: selectedOption?.text ?? '',
        })
      })()

  return [
    question.questionText,
    statusLine,
    buildQuestionReviewExplanation(question, feedback, t),
  ]
}

export function buildQuestionReviewFullSpeech(
  question: QuizQuestion,
  feedback: AnswerFeedback,
  t: TFunction,
): string[] {
  const optionLines = question.options.map(
    (option, index) => `Option ${getOptionLetter(index)}: ${option.text}`,
  )

  return [
    question.questionText,
    ...optionLines,
    buildQuestionReviewExplanation(question, feedback, t),
  ]
}
