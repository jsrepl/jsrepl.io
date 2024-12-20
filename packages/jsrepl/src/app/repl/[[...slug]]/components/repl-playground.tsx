'use client'

import React, { lazy, useEffect, useState } from 'react'
import { usePrefetchQuery } from '@tanstack/react-query'
import { replQueryKey, useReplParams } from '@/hooks/useReplParams'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { loadRepl } from '@/lib/repl-stored-state/load-repl'
import ReplMetadata from './repl-metadata'

const isClient = () => typeof window !== `undefined`

const ReplPlaygroundBrowser = lazy(() => import('./repl-playground-browser'))

export default function ReplPlayground() {
  const replParams = useReplParams()
  const supabase = useSupabaseClient()
  const [key, setKey] = useState(0)

  function remount() {
    setKey((k) => k + 1)
  }

  usePrefetchQuery({
    queryKey: replQueryKey(replParams),
    queryFn: ({ signal }) => loadRepl(replParams, { supabase, signal }),
    staleTime: 60_000,
  })

  // HACK: see comment in useReplParams.ts
  // Due to "shallow" routing on save/fork, the page is not remounted when the url is updated with
  // pushState/replaceState, but it is desired behavior when a repl id changes on back/forward
  // (it is better to not preserve the editor state in this case).
  useEffect(() => {
    const handler = () => {
      const isReplRoute = location.pathname.startsWith('/repl')
      if (isReplRoute) {
        remount()
      }
    }

    window.addEventListener('popstate', handler)

    return () => {
      window.removeEventListener('popstate', handler)
    }
  }, [])

  return (
    <>
      {isClient() && <ReplPlaygroundBrowser key={key} />}
      <ReplMetadata />
    </>
  )
}
