import { useCallback } from 'react'
import { useReplRewindMode } from './useReplRewindMode'
import { useReplStoredState } from './useReplStoredState'

export type UseReplPreviewShown = {
  previewEnabled: boolean
  previewShown: boolean
  setPreviewShown: (value: boolean | ((prevState: boolean) => boolean)) => void
}

export function useReplPreviewShown(): UseReplPreviewShown {
  const [replState, setReplState] = useReplStoredState()
  const [rewindMode] = useReplRewindMode()

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
