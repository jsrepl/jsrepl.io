import { useContext } from 'react'
import { ReplLoadedStateContext } from '@/components/providers/repl-loaded-state-provider'
import type { ReplStoredState } from '@/types'

export function useReplLoadedState(): ReplStoredState {
  const { state } = useContext(ReplLoadedStateContext)!
  return state
}
