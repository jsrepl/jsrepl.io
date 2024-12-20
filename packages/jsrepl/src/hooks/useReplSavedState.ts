import { Dispatch, SetStateAction, useContext } from 'react'
import { ReplSavedStateContext } from '@/components/providers/repl-saved-state-provider'
import type { ReplStoredState } from '@/types'

export function useReplSavedState(): [ReplStoredState, Dispatch<SetStateAction<ReplStoredState>>] {
  const { state, setState } = useContext(ReplSavedStateContext)!
  return [state, setState]
}
