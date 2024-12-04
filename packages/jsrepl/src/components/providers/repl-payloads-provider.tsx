import React, { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { ReplPayload } from '@jsrepl/shared-types'
import debounce, { DebouncedFunction } from 'debounce'

export type ReplPayloadsContextType = {
  payloads: ReplPayload[]
  addPayload: (token: number | string, payload: ReplPayload) => void
  refreshPayloads: (token: number | string) => void
}

export const ReplPayloadsContext = createContext<ReplPayloadsContextType | null>(null)

export default function ReplPayloadsProvider({ children }: { children: React.ReactNode }) {
  const _payloads = useRef<ReplPayload[]>([])
  const lastToken = useRef<number | string | null>(null)
  const [payloads, setPayloads] = useState<ReplPayload[]>([])
  const debouncedUpdatePayloads = useRef<DebouncedFunction<() => void>>(undefined)

  useEffect(() => {
    const debounced = debounce(() => {
      setPayloads(_payloads.current.slice())
    }, 1)

    debouncedUpdatePayloads.current = debounced

    return () => {
      debounced.clear()
    }
  }, [])

  const addPayload = useCallback((token: number | string, payload: ReplPayload) => {
    if (token !== lastToken.current) {
      lastToken.current = token
      _payloads.current = []
    }

    _payloads.current.push(payload)

    debouncedUpdatePayloads.current!()
  }, [])

  const refreshPayloads = useCallback((token: number | string) => {
    if (token !== lastToken.current) {
      lastToken.current = token
      _payloads.current = []
    }

    debouncedUpdatePayloads.current!()
  }, [])

  return (
    <ReplPayloadsContext.Provider value={{ payloads, addPayload, refreshPayloads }}>
      {children}
    </ReplPayloadsContext.Provider>
  )
}
