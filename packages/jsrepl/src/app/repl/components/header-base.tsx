import Link from 'next/link'
import Logo from '@/components/logo'

export default function HeaderBase({ children }: { children?: React.ReactNode }) {
  return (
    <header className="h-repl-header flex items-stretch gap-2 border-b px-2 leading-[calc(theme(height.repl-header)-1px)]">
      <Link
        href="/"
        className="mr-24 inline-flex items-center gap-2 text-lg font-light tracking-wide max-[840px]:mr-6"
      >
        <Logo width="1.25rem" height="1.25rem" />
        <span className="text-foreground/80">JSREPL</span>
      </Link>

      {children}
    </header>
  )
}
