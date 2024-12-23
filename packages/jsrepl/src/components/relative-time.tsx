'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatRelativeTime } from '@/lib/datetime'

/**
 * Displays a relative time as "some time ago", relative to the current time.
 */
export function RelativeTime({
  value,
  interval = 60_000,
  className,
}: {
  value: Date | string
  interval?: number
  className?: string
}) {
  const date = useMemo(() => new Date(value), [value])
  const [text, setText] = useState<string>(() => format(date))

  useEffect(() => {
    setText(format(date))
  }, [date])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setText(format(date))
    }, interval)

    return () => clearInterval(intervalId)
  }, [date, interval])

  return (
    <time dateTime={date.toISOString()} className={className} title={date.toLocaleString()}>
      {text}
    </time>
  )
}

function format(date: Date): string {
  const now = new Date()

  // Time on server can differ a bit from client, but in this component
  // `now` is always expected to be greater than or equal to `date`
  // (to format it as "some time ago").
  const fixedDate = now >= date ? date : now

  return formatRelativeTime(fixedDate, now)
}
