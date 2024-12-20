import { Dispatch, ReactNode, SetStateAction, createContext, useState } from 'react'
import { useReplSavedState } from '@/hooks/useReplSavedState'
import { ReplStoredState } from '@/types'

export type ReplStateContextType = {
  state: ReplStoredState
  setState: Dispatch<SetStateAction<ReplStoredState>>
}

export const ReplStateContext = createContext<ReplStateContextType | null>(null)

export default function ReplStateProvider({ children }: { children: ReactNode }) {
  const [savedState] = useReplSavedState()
  const [state, setState] = useState<ReplStoredState>(savedState)

  return (
    <ReplStateContext.Provider value={{ state, setState }}>{children}</ReplStateContext.Provider>
  )
}
