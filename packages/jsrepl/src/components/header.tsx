'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LucideArrowUpRight, LucideLibrary, LucidePlus } from 'lucide-react'
import Logo from '@/components/logo'
import { cn } from '@/lib/utils'
import ReplStarterDialog from './repl-starter-dialog'
import ThemeSwitcher from './theme-switcher'
import { Button } from './ui/button'
import { UserMenu } from './user-menu'

export default function Header({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [starterDialogOpen, setStarterDialogOpen] = useState(false)

  return (
    <header
      className={cn(
        'bg-background/90 md:header-sticky-stuck relative z-[1] backdrop-blur-sm md:sticky md:top-0',
        className
      )}
      {...props}
    >
      <div className="container flex items-center gap-2 py-3 leading-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-light leading-10 tracking-wide"
        >
          <Logo width="1.5rem" height="1.5rem" />
          <span className="tracking-wide text-stone-800 dark:text-stone-200">JSREPL</span>
        </Link>

        <div className="text-secondary-foreground/80 ml-auto flex items-center whitespace-nowrap text-sm font-medium leading-10 [&_a]:px-3 [&_a]:underline-offset-4 hover:[&_a]:underline">
          <Link href="https://github.com/jsrepl/jsrepl.io" target="_blank">
            GitHub
            <LucideArrowUpRight size={16} className="ml-1 inline-block align-middle opacity-30" />
          </Link>

          <Link href="https://github.com/sponsors/nag5000" target="_blank">
            Donate
            <LucideArrowUpRight size={16} className="ml-1 inline-block align-middle opacity-30" />
          </Link>

          <Link href="https://github.com/jsrepl/jsrepl.io/releases" target="_blank">
            Changelog
            <LucideArrowUpRight size={16} className="ml-1 inline-block align-middle opacity-30" />
          </Link>

          <div className="border-border mx-2 h-5 border-l" />

          <Button asChild className="inline-flex items-center text-nowrap" variant="link" size="lg">
            <Link href="/dashboard">
              <LucideLibrary size={18} className="mr-1" />
              Dashboard
            </Link>
          </Button>

          <Button
            className="inline-flex items-center text-nowrap px-3"
            variant="link"
            size="lg"
            onClick={() => setStarterDialogOpen(true)}
          >
            <LucidePlus size={18} className="mr-1" />
            New REPL
          </Button>

          <div className="border-border mx-2 h-5 border-l" />

          <ThemeSwitcher size="icon-lg" />

          <UserMenu className="text-muted-foreground ml-1" />
        </div>
      </div>

      <ReplStarterDialog open={starterDialogOpen} onOpenChange={setStarterDialogOpen} />
    </header>
  )
}
