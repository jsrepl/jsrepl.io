import { type SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import debounce, { DebouncedFunction } from 'debounce'
import { load, save } from '@/lib/repl-stored-state'
import type { ReplStoredState } from '@/types/repl.types'

export type SetReplStoredState = (
  value: SetStateAction<ReplStoredState>,
  options?: { saveImmediate?: boolean }
) => void

export function useReplStoredState(): [
  ReplStoredState,
  SetReplStoredState,
  (immediate?: boolean) => void,
] {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, _setState] = useState<ReplStoredState>(() => load(searchParams))
  const stateRef = useRef(state)
  const debouncedSave = useRef<DebouncedFunction<() => void>>()

  const setState = useCallback(
    (
      value: SetStateAction<ReplStoredState>,
      { saveImmediate = false }: { saveImmediate?: boolean } = {}
    ) => {
      _setState(value)
      _setState((value) => {
        stateRef.current = value
        debouncedSave.current?.()

        if (saveImmediate) {
          debouncedSave.current?.flush()
        }

        return value
      })
    },
    []
  )

  const saveState = useCallback((immediate = false) => {
    debouncedSave.current?.()

    if (immediate) {
      debouncedSave.current?.flush()
    }
  }, [])

  useEffect(() => {
    const debounced = debounce(() => {
      save(stateRef.current, router)
    }, 500)

    debouncedSave.current = debounced

    return () => {
      debounced.clear()
    }
  }, [router])

  useEffect(() => {
    const onWindowBeforeUnload = () => {
      debouncedSave.current?.flush()
    }

    window.addEventListener('beforeunload', onWindowBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onWindowBeforeUnload)
    }
  }, [])

  return [state, setState, saveState]
}
