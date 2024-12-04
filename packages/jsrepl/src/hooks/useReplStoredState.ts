import { Dispatch, SetStateAction, useContext } from 'react'
import { ReplStateContext } from '@/components/providers/repl-state-provider'
import type { ReplStoredState } from '@/types'

export function useReplStoredState(): [ReplStoredState, Dispatch<SetStateAction<ReplStoredState>>] {
  const { state, setState } = useContext(ReplStateContext)!
  return [state, setState]
}
