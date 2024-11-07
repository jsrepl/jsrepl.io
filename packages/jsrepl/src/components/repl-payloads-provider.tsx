import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReplPayload } from '@jsrepl/shared-types'
import debounce, { DebouncedFunction } from 'debounce'
import { ReplPayloadsContext, ReplPayloadsContextType } from '@/context/repl-payloads-context'

export default function ReplPayloadsProvider({ children }: { children: React.ReactNode }) {
  const _payloads = useRef<ReplPayload[]>([])
  const lastToken = useRef<number | string | null>(null)
  const [payloads, setPayloads] = useState<ReplPayload[]>([])
  const debouncedUpdatePayloads = useRef<DebouncedFunction<() => void>>()

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

  const contextValue = useMemo<ReplPayloadsContextType>(
    () => ({
      payloads,
      addPayload,
      refreshPayloads,
    }),
    [payloads, addPayload, refreshPayloads]
  )

  return (
    <ReplPayloadsContext.Provider value={contextValue}>{children}</ReplPayloadsContext.Provider>
  )
}
