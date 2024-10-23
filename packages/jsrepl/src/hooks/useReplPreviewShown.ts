import { type Dispatch, type SetStateAction, useCallback } from 'react'
import { type ReplStoredState } from '@/types'

export function useReplPreviewShown({
  replState,
  setReplState,
}: {
  replState: ReplStoredState
  setReplState: Dispatch<SetStateAction<ReplStoredState>>
}): [boolean, (force?: boolean) => void] {
  const shown = replState.showPreview

  const toggle = useCallback(
    (force?: boolean) => {
      if (typeof force === 'boolean' && shown === force) {
        return
      }

      setReplState((prev) => ({
        ...prev,
        showPreview: typeof force === 'boolean' ? force : !shown,
      }))
    },
    [shown, setReplState]
  )

  return [shown, toggle]
}
