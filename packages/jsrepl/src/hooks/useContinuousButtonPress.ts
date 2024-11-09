import { useCallback, useEffect, useRef } from 'react'

export function useContinuousButtonPress(callback: () => void, delay = 1000, interval = 100) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>()
  const callbackRef = useRef<typeof callback>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const onMouseDown = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = setInterval(() => {
        callbackRef.current()
      }, interval)
    }, delay)
  }, [delay, interval])

  const onMouseUp = useCallback(() => {
    clearTimeout(timeoutRef.current)
    clearInterval(timeoutRef.current)
  }, [])

  return { onMouseDown, onMouseUp }
}
