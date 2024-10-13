import React, { useMemo } from 'react'
import { ReplStateContext, ReplStateContextType } from '@/context/repl-state-context'
import { useReplStoredState } from '@/hooks/useReplStoredState'

export default function ReplStateProvider({ children }: { children: React.ReactNode }) {
  const [replState, setReplState, saveReplState] = useReplStoredState()

  const contextValue = useMemo<ReplStateContextType>(
    () => ({ replState, setReplState, saveReplState }),
    [replState, setReplState, saveReplState]
  )

  return <ReplStateContext.Provider value={contextValue}>{children}</ReplStateContext.Provider>
}
