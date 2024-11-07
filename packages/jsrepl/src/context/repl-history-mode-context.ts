import { Dispatch, SetStateAction, createContext } from 'react'

export type ReplHistoryMode = {
  currentPayloadId: string
}

export type ReplHistoryModeContextType = {
  historyMode: ReplHistoryMode | null
  setHistoryMode: Dispatch<SetStateAction<ReplHistoryMode | null>>
}

export const ReplHistoryModeContext = createContext<ReplHistoryModeContextType | null>(null)
