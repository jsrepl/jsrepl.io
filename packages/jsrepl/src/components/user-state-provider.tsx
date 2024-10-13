import React, { useMemo } from 'react'
import { UserStateContext, UserStateContextType } from '@/context/user-state-context'
import { useUserStoredState } from '@/hooks/useUserStoredState'

export default function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [userState, setUserState] = useUserStoredState()

  const contextValue = useMemo<UserStateContextType>(
    () => ({ userState, setUserState }),
    [userState, setUserState]
  )

  return <UserStateContext.Provider value={contextValue}>{children}</UserStateContext.Provider>
}
