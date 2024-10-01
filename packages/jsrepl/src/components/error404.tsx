'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import IconGithub from '~icons/simple-icons/github'
import { Button } from '@/components/ui/button'

export default function Error404() {
  const pathname = usePathname()

  return (
    <div className="container my-24 max-w-3xl">
      <h1 className="mb-4 text-4xl font-bold">404</h1>

      <h2 className="mb-6 text-2xl">
        Woops! You are looking for &quot;
        <span className="cursor-not-allowed underline decoration-gray-500 decoration-dashed decoration-2 underline-offset-8">
          {pathname}
        </span>
        &quot;, but it doesn&apos;t exist.
      </h2>

      <div className="mt-12 flex flex-wrap items-center gap-4">
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
