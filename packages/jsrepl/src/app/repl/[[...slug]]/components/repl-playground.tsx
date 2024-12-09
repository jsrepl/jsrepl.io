'use client'

import React, { lazy } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { usePrefetchQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { loadRepl } from '@/lib/repl-stored-state/load-repl'
import ReplMetadata from './repl-metadata'

const isClient = () => typeof window !== `undefined`

const ReplPlaygroundBrowser = lazy(() => import('./repl-playground-browser'))

export default function ReplPlayground() {
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()

  usePrefetchQuery({
    queryKey: ['repl', params, searchParams],
    queryFn: ({ signal }) => loadRepl(params, searchParams, { supabase, signal }),
    staleTime: 60_000,
  })

  return (
    <>
      {isClient() && <ReplPlaygroundBrowser />}
      <ReplMetadata />
    </>
  )
}
