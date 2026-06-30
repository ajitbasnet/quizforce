import { forwardToAnthropic } from './lib/forwardToAnthropic'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: { message: 'Method not allowed' } }),
      { status: 405, headers: { 'content-type': 'application/json' } },
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'Server misconfiguration' } }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }

  return forwardToAnthropic(request, apiKey)
}
