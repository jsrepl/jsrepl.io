import { useContext } from 'react'
import { SessionContext } from '@/components/providers/session-provider'

export function useUser() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error(`useUser must be used within a SessionContextProvider.`)
  }

  return context.session?.user ?? null
}
