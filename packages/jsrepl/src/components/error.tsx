'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { SimpleIconsGithub } from '@/components/icons/simple-icons/github'
import { Button } from '@/components/ui/button'
import { ResponseError } from '@/lib/response-error'

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error, error.cause)
  }, [error])

  return (
    <div className="container my-24 max-w-3xl">
      <h1 className="mb-4 text-4xl font-bold">Something went wrong :(</h1>
      <h2 className="mb-6 text-2xl">{error.message}</h2>
      {error instanceof ResponseError && (
        <p className="mb-6 space-x-2 opacity-80">
          <code>{error.name}</code>
          {error.status !== undefined && <code>{error.status}</code>}
          {error.statusText && <code>{error.statusText}</code>}
          {error.url && <code>{error.url}</code>}
          {error.cause instanceof Error && <code>{error.cause.toString()}</code>}
          {error.cause instanceof Object && <code>{JSON.stringify(error.cause, null, 2)}</code>}
          {typeof error.cause === 'string' && <code>{error.cause}</code>}
        </p>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Button asChild size="lg">
          <Link href="https://github.com/jsrepl/jsrepl.io/issues" target="_blank">
            <SimpleIconsGithub width={20} height={20} className="mr-2" />
            Report an issue
          </Link>
        </Button>

        {reset && (
          <Button size="lg" variant="link" onClick={() => reset()}>
            Try again
          </Button>
        )}

        <Button asChild size="lg" variant="link">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </div>
  )
}
