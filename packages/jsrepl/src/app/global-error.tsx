'use client'

import React from 'react'
import HeaderBase from '@/app/repl/components/header-base'
import ErrorComponent from '@/components/error'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    // global-error must include html and body tags
    <html lang="en" data-theme="dark-plus">
      <body>
        <HeaderBase />
        <ErrorComponent error={error} reset={reset} />
      </body>
    </html>
  )
}
