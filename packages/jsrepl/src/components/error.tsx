'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import IconGithub from '~icons/simple-icons/github.jsx'
import { Button } from '@/components/ui/button'

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container my-24 max-w-3xl">
      <h1 className="mb-4 text-4xl font-bold">Something went wrong :(</h1>
      <h2 className="mb-6 text-2xl">{error.message}</h2>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={() => reset()}>
          Try again
        </Button>

        <Button asChild size="lg">
          <Link href="/">Go to the home page</Link>
        </Button>

        <Button asChild variant="link" size="lg">
          <Link href="https://github.com/jsrepl/jsrepl.io/issues" target="_blank">
            <IconGithub width={20} height={20} className="mr-2" />
            Report an issue
          </Link>
        </Button>
      </div>
    </div>
  )
}
