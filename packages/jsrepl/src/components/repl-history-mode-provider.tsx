import React, { useMemo, useState } from 'react'
import {
  ReplHistoryMode,
  ReplHistoryModeContext,
  ReplHistoryModeContextType,
} from '@/context/repl-history-mode-context'

export default function ReplHistoryModeProvider({ children }: { children: React.ReactNode }) {
  const [historyMode, setHistoryMode] = useState<ReplHistoryMode | null>(null)

  const contextValue = useMemo<ReplHistoryModeContextType>(
    () => ({ historyMode, setHistoryMode }),
    [historyMode, setHistoryMode]
  )

  return (
    <ReplHistoryModeContext.Provider value={contextValue}>
      {children}
    </ReplHistoryModeContext.Provider>
  )
}
