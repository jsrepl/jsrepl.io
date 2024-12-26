import { SupabaseClient } from '@supabase/supabase-js'
import { Database, ReplStoredState } from '@/types'
import { toCreatePayload, toUpdatePayload } from './utils'

/**
 * Get a repl by id
 */
export async function getRepl(
  id: string,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  return await supabase
    .from('repls')
    .select(`*, user:public_profiles(*)`)
    .eq('id', id)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
    .maybeSingle()
}

/**
 * Get repls by ids
 */
export async function getRepls(
  ids: string[],
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  return await supabase
    .from('repls')
    .select(`*, user:public_profiles(*)`)
    .in('id', ids)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
}

/**
 * Get all repls for a user
 */
export async function getUserRepls(
  userId: string,
  {
    supabase,
    page,
    pageSize,
    signal,
  }: { supabase: SupabaseClient<Database>; page: number; pageSize: number; signal?: AbortSignal }
) {
  return await supabase
    .from('repls')
    .select(`*, user:public_profiles(*)`, { count: 'estimated' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
}

/**
 * Get recently viewed repls for a current user
 */
export async function getRecentlyViewedRepls({
  supabase,
  page,
  pageSize,
  signal,
}: {
  supabase: SupabaseClient<Database>
  page: number
  pageSize: number
  signal?: AbortSignal
}) {
  return await supabase
    .from('recent_user_repls')
    .select(`*, user:public_profiles(*)`, { count: 'estimated' })
    .order('viewed_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
}

/**
 * Create a new repl
 */
export async function createRepl(
  repl: ReplStoredState,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  const payload = toCreatePayload(repl)

  return await supabase
    .from('repls')
    .insert(payload)
    .select(`*, user:public_profiles(*)`)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
    .single()
}

/**
 * Fork a repl
 */
export async function forkRepl(
  repl: ReplStoredState,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  return createRepl(repl, { supabase, signal })
}

/**
 * Update a repl
 */
export async function updateRepl(
  repl: ReplStoredState,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  if (!repl.id) {
    throw new Error('Repl ID is required')
  }

  const payload = toUpdatePayload(repl)

  return await supabase
    .from('repls')
    .update(payload)
    .eq('id', repl.id)
    .select(`*, user:public_profiles(*)`)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
    .single()
}

/**
 * Delete a repl by id
 */
export async function deleteRepl(
  id: string,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  return await supabase
    .from('repls')
    .delete()
    .eq('id', id)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
}
