import type { TFunction } from 'i18next'
import { getSupabaseClient } from '../api/supabase'
import type { Quiz, QuizAttempt } from '../types/quiz'

export interface SharePayload {
  attempt: QuizAttempt
  quiz: Quiz
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) {
    base64 += '='.repeat(4 - pad)
  }
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function isSharePayload(value: unknown): value is SharePayload {
  if (!value || typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  if (!record.attempt || typeof record.attempt !== 'object') return false
  if (!record.quiz || typeof record.quiz !== 'object') return false

  const attempt = record.attempt as Record<string, unknown>
  const quiz = record.quiz as Record<string, unknown>

  return typeof attempt.id === 'string' && typeof quiz.id === 'string'
}

export function encodeSharePayload(payload: SharePayload): string {
  return toBase64Url(JSON.stringify(payload))
}

export function decodeSharePayload(data: string): SharePayload | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(data))
    return isSharePayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

export async function hasSupabaseSession(): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return Boolean(session)
}

export function buildShareUrl({
  attempt,
  quiz,
  isAuthenticated,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
}: {
  attempt: QuizAttempt
  quiz: Quiz
  isAuthenticated: boolean
  origin?: string
}): string {
  if (isAuthenticated) {
    return `${origin}/results/${attempt.id}`
  }

  return `${origin}/results?data=${encodeSharePayload({ attempt, quiz })}`
}

export function buildShareCopyText({
  attempt,
  quiz,
  t,
}: {
  attempt: QuizAttempt
  quiz: Quiz
  t: TFunction
}): string {
  return t('results.shareCopyText', {
    score: attempt.score,
    totalPoints: attempt.totalPoints,
    title: quiz.title,
  })
}

export function buildTwitterIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export function buildWhatsAppIntentUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text: `${text} ${url}` })
  return `https://wa.me/?${params.toString()}`
}
