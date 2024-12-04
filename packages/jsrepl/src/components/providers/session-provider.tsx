'use client'

// Based on https://github.com/supabase/auth-helpers
import React, { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react'
import { AuthError, Session, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export type SessionContextType =
  | {
      isLoading: true
      session: null
      error: null
      supabaseClient: SupabaseClient
    }
  | {
      isLoading: false
      session: Session
      error: null
      supabaseClient: SupabaseClient
    }
  | {
      isLoading: false
      session: null
      error: AuthError
      supabaseClient: SupabaseClient
    }
  | {
      isLoading: false
      session: null
      error: null
      supabaseClient: SupabaseClient
    }

export interface SessionProviderProps {
  supabaseClient?: SupabaseClient
  initialSession?: Session | null
}

export const SessionContext = createContext<SessionContextType>({
  isLoading: true,
  session: null,
  error: null,
  supabaseClient: {} as SupabaseClient,
})

export default function SessionProvider({
  supabaseClient = createClient(),
  initialSession = null,
  children,
}: PropsWithChildren<SessionProviderProps>) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession)
  const [error, setError] = useState<AuthError>()

  useEffect(() => {
    if (!session && initialSession) {
      setSession(initialSession)
    }
  }, [session, initialSession])

  useEffect(() => {
    let mounted = true

    async function getSession() {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession()

      // only update the react state if the component is still mounted
      if (mounted) {
        if (error) {
          setError(error)
          setIsLoading(false)
          return
        }

        setSession(session)
        setIsLoading(false)
      }
    }

    getSession()

    return () => {
      mounted = false
    }
  }, [supabaseClient])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')
      ) {
        setSession(session)
      }

      if (event === 'SIGNED_OUT') {
        setSession(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseClient])

  const value: SessionContextType = useMemo(() => {
    if (isLoading) {
      return {
        isLoading: true,
        session: null,
        error: null,
        supabaseClient,
      }
    }

    if (error) {
      return {
        isLoading: false,
        session: null,
        error,
        supabaseClient,
      }
    }

    return {
      isLoading: false,
      session,
      error: null,
      supabaseClient,
    }
  }, [isLoading, session, error, supabaseClient])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
