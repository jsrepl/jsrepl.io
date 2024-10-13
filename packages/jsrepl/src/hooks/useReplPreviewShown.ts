import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { type ReplStoredState } from '@/types'

export function useReplPreviewShown({
  replState,
  setReplState,
}: {
  replState: ReplStoredState
  setReplState: Dispatch<SetStateAction<ReplStoredState>>
}): [
  boolean,
  (force?: boolean) => void,
  mightBeHidden: boolean,
  onRepl: () => void,
  onReplBodyMutation: () => void,
] {
  const [mightBeHidden, setMightBeHidden] = useState(false)
  const hideTimeoutId = useRef<NodeJS.Timeout>()

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

  const onRepl = useCallback(() => {
    clearTimeout(hideTimeoutId.current)
    hideTimeoutId.current = setTimeout(() => {
      setMightBeHidden(true)
    }, 1000)
  }, [])

  const onReplBodyMutation = useCallback(() => {
    clearTimeout(hideTimeoutId.current)
    setMightBeHidden(false)
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(hideTimeoutId.current)
    }
  }, [])

  return [shown, toggle, mightBeHidden, onRepl, onReplBodyMutation]
}
