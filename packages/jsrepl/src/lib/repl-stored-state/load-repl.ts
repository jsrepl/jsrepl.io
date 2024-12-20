import { SupabaseClient } from '@supabase/supabase-js'
import { ReplParams } from '@/hooks/useReplParams'
import { load } from '@/lib/repl-stored-state/adapter-supabase'
import { load as loadFromUrl } from '@/lib/repl-stored-state/adapter-url'
import { ResponseError } from '@/lib/response-error'
import { Database, ReplStoredState } from '@/types'

export async function loadRepl(
  params: ReplParams,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
): Promise<ReplStoredState | null> {
  const { id, searchParams } = params
  if (id !== undefined) {
    try {
      return await load(id, searchParams, { supabase, signal })
    } catch (error) {
      if (error instanceof ResponseError && error.status === 404) {
        return null
      }

      throw error
    }
  } else {
    return loadFromUrl(searchParams)
  }
}
