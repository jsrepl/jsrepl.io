'use client'

import { useQuery } from '@tanstack/react-query'
import { LucideTelescope } from 'lucide-react'
import ErrorComponent from '@/components/error'
import { RelativeTime } from '@/components/relative-time'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { loadRecentlyViewedRepls } from '@/lib/repl-stored-state/adapter-supabase'
import { ReplStoredState } from '@/types'
import ReplCard from './repl-card'
import { ReplCardSkeleton } from './repl-card-skeleton'

export function RecentlyViewed() {
  const user = useUser()
  const supabase = useSupabaseClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['recently-viewed-repls', user?.id],
    queryFn: ({ signal }) => (user ? loadRecentlyViewedRepls({ supabase, signal }) : []),
    staleTime: 60_000,
  })

  return (
    <>
      {error && <ErrorComponent error={error} />}
      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2">
          <LucideTelescope size={84} className="my-8 opacity-10" />
          <p className="text-muted-foreground/60">
            No REPLs here... did they go on a coffee break?
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data &&
          data.map((repl) => (
            <ReplCard
              key={repl.id}
              repl={repl}
              customTimestamp={<RecentlyViewedTimestamp repl={repl} />}
            />
          ))}
        {isLoading && Array.from({ length: 8 }).map((_, index) => <ReplCardSkeleton key={index} />)}
      </div>
    </>
  )
}

function RecentlyViewedTimestamp({ repl }: { repl: ReplStoredState & { viewed_at: string } }) {
  return (
    <>
      {repl.viewed_at && (
        <span className="text-muted-foreground text-nowrap text-xs">
          <RelativeTime date={new Date(repl.viewed_at)} />
        </span>
      )}
    </>
  )
}
