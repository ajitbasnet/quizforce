const RELATIVE_TIME_DIVISIONS: {
  unit: Intl.RelativeTimeFormatUnit
  seconds: number
}[] = [
  { unit: 'year', seconds: 31_536_000 },
  { unit: 'month', seconds: 2_592_000 },
  { unit: 'week', seconds: 604_800 },
  { unit: 'day', seconds: 86_400 },
  { unit: 'hour', seconds: 3_600 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
]

export function formatRelativeTime(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }

  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  for (const { unit, seconds } of RELATIVE_TIME_DIVISIONS) {
    const interval = diffInSeconds / seconds
    if (Math.abs(interval) >= 1) {
      return rtf.format(Math.round(interval), unit)
    }
  }

  return rtf.format(0, 'second')
}
