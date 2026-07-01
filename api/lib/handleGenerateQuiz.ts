import { z } from 'zod'
import { buildQuizPrompt } from '../../src/utils/promptBuilder'
import { parseAndValidateClaudeQuiz } from '../../src/utils/quizSchema'
import { stripHtmlTags } from '../../src/utils/sanitizeText'
import { getCorsHeaders } from './cors'
import { generateQuizRequestSchema } from './requestSchema'
import { getClientIp, isRateLimited } from './rateLimit'

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4000

export interface HandleGenerateQuizOptions {
  apiKey?: string
  allowedOrigins?: string
}

interface AnthropicMessageResponse {
  content?: Array<{ type?: string; text?: string }>
}

interface AnthropicErrorResponse {
  error?: {
    type?: string
    message?: string
  }
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

function mapAnthropicError(
  status: number,
  body: AnthropicErrorResponse,
): { message: string; code?: string } {
  const errorType = body.error?.type
  const message = body.error?.message ?? `Anthropic API error (${status})`

  switch (errorType) {
    case 'rate_limit_error':
      return { message, code: 'RATE_LIMIT_ERROR' }
    case 'overloaded_error':
      return { message, code: 'OVERLOADED_ERROR' }
    case 'invalid_api_key':
    case 'authentication_error':
      return { message, code: 'INVALID_API_KEY' }
    default:
      if (status === 401) {
        return { message, code: 'INVALID_API_KEY' }
      }
      return { message, code: 'API_ERROR' }
  }
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

  const apiKey = options.apiKey
  if (!apiKey) {
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

  let anthropicResponse: Response
  try {
    anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })
  } catch {
    return jsonResponse(
      { error: { message: 'Failed to reach Anthropic API', code: 'NETWORK_ERROR' } },
      502,
      corsHeaders,
    )
  }

  const anthropicText = await anthropicResponse.text()
  if (!anthropicResponse.ok) {
    let errorBody: AnthropicErrorResponse = {}
    if (anthropicText) {
      try {
        errorBody = JSON.parse(anthropicText) as AnthropicErrorResponse
      } catch {
        errorBody = { error: { message: anthropicText } }
      }
    }
    const mapped = mapAnthropicError(anthropicResponse.status, errorBody)
    return jsonResponse({ error: mapped }, anthropicResponse.status, corsHeaders)
  }

  let anthropicData: AnthropicMessageResponse
  try {
    anthropicData = JSON.parse(anthropicText) as AnthropicMessageResponse
  } catch {
    return jsonResponse(
      { error: { message: 'Invalid Anthropic response', code: 'PARSE_ERROR' } },
      502,
      corsHeaders,
    )
  }

  const text = anthropicData.content?.[0]?.text
  if (!text) {
    return jsonResponse(
      {
        error: {
          message: 'API response did not contain quiz content',
          code: 'PARSE_ERROR',
        },
      },
      502,
      corsHeaders,
    )
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

    return jsonResponse({ quiz }, 200, corsHeaders)
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
