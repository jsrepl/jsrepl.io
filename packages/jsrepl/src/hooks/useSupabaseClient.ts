import { useContext } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { SessionContext } from '@/components/providers/session-provider'

export function useSupabaseClient<
  Database = unknown,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database,
>() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error(`useSupabaseClient must be used within a SessionContextProvider.`)
  }

  return context.supabaseClient as SupabaseClient<Database, SchemaName>
}
