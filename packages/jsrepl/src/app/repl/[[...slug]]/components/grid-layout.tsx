import { cn } from '@/lib/utils'

export default function GridLayout({ children }: { children: React.ReactNode }) {
  return <div className={cn('repl-layout-default grid h-full')}>{children}</div>
}
