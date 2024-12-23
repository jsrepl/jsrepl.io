'use client'

import { useEffect, useState } from 'react'
import { formatRelativeTime } from '@/lib/datetime'

export function RelativeTime({ date, interval = 60_000 }: { date: Date; interval?: number }) {
  const [value, setValue] = useState<string>(format(date))

  useEffect(() => {
    setValue(format(date))
  }, [date])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setValue(format(date))
    }, interval)

    return () => clearInterval(intervalId)
  }, [date, interval])

  return value
}

function format(date: Date): string {
  return formatRelativeTime(date)
}
