import { createContext } from 'react'
import { ReplPayload } from '@jsrepl/shared-types'

export type ReplPayloadsContextType = {
  payloads: ReplPayload[]
  addPayload: (token: number | string, payload: ReplPayload) => void
  refreshPayloads: (token: number | string) => void
}

export const ReplPayloadsContext = createContext<ReplPayloadsContextType | null>(null)
