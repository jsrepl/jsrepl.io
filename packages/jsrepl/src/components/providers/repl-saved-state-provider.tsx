import { Dispatch, ReactNode, SetStateAction, createContext, useState } from 'react'
import { useReplLoadedState } from '@/hooks/useReplLoadedState'
import { ReplStoredState } from '@/types'

export type ReplSavedStateContextType = {
  state: ReplStoredState
  setState: Dispatch<SetStateAction<ReplStoredState>>
}

export const ReplSavedStateContext = createContext<ReplSavedStateContextType | null>(null)

export default function ReplSavedStateProvider({ children }: { children: ReactNode }) {
  const loadedState = useReplLoadedState()
  const [state, setState] = useState<ReplStoredState>(loadedState)

  return (
    <ReplSavedStateContext.Provider value={{ state, setState }}>
      {children}
    </ReplSavedStateContext.Provider>
  )
}
