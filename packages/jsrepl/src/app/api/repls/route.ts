import { createClient } from '@/lib/supabase/server'

/**
 * Get all repls for the current user
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return new Response(null, { status: 401 })
  }

  const { data, error, status, statusText } = await supabase
    .from('repls')
    .select()
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return Response.json(error, { status, statusText })
  }

  return Response.json(data)
}

/**
 * Create a new repl
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  if (Array.isArray(body)) {
    return new Response(null, { status: 400 })
  }

  delete body.id

  const { data, error, status, statusText } = await supabase
    .from('repls')
    .insert(body)
    .select()
    .single()

  if (error) {
    return Response.json(error, { status, statusText })
  }

  return Response.json(data)
}
