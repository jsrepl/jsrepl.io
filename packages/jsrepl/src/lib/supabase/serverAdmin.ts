import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export function createServerAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      // https://github.com/orgs/supabase/discussions/15860
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
