import { Dispatch, SetStateAction, createContext } from 'react'

export type ReplRewindMode = {
  active: boolean
  currentPayloadId: string | null
}

export type ReplRewindModeContextType = {
  rewindMode: ReplRewindMode
  setRewindMode: Dispatch<SetStateAction<ReplRewindMode>>
}

export const ReplRewindModeContext = createContext<ReplRewindModeContextType | null>(null)
