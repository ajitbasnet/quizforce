import { describe, expect, it } from 'vitest'
import { assemblePrompt, buildQuizPrompt } from '../utils/promptBuilder'
import type { QuizSettings } from '../types/quiz'

const baseSettings: QuizSettings = {
  pointsPerQuestion: 10,
  customPointsMap: {},
  questionsCount: 12,
  difficulty: 'medium',
  voiceEnabled: false,
  voiceRate: 1,
  voicePitch: 1,
  voiceURI: null,
  timerEnabled: false,
  language: 'es',
}

describe('buildQuizPrompt', () => {
  it('includes JSON shape instruction in user prompt', () => {
    const { user } = buildQuizPrompt('Sample content', baseSettings, 'text')

    expect(user).toContain('## Required JSON shape')
    expect(user).toContain('"questions": [{')
    expect(user).toContain('"wrongExplanations"')
  })

  it('includes language instruction for the selected language', () => {
    const { user } = buildQuizPrompt('Content', baseSettings, 'pdf')

    expect(user).toContain('## Language instruction')
    expect(user).toContain('Write all questionText, options, explanation, and wrongExplanations in Spanish.')
    expect(user).toContain('- Language: es')
  })

  it('includes question count and source type in output', () => {
    const { system, user } = buildQuizPrompt('Topic body', baseSettings, 'prompt')

    expect(system).toContain('valid JSON only')
    expect(user).toContain('## Source context (Topic or prompt)')
    expect(user).toContain('Topic body')
    expect(user).toContain('- Number of questions: 12')
    expect(user).toContain('- Points per question: 10')
    expect(user).toContain('- Difficulty: medium')
  })
})

describe('assemblePrompt', () => {
  it('builds a minimal topic prompt', () => {
    const result = assemblePrompt(
      {
        topic: 'Photosynthesis',
        subtopics: '',
        audience: 'high_school',
        customAudience: '',
        specialInstructions: '',
      },
      { audience: 'High school students' },
    )

    expect(result).toBe(
      'Create a quiz on the topic: Photosynthesis\n\nTarget audience: High school students',
    )
  })

  it('includes optional subtopics and special instructions', () => {
    const result = assemblePrompt(
      {
        topic: 'World War II',
        subtopics: 'Pacific theater, D-Day',
        audience: 'college',
        customAudience: '',
        specialInstructions: 'Focus on causes.',
      },
      { audience: 'College students' },
    )

    expect(result).toContain('Subtopics to cover: Pacific theater, D-Day')
    expect(result).toContain('Special instructions: Focus on causes.')
  })
})
