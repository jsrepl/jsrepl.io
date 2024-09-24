import { useCallback, useMemo, useState } from 'react'
import { type UserStoredState } from '@/types'

export function useReplPreviewSize({
  userState,
}: {
  userState: UserStoredState
}): [{ width: number; height: number }, (value: { width: number; height: number }) => void] {
  const [floatSize, setFloatSize] = useState({ width: 350, height: 180 })
  const [asideSize, setAsideSize] = useState({ width: 350, height: 0 })
  const position = userState.previewPos

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
          break
        case 'aside-right':
          setAsideSize(value)
          setFloatSize((prev) => ({ ...prev, width: value.width }))
          break
      }
    },
    [position]
  )

  return [size, setSize]
}
