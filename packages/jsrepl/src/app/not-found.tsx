'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import IconGithub from '~icons/simple-icons/github'
import Footer from '@/components/footer'
import Header from '@/components/header'
import ThemeProvider from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const pathname = usePathname()

  return (
    <ThemeProvider forcedTheme="dark-plus">
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="container my-24 max-w-3xl flex-1">
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
        </main>

        <Footer className="mt-32 max-md:mt-20" />
      </div>
    </ThemeProvider>
  )
}
