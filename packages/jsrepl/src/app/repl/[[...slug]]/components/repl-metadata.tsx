import { useParams, useSearchParams } from 'next/navigation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { loadRepl } from '@/lib/repl-stored-state/load-repl'
import { getReplTitle } from '@/lib/repl-title'

export default function ReplMetadata() {
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()

  const { data: replState } = useSuspenseQuery({
    queryKey: ['repl', params, searchParams],
    queryFn: ({ signal }) => loadRepl(params, searchParams, { supabase, signal }),
    staleTime: 60_000,
  })

  const title = replState ? getReplTitle(replState) : 'JavaScript REPL & Playground'

  return (
    <>
      <title>{title}</title>
      <meta name="og:title" content={title} />
      {!replState && <meta name="robots" content="noindex" />}
    </>
  )
}
