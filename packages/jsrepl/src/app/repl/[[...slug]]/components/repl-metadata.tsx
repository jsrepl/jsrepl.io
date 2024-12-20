import { useSuspenseQuery } from '@tanstack/react-query'
import { replQueryKey, useReplParams } from '@/hooks/useReplParams'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { loadRepl } from '@/lib/repl-stored-state/load-repl'

export default function ReplMetadata() {
  const replParams = useReplParams()
  const supabase = useSupabaseClient()

  const { data: replState } = useSuspenseQuery({
    queryKey: replQueryKey(replParams),
    queryFn: ({ signal }) => loadRepl(replParams, { supabase, signal }),
    staleTime: 60_000,
  })

  const title = replState?.title || 'JavaScript REPL & Playground'

  return (
    <>
      <title>{title}</title>
      <meta name="og:title" content={title} />
      {!replState && <meta name="robots" content="noindex" />}
    </>
  )
}
