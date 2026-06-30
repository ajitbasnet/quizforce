export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function forwardToAnthropic(
  request: Request,
  apiKey: string,
): Promise<Response> {
  const body = await request.text()

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body,
  })

  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: { 'content-type': 'application/json' },
  })
}
