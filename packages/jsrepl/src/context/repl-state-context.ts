import { createContext } from 'react'
import { SetReplStoredState } from '@/hooks/useReplStoredState'
import { ReplStoredState } from '@/types'

export type ReplStateContextType = {
  replState: ReplStoredState
  setReplState: SetReplStoredState
  saveReplState: (immediate?: boolean) => void
}

export const ReplStateContext = createContext<ReplStateContextType | null>(null)
