import React, { Dispatch, SetStateAction, createContext, useState } from 'react'

export type ReplRewindMode = {
  active: boolean
  currentPayloadId: string | null
}

export type ReplRewindModeContextType = {
  rewindMode: ReplRewindMode
  setRewindMode: Dispatch<SetStateAction<ReplRewindMode>>
}

export const ReplRewindModeContext = createContext<ReplRewindModeContextType | null>(null)

export default function ReplRewindModeProvider({ children }: { children: React.ReactNode }) {
  const [rewindMode, setRewindMode] = useState<ReplRewindMode>({
    active: false,
    currentPayloadId: null,
  })

  return (
    <ReplRewindModeContext.Provider value={{ rewindMode, setRewindMode }}>
      {children}
    </ReplRewindModeContext.Provider>
  )
}
