import { Dispatch, type SetStateAction, createContext, useState } from 'react'
import { ReplInfo } from '@/types'

export type ReplInfoContextType = {
  replInfo: ReplInfo | null
  setReplInfo: Dispatch<SetStateAction<ReplInfo | null>>
}

export const ReplInfoContext = createContext<ReplInfoContextType | null>(null)

export default function ReplInfoProvider({ children }: { children: React.ReactNode }) {
  const [replInfo, setReplInfo] = useState<ReplInfo | null>(null)

  return (
    <ReplInfoContext.Provider value={{ replInfo, setReplInfo }}>
      {children}
    </ReplInfoContext.Provider>
  )
}
