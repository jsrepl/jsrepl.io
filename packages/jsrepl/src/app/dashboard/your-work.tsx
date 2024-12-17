import { useQuery } from '@tanstack/react-query'
import { LucideLampDesk } from 'lucide-react'
import ErrorComponent from '@/components/error'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { loadUserRepls } from '@/lib/repl-stored-state/adapter-supabase'
import ReplCard from './repl-card'
import { ReplCardSkeleton } from './repl-card-skeleton'

export function YourWork() {
  const user = useUser()
  const supabase = useSupabaseClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-repls', user?.id],
    queryFn: ({ signal }) => (user ? loadUserRepls(user.id, { supabase, signal }) : []),
    staleTime: 60_000,
  })

  return (
    <>
      {error && <ErrorComponent error={error} />}
      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2">
          <LucideLampDesk size={84} className="my-8 opacity-10" />
          <p className="text-muted-foreground/60">
            No REPLs here... maybe they are in a parallel universe?
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data && data.map((repl) => <ReplCard key={repl.id} repl={repl} />)}
        {isLoading && Array.from({ length: 8 }).map((_, index) => <ReplCardSkeleton key={index} />)}
      </div>
    </>
  )
}
