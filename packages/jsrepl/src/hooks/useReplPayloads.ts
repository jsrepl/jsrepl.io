import { useContext } from 'react'
import { ReplPayloadsContext } from '@/components/providers/repl-payloads-provider'

export function useReplPayloads() {
  const { payloads, addPayload, refreshPayloads } = useContext(ReplPayloadsContext)!
  return { payloads, addPayload, refreshPayloads }
}
