'use client'

import React from 'react'
import ErrorComponent from '@/components/error'
import HeaderBase from './repl/components/header-base'

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
