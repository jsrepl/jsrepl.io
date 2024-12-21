import { useRef } from 'react'
import { useEffect } from 'react'
import { useReplSave } from '@/hooks/useReplSave'

export function useGlobalKeybindingSave() {
  const [, saveReplState] = useReplSave()
  const save = saveReplState

  const saveRef = useRef(save)

  useEffect(() => {
    saveRef.current = save
  }, [save])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        saveRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
