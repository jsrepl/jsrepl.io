const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diffInSeconds = date.getTime() - now
  const diffSign = Math.sign(diffInSeconds)
  const diffInSecondsAbs = Math.abs(diffInSeconds) / 1000

  if (diffInSecondsAbs < 60) {
    return diffSign !== 1 ? 'less than a minute ago' : 'in less than a minute'
  }

  const timeIntervals: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ]

  for (const interval of timeIntervals) {
    const count = Math.floor(diffInSecondsAbs / interval.seconds)
    if (count !== 0) {
      return rtf.format(count * diffSign, interval.unit)
    }
  }

  return rtf.format(0, 'second') // Default to "now" if no difference
}
