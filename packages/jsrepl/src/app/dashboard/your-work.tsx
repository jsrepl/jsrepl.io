import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LucideLampDesk } from 'lucide-react'
import ErrorComponent from '@/components/error'
import { Pagination } from '@/components/pagination'
import { useSearchParamsPagination } from '@/hooks/useSearchParamsPagination'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { loadUserRepls } from '@/lib/repl-stored-state/adapter-supabase'
import ReplCard from './repl-card'
import { ReplCardSkeleton } from './repl-card-skeleton'

export function YourWork() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const containerRef = useRef<HTMLDivElement>(null)

  const [pagination, consumePageData] = useSearchParamsPagination({
    scroll() {
      containerRef.current?.scrollIntoView({ behavior: 'smooth' })
    },
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-repls', user?.id, pagination.page, pagination.pageSize],
    queryFn: ({ signal }) =>
      user
        ? loadUserRepls(user.id, {
            supabase,
            page: pagination.page,
            pageSize: pagination.pageSize,
            signal,
          })
        : { data: [], hasMore: false },
    staleTime: 60_000,
  })

  const repls = data?.data
  const hasMore = data?.hasMore ?? false
  consumePageData({ hasMore })

  return (
    <div ref={containerRef} className="scroll-mt-24">
      {error && <ErrorComponent error={error} />}
      {repls && repls.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2">
          <LucideLampDesk size={84} className="my-8 opacity-10" />
          <p className="text-muted-foreground/60">
            No REPLs here... maybe they are in a parallel universe?
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {repls && repls.map((repl) => <ReplCard key={repl.id} repl={repl} />)}
        {isLoading &&
          Array.from({ length: pagination.pageSize }).map((_, index) => (
            <ReplCardSkeleton key={index} />
          ))}
      </div>
      <Pagination value={pagination} className="mt-10" />
    </div>
  )
}
