import { describe, expect, it, vi } from 'vitest'
import {
  buildHistoryExport,
  getHistoryExportFilename,
  validateHistoryImport,
} from '../utils/historyExport'
import { makeAttempt, makeQuiz } from './fixtures/quiz'

describe('historyExport', () => {
  const quiz = makeQuiz()
  const attempt = makeAttempt(quiz)

  it('builds a versioned export payload', () => {
    const payload = buildHistoryExport([quiz], [attempt])
    expect(payload.version).toBe(1)
    expect(payload.quizzes).toHaveLength(1)
    expect(payload.attempts).toHaveLength(1)
    expect(payload.exportedAt).toBeTruthy()
  })

  it('validates imported history payloads', () => {
    const payload = buildHistoryExport([quiz], [attempt])
    expect(validateHistoryImport(payload)).toEqual(payload)
    expect(validateHistoryImport({ version: 2 })).toBeNull()
  })

  it('builds a dated export filename', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00.000Z'))
    expect(getHistoryExportFilename()).toBe('quizforge-history-2026-06-30.json')
    vi.useRealTimers()
  })
})
