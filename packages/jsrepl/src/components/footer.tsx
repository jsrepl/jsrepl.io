import React from 'react'
import Link from 'next/link'
import { LucideArrowUpRight } from 'lucide-react'
import Logo from '@/components/logo'
import { cn } from '@/lib/utils'

export default function Footer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <footer
      className={cn(
        'border-border text-secondary-foreground/80 flex flex-wrap items-center gap-x-28 gap-y-10 border-t p-8',
        className
      )}
      {...props}
    >
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-light tracking-wide">
          <Logo width="1.5rem" height="1.5rem" />
          <span className="tracking-wide">JSREPL</span>
        </Link>

        <div className="text-muted-foreground text-sm">Copyright © 2024 Aleksei Nagovitsyn</div>

        <div className="text-muted-foreground mt-1 text-sm italic">Code, Play, Ship it.</div>
      </div>

      <div className="flex flex-wrap gap-8 [&_a]:underline-offset-4 hover:[&_a]:underline">
        <a href="https://github.com/jsrepl/jsrepl.io" target="_blank" rel="noopener noreferrer">
          GitHub
          <LucideArrowUpRight size={16} className="ml-1 inline-block opacity-30" />
        </a>

        <a
          href="https://github.com/jsrepl/jsrepl.io/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Issues
          <LucideArrowUpRight size={16} className="ml-1 inline-block opacity-30" />
        </a>

        <a
          href="https://github.com/jsrepl/jsrepl.io/releases"
          target="_blank"
          rel="noopener noreferrer"
        >
          Changelog
          <LucideArrowUpRight size={16} className="ml-1 inline-block opacity-30" />
        </a>

        <Link href="/contact">Contact</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </div>
    </footer>
  )
}
