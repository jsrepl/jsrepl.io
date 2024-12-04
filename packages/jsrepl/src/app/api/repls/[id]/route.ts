import { ReplAliases } from '@/lib/repl-stored-state/aliases'
import { createClient } from '@/lib/supabase/server'
import { ReplStoredState } from '@/types'

const getAliasRepl = (alias: ReplAliases): Promise<ReplStoredState> => {
  return import(`@/lib/repl-stored-state/aliases/${alias}`).then((module) => module.default)
}

/**
 * Get a single repl by id
 */
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  if (Object.values(ReplAliases).includes(params.id as ReplAliases)) {
    const state = await getAliasRepl(params.id as ReplAliases)
    return Response.json(state)
  }

  const supabase = await createClient()
  const { data, error, status, statusText } = await supabase
    .from('repls')
    .select()
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return Response.json(error, { status, statusText })
  }

  if (!data) {
    return new Response(null, { status: 404, statusText: 'Not Found' })
  }

  return Response.json(data)
}

/**
 * Update a repl by id
 */
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const body = await request.json()
  const { error, status, statusText } = await supabase
    .from('repls')
    .update(body)
    .eq('id', params.id)

  if (error) {
    return Response.json(error, { status, statusText })
  }

  return new Response(null, { status, statusText })
}

/**
 * Delete a repl by id
 */
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { error, status, statusText } = await supabase.from('repls').delete().eq('id', params.id)
  if (error) {
    return Response.json(error, { status, statusText })
  }

  return new Response(null, { status, statusText })
}
