import React from 'react'
import Link from 'next/link'
import { LucidePlus } from 'lucide-react'
import IconGithub from '~icons/simple-icons/github.jsx'
import Logo from '@/components/logo'
import { cn } from '@/lib/utils'

export default function Header({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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
          <span className="tracking-wide text-stone-200">JSREPL</span>
        </Link>

        <div className="text-secondary-foreground/80 ml-auto flex items-center text-sm font-medium leading-10 [&_a]:px-3 [&_a]:underline-offset-4 hover:[&_a]:underline">
          <Link href="https://github.com/jsrepl/jsrepl.io/releases" target="_blank">
            Changelog
          </Link>

          <div className="border-border mx-2 h-5 border-l" />

          <Link href="/repl" className="text-primary inline-flex items-center text-nowrap">
            <LucidePlus size={18} className="mr-1" />
            New REPL
          </Link>

          <div className="border-border mx-2 h-5 border-l" />

          <Link
            href="https://github.com/jsrepl/jsrepl.io"
            target="_blank"
            className="text-secondary-foreground/70 hover:text-secondary-foreground/90 inline-flex h-10 w-10 items-center justify-center !p-0"
            aria-label="GitHub repository"
          >
            <IconGithub width={20} height={20} />
          </Link>
        </div>
      </div>
    </header>
  )
}
