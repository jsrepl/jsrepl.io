import { useContext } from 'react'
import { SessionContext } from '@/components/providers/session-provider'

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error(`useSession must be used within a SessionContextProvider.`)
  }

  return context.session
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error(`useSessionContext must be used within a SessionContextProvider.`)
  }

  return context
}
