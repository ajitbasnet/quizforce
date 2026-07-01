const RATE_LIMIT_MS = 10_000

// Per-instance in-memory map; resets on cold start / new deployment.
const lastRequestByIp = new Map<string, number>()

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return 'unknown'
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const last = lastRequestByIp.get(ip)
  if (last !== undefined && now - last < RATE_LIMIT_MS) {
    return true
  }
  lastRequestByIp.set(ip, now)
  return false
}
