import { useCallback, useMemo, useState } from 'react'
import { useUserStoredState } from '@/hooks/useUserStoredState'

export function useReplPreviewSize(): [
  { width: number; height: number },
  (value: { width: number; height: number }) => void,
] {
  const [userState, setUserState] = useUserStoredState()
  const position = userState.previewPos
  const [previewWidth, previewHeight] = userState.previewSize

  const [floatSize, setFloatSize] = useState({ width: previewWidth, height: previewHeight })
  const [asideSize, setAsideSize] = useState({ width: previewWidth, height: 0 })

  const size = useMemo(() => {
    switch (position) {
      case 'float-bottom-right':
      case 'float-top-right':
        return floatSize
      case 'aside-right':
        return asideSize
      default:
        return { width: 0, height: 0 }
    }
  }, [position, floatSize, asideSize])

  const setSize = useCallback(
    (value: { width: number; height: number }) => {
      switch (position) {
        case 'float-bottom-right':
        case 'float-top-right':
          setFloatSize(value)
          setAsideSize((prev) => ({ ...prev, width: value.width }))
          setUserState((prev) => ({ ...prev, previewSize: [value.width, value.height] }))
          break
        case 'aside-right':
          setAsideSize(value)
          setFloatSize((prev) => ({ ...prev, width: value.width }))
          setUserState((prev) => ({ ...prev, previewSize: [value.width, prev.previewSize[1]] }))
          break
      }
    },
    [position, setUserState]
  )

  return [size, setSize]
}
