import React, { Dispatch, SetStateAction, createContext, useState } from 'react'
import { notFound, useParams, useSearchParams } from 'next/navigation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { loadRepl } from '@/lib/repl-stored-state/load-repl'
import { ReplStoredState } from '@/types'

export type ReplStateContextType = {
  state: ReplStoredState
  setState: Dispatch<SetStateAction<ReplStoredState>>
}

export const ReplStateContext = createContext<ReplStateContextType | null>(null)

export default function ReplStateProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const searchParams = useSearchParams()
  const { data: initialState } = useSuspenseQuery({
    queryKey: ['repl', params, searchParams],
    queryFn: () => loadRepl(params, searchParams),
    staleTime: 60_000,
  })

  if (!initialState) {
    notFound()
  }

  const [state, setState] = useState<ReplStoredState>(initialState)

  return (
    <ReplStateContext.Provider value={{ state, setState }}>{children}</ReplStateContext.Provider>
  )
}
