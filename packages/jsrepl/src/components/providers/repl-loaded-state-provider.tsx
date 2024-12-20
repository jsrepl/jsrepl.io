import { ReactNode, createContext } from 'react'
import { notFound } from 'next/navigation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { replQueryKey, useReplParams } from '@/hooks/useReplParams'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { loadRepl } from '@/lib/repl-stored-state/load-repl'
import { Database, ReplStoredState } from '@/types'

export type ReplLoadedStateContextType = {
  state: ReplStoredState
}

export const ReplLoadedStateContext = createContext<ReplLoadedStateContextType | null>(null)

export default function ReplLoadedStateProvider({ children }: { children: ReactNode }) {
  const replParams = useReplParams()
  const supabase = useSupabaseClient<Database>()

  const { data: state, error } = useSuspenseQuery({
    queryKey: replQueryKey(replParams),
    queryFn: ({ signal }) => loadRepl(replParams, { supabase, signal }),
    staleTime: 60_000,
  })

  if (error) {
    throw error
  }

  if (!state) {
    notFound()
  }

  return (
    <ReplLoadedStateContext.Provider value={{ state }}>{children}</ReplLoadedStateContext.Provider>
  )
}
