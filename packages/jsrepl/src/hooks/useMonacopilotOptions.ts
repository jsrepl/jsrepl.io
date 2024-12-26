import { useMemo } from 'react'
import { useUserStoredState } from './useUserStoredState'

export default function useMonacopilotOptions() {
  const [userState] = useUserStoredState()

  const isEnabled = useMemo<boolean>(() => {
    return !!userState.copilot.apiKey && !!userState.copilot.provider && !!userState.copilot.model
  }, [userState.copilot.apiKey, userState.copilot.provider, userState.copilot.model])

  return {
    isEnabled,
    ...userState.copilot,
  }
}
