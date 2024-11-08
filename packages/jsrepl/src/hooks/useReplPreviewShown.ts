import { useCallback, useContext } from 'react'
import { ReplRewindModeContext } from '@/context/repl-rewind-mode-context'
import { ReplStateContext } from '@/context/repl-state-context'

export type UseReplPreviewShown = {
  previewEnabled: boolean
  previewShown: boolean
  setPreviewShown: (value: boolean | ((prevState: boolean) => boolean)) => void
}

export function useReplPreviewShown(): UseReplPreviewShown {
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { rewindMode } = useContext(ReplRewindModeContext)!

  const enabled = !rewindMode.active
  const shown = enabled && replState.showPreview
  const setShown = useCallback(
    (value: boolean | ((prevState: boolean) => boolean)) => {
      setReplState((prev) => ({
        ...prev,
        showPreview: typeof value === 'function' ? value(prev.showPreview) : value,
      }))
    },
    [setReplState]
  )

  return { previewEnabled: enabled, previewShown: shown, setPreviewShown: setShown }
}
