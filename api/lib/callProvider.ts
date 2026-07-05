import type { QuizPromptParts } from '../../src/utils/promptBuilder'
import {
  buildGeminiRequestBody,
  buildGroqRequestBody,
} from '../../src/utils/promptBuilder'

export type { QuizPromptParts }

export type ProviderName = 'gemini' | 'groq'

export interface ProviderKeys {
  geminiApiKey: string
  groqApiKey?: string
}

export interface ProviderCallResult {
  raw: string
  provider: ProviderName
}

export class ProviderCallError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = 'ProviderCallError'
    this.status = status
    this.code = code
  }
}

export const PROVIDER_TIMEOUT_MS = 60_000
export const GENERATION_TEMPERATURE = 0.7

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: {
    message?: string
    code?: number
    status?: string
  }
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
    type?: string
    code?: string
  }
}

type GeminiAttempt =
  | { kind: 'success'; text: string }
  | { kind: 'fallback' }
  | { kind: 'error'; error: ProviderCallError }

type GroqAttempt =
  | { kind: 'success'; text: string }
  | { kind: 'error'; error: ProviderCallError }

function mergeSignals(
  external?: AbortSignal,
): { signal: AbortSignal; isExternalAbort: () => boolean } {
  const timeoutSignal = AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  if (!external) {
    return { signal: timeoutSignal, isExternalAbort: () => false }
  }

  const controller = new AbortController()
  const onAbort = (source: AbortSignal) => {
    if (source.aborted) {
      controller.abort(source.reason)
    }
  }

  onAbort(external)
  onAbort(timeoutSignal)

  external.addEventListener('abort', () => controller.abort(external.reason), {
    once: true,
  })
  timeoutSignal.addEventListener(
    'abort',
    () => controller.abort(timeoutSignal.reason),
    { once: true },
  )

  return {
    signal: controller.signal,
    isExternalAbort: () => external.aborted,
  }
}

function shouldFallbackGemini(status: number): boolean {
  return status === 429 || status >= 500
}

function parseGeminiText(data: GeminiGenerateResponse): string | null {
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
}

function parseGroqText(data: GroqChatResponse): string | null {
  const text = data.choices?.[0]?.message?.content
  return text?.trim() ? text : null
}

function mapGeminiHttpError(
  status: number,
  body: GeminiGenerateResponse,
): ProviderCallError {
  const message =
    body.error?.message ?? `Gemini API error (${status})`

  if (status === 401 || status === 403) {
    return new ProviderCallError(message, 401, 'INVALID_API_KEY')
  }

  return new ProviderCallError(message, status, 'API_ERROR')
}

function mapGroqHttpError(
  status: number,
  body: GroqChatResponse,
): ProviderCallError {
  const message = body.error?.message ?? `Groq API error (${status})`
  const errorCode = body.error?.code

  if (status === 429 || errorCode === 'rate_limit_exceeded') {
    return new ProviderCallError(message, status, 'RATE_LIMIT_ERROR')
  }

  if (status === 401 || errorCode === 'invalid_api_key') {
    return new ProviderCallError(message, 401, 'INVALID_API_KEY')
  }

  return new ProviderCallError(message, status, 'API_ERROR')
}

async function callGemini(
  parts: QuizPromptParts,
  geminiApiKey: string,
  externalSignal?: AbortSignal,
): Promise<GeminiAttempt> {
  const { signal, isExternalAbort } = mergeSignals(externalSignal)
  const url = `${GEMINI_API_URL}?key=${encodeURIComponent(geminiApiKey)}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(
        buildGeminiRequestBody(parts, GENERATION_TEMPERATURE),
      ),
      signal,
    })
  } catch (error) {
    if (isExternalAbort() || (externalSignal?.aborted ?? false)) {
      throw error
    }
    return { kind: 'fallback' }
  }

  const responseText = await response.text()

  if (!response.ok) {
    let body: GeminiGenerateResponse = {}
    if (responseText) {
      try {
        body = JSON.parse(responseText) as GeminiGenerateResponse
      } catch {
        body = { error: { message: responseText } }
      }
    }

    if (shouldFallbackGemini(response.status)) {
      return { kind: 'fallback' }
    }

    return { kind: 'error', error: mapGeminiHttpError(response.status, body) }
  }

  let data: GeminiGenerateResponse
  try {
    data = JSON.parse(responseText) as GeminiGenerateResponse
  } catch {
    return {
      kind: 'error',
      error: new ProviderCallError(
        'Invalid Gemini response',
        502,
        'PARSE_ERROR',
      ),
    }
  }

  const text = parseGeminiText(data)
  if (!text) {
    return {
      kind: 'error',
      error: new ProviderCallError(
        'API response did not contain quiz content',
        502,
        'PARSE_ERROR',
      ),
    }
  }

  return { kind: 'success', text }
}

async function callGroq(
  parts: QuizPromptParts,
  groqApiKey: string,
  externalSignal?: AbortSignal,
): Promise<GroqAttempt> {
  const { signal, isExternalAbort } = mergeSignals(externalSignal)

  let response: Response
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${groqApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(buildGroqRequestBody(parts, GENERATION_TEMPERATURE)),
      signal,
    })
  } catch (error) {
    if (isExternalAbort() || (externalSignal?.aborted ?? false)) {
      throw error
    }
    return {
      kind: 'error',
      error: new ProviderCallError(
        'Failed to reach Groq API',
        502,
        'NETWORK_ERROR',
      ),
    }
  }

  const responseText = await response.text()

  if (!response.ok) {
    let body: GroqChatResponse = {}
    if (responseText) {
      try {
        body = JSON.parse(responseText) as GroqChatResponse
      } catch {
        body = { error: { message: responseText } }
      }
    }

    return { kind: 'error', error: mapGroqHttpError(response.status, body) }
  }

  let data: GroqChatResponse
  try {
    data = JSON.parse(responseText) as GroqChatResponse
  } catch {
    return {
      kind: 'error',
      error: new ProviderCallError(
        'Invalid Groq response',
        502,
        'PARSE_ERROR',
      ),
    }
  }

  const text = parseGroqText(data)
  if (!text) {
    return {
      kind: 'error',
      error: new ProviderCallError(
        'API response did not contain quiz content',
        502,
        'PARSE_ERROR',
      ),
    }
  }

  return { kind: 'success', text }
}

export async function callProvider(
  parts: QuizPromptParts,
  keys: ProviderKeys,
  signal?: AbortSignal,
): Promise<ProviderCallResult> {
  if (!keys.geminiApiKey) {
    throw new ProviderCallError(
      'Server misconfiguration',
      500,
      'CONFIG_ERROR',
    )
  }

  const geminiAttempt = await callGemini(parts, keys.geminiApiKey, signal)

  if (geminiAttempt.kind === 'success') {
    console.log('[quizforge] quiz generation served by gemini')
    return { raw: geminiAttempt.text, provider: 'gemini' }
  }

  if (geminiAttempt.kind === 'error') {
    throw geminiAttempt.error
  }

  if (!keys.groqApiKey) {
    throw new ProviderCallError(
      'Server misconfiguration',
      500,
      'CONFIG_ERROR',
    )
  }

  const groqAttempt = await callGroq(parts, keys.groqApiKey, signal)

  if (groqAttempt.kind === 'success') {
    console.log('[quizforge] quiz generation served by groq (fallback)')
    return { raw: groqAttempt.text, provider: 'groq' }
  }

  throw groqAttempt.error
}
