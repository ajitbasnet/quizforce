export function getCorsHeaders(
  request: Request,
  allowedOriginsEnv?: string,
): Record<string, string> {
  const origin = request.headers.get('Origin')
  if (!origin) return {}

  const allowed = (allowedOriginsEnv ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (allowed.length > 0 && !allowed.includes(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
