import { Skeleton } from '@/components/ui/skeleton'

export function ReplCardSkeleton() {
  return (
    <div className="text-secondary-foreground bg-secondary border-border/70 inline-flex flex-col rounded border">
      <div className="bg-editor-background h-48" />
      <div className="flex flex-1 flex-col p-5">
        <Skeleton className="mb-1.5 h-5 max-w-32" />
        <Skeleton className="mb-2.5 h-[1.125rem]" />
        <Skeleton className="mt-auto h-4 max-w-20" />
      </div>
    </div>
  )
}
