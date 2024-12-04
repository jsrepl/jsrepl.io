import { Dispatch, type SetStateAction, useContext } from 'react'
import { UserStateContext } from '@/components/providers/user-state-provider'
import type { UserStoredState } from '@/types/repl.types'

export function useUserStoredState(): [UserStoredState, Dispatch<SetStateAction<UserStoredState>>] {
  const { state, setState } = useContext(UserStateContext)!
  return [state, setState]
}
