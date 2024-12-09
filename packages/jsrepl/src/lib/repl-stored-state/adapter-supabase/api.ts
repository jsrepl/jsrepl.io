import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js'
import { ReplAliases } from '@/lib/repl-stored-state/aliases'
import { Database, ReplStoredState } from '@/types'

/**
 * Get a repl by id
 */
export async function getRepl(
  id: string,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  if (Object.values(ReplAliases).includes(id as ReplAliases)) {
    const state = await getAliasRepl(id as ReplAliases)
    return {
      data: state,
      error: null,
      status: 200,
      statusText: 'OK',
      count: 1,
    } as PostgrestSingleResponse<ReplStoredState>
  }

  return await supabase
    .from('repls')
    .select(`*, user:public_profiles(*)`)
    .eq('id', id)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
    .maybeSingle()
}

/**
 * Get all repls for a user
 */
export async function getUserRepls(
  userId: string,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  return await supabase
    .from('repls')
    .select(`*, user:public_profiles(*)`)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
}

/**
 * Create a new repl
 */
export async function createRepl(
  repl: ReplStoredState,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  const payload = {
    fs: repl.fs,
  }

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

  const payload = {
    id: repl.id,
    fs: repl.fs,
  }

  return await supabase
    .from('repls')
    .update(payload)
    .eq('id', repl.id)
    .abortSignal(signal as AbortSignal /* undefined is fine here */)
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

async function getAliasRepl(alias: ReplAliases): Promise<ReplStoredState> {
  return import(`@/lib/repl-stored-state/aliases/${alias}`).then((module) => module.default)
}
