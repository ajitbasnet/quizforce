import { describe, expect, it } from 'vitest'
import {
  cacheResultsSession,
  loadResultsSession,
  RESULTS_ATTEMPT_KEY,
  RESULTS_QUIZ_KEY,
} from '../utils/resultsSessionCache'
import { makeAttempt, makeQuiz } from './fixtures/quiz'

describe('resultsSessionCache', () => {
  it('caches and loads a matching session', () => {
    const quiz = makeQuiz()
    const attempt = makeAttempt(quiz)
    cacheResultsSession(attempt, quiz)

    expect(sessionStorage.getItem(RESULTS_ATTEMPT_KEY)).toBeTruthy()
    expect(sessionStorage.getItem(RESULTS_QUIZ_KEY)).toBeTruthy()
    expect(loadResultsSession(attempt.id)).toEqual({ attempt, quiz })
  })

  it('returns null when attempt id does not match', () => {
    const quiz = makeQuiz()
    const attempt = makeAttempt(quiz)
    cacheResultsSession(attempt, quiz)

    expect(loadResultsSession('other-id')).toBeNull()
  })
})
