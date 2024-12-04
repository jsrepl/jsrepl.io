import { cn } from '@/lib/utils'

export default function GridLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'grid h-full grid-cols-[auto,auto,1fr,auto] grid-rows-1 [grid-template-areas:"activity-bar_left-sidebar_editor_right-sidebar"]'
      )}
    >
      {children}
    </div>
  )
}
