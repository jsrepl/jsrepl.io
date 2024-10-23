import React, { useMemo, useState } from 'react'
import { ReplInfoContext, ReplInfoContextType } from '@/context/repl-info-context'
import { ReplInfo } from '@/types'

export default function ReplInfoProvider({ children }: { children: React.ReactNode }) {
  const [replInfo, setReplInfo] = useState<ReplInfo | null>(null)

  const contextValue = useMemo<ReplInfoContextType>(
    () => ({ replInfo, setReplInfo }),
    [replInfo, setReplInfo]
  )

  return <ReplInfoContext.Provider value={contextValue}>{children}</ReplInfoContext.Provider>
}
