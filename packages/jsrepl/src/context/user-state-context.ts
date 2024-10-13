import { Dispatch, SetStateAction, createContext } from 'react'
import { UserStoredState } from '@/types'

export type UserStateContextType = {
  userState: UserStoredState
  setUserState: Dispatch<SetStateAction<UserStoredState>>
}

export const UserStateContext = createContext<UserStateContextType | null>(null)
