import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaginationProps } from '@/hooks/useSearchParamsPagination'
import { cn } from '@/lib/utils'

type Props = {
  value: PaginationProps
  className?: string
}

export function Pagination({ value, className }: Props) {
  const { page, goPrevious, goNext, hasPrevious, hasNext, scroll } = value

  function handleScroll(e: React.MouseEvent<HTMLButtonElement>) {
    if (typeof scroll === 'function') {
      const button = e.target as HTMLButtonElement
      button.blur()

      requestAnimationFrame(() => {
        scroll()
      })
    }
  }

  function onNextClick(e: React.MouseEvent<HTMLButtonElement>) {
    goNext()
    handleScroll(e)
  }

  function onPreviousClick(e: React.MouseEvent<HTMLButtonElement>) {
    goPrevious()
    handleScroll(e)
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Button
        variant="ghost-primary"
        onClick={onPreviousClick}
        disabled={!hasPrevious}
        className="min-w-28 justify-end"
      >
        <LucideChevronLeft size={18} className="mr-1" />
        Previous
      </Button>

      <span className="text-muted-foreground flex h-9 items-center justify-center rounded border px-3 py-1 text-sm">
        Page {page}
      </span>

      <Button
        variant="ghost-primary"
        onClick={onNextClick}
        disabled={!hasNext}
        className="min-w-28 justify-start"
      >
        Next
        <LucideChevronRight size={18} className="ml-1" />
      </Button>
    </div>
  )
}
