import { useParams, useSearchParams } from 'next/navigation'
import { SupabaseClient } from '@supabase/supabase-js'
import { load } from '@/lib/repl-stored-state/adapter-supabase'
import { load as loadFromUrl } from '@/lib/repl-stored-state/adapter-url'
import { ResponseError } from '@/lib/response-error'
import { Database, ReplStoredState } from '@/types'

export async function loadRepl(
  params: ReturnType<typeof useParams>,
  searchParams: ReturnType<typeof useSearchParams>,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
): Promise<ReplStoredState | null> {
  const { slug } = params
  if (slug !== undefined && slug.length === 1) {
    const id = slug[0]!
    try {
      return await load(id, searchParams, { supabase, signal })
    } catch (error) {
      if (error instanceof ResponseError && error.status === 404) {
        return null
      }

      throw error
    }
  } else if (slug === undefined) {
    return loadFromUrl(searchParams)
  } else {
    return null
  }
}
