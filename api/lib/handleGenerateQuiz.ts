import { z } from 'zod'
import { buildQuizPrompt } from '../../src/utils/promptBuilder'
import { parseAndValidateClaudeQuiz } from '../../src/utils/quizSchema'
import { stripHtmlTags } from '../../src/utils/sanitizeText'
import { callProvider, ProviderCallError } from './callProvider'
import { getCorsHeaders } from './cors'
import { generateQuizRequestSchema } from './requestSchema'
import { getClientIp, isRateLimited } from './rateLimit'

export interface HandleGenerateQuizOptions {
  geminiApiKey?: string
  groqApiKey?: string
  allowedOrigins?: string
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders,
    },
  })
}

export async function handleGenerateQuiz(
  request: Request,
  options: HandleGenerateQuizOptions = {},
): Promise<Response> {
  const corsHeaders = getCorsHeaders(request, options.allowedOrigins)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      { error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' } },
      405,
      corsHeaders,
    )
  }

  const { geminiApiKey, groqApiKey } = options
  if (!geminiApiKey) {
    return jsonResponse(
      { error: { message: 'Server misconfiguration', code: 'CONFIG_ERROR' } },
      500,
      corsHeaders,
    )
  }

  const clientIp = getClientIp(request)
  if (isRateLimited(clientIp)) {
    return jsonResponse(
      {
        error: {
          message: 'Too many requests. Please wait before trying again.',
          code: 'RATE_LIMIT_ERROR',
        },
      },
      429,
      corsHeaders,
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse(
      { error: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } },
      400,
      corsHeaders,
    )
  }

  const parsed = generateQuizRequestSchema.safeParse(body)
  if (!parsed.success) {
    return jsonResponse(
      {
        error: {
          message: parsed.error.message,
          code: 'VALIDATION_ERROR',
        },
      },
      400,
      corsHeaders,
    )
  }

  const { content, settings, sourceType } = parsed.data
  const sanitizedContent = stripHtmlTags(content)
  const { system, user } = buildQuizPrompt(
    sanitizedContent,
    settings,
    sourceType,
  )

  let text: string
  let provider: 'gemini' | 'groq'
  try {
    const result = await callProvider(
      { system, user },
      { geminiApiKey, groqApiKey },
    )
    text = result.raw
    provider = result.provider
  } catch (error) {
    if (error instanceof ProviderCallError) {
      return jsonResponse(
        { error: { message: error.message, code: error.code } },
        error.status,
        corsHeaders,
      )
    }
    throw error
  }

  try {
    const quiz = parseAndValidateClaudeQuiz(text, {
      content: sanitizedContent,
      settings,
      sourceType,
    })

    if (quiz.questions.length === 0) {
      return jsonResponse(
        { error: { message: 'Quiz has no questions', code: 'EMPTY_QUIZ' } },
        422,
        corsHeaders,
      )
    }

    return jsonResponse({ quiz, meta: { provider } }, 200, corsHeaders)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(
        { error: { message: error.message, code: 'VALIDATION_ERROR' } },
        422,
        corsHeaders,
      )
    }
    if (error instanceof SyntaxError) {
      return jsonResponse(
        {
          error: {
            message: 'Failed to parse quiz JSON from API response',
            code: 'PARSE_ERROR',
          },
        },
        422,
        corsHeaders,
      )
    }
    return jsonResponse(
      { error: { message: 'Quiz generation failed', code: 'API_ERROR' } },
      500,
      corsHeaders,
    )
  }
}
