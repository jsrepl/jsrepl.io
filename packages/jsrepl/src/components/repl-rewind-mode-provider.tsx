import React, { useMemo, useState } from 'react'
import {
  ReplRewindMode,
  ReplRewindModeContext,
  ReplRewindModeContextType,
} from '@/context/repl-rewind-mode-context'

export default function ReplRewindModeProvider({ children }: { children: React.ReactNode }) {
  const [rewindMode, setRewindMode] = useState<ReplRewindMode>({
    active: false,
    currentPayloadId: null,
  })

  const contextValue = useMemo<ReplRewindModeContextType>(
    () => ({ rewindMode, setRewindMode }),
    [rewindMode, setRewindMode]
  )

  return (
    <ReplRewindModeContext.Provider value={contextValue}>{children}</ReplRewindModeContext.Provider>
  )
}
