import { Dispatch, SetStateAction, createContext } from 'react'
import type { ReplInfo } from '@/types'

export type ReplInfoContextType = {
  replInfo: ReplInfo | null
  setReplInfo: Dispatch<SetStateAction<ReplInfo | null>>
}

export const ReplInfoContext = createContext<ReplInfoContextType | null>(null)
