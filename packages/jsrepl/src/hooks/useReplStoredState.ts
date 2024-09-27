import { type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import debounce from 'debounce'
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

  // useEffect(() => {
  //   console.log('LOAD EFFECT')

  //   const loadedState = load(searchParams)
  //   _setState(loadedState)
  //   stateRef.current = loadedState
  // }, [searchParams])

  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        save(stateRef.current, router)
      }, 500),
    [router]
  )

  const setState = useCallback(
    (
      value: SetStateAction<ReplStoredState>,
      { saveImmediate = false }: { saveImmediate?: boolean } = {}
    ) => {
      _setState(value)
      _setState((value) => {
        stateRef.current = value
        debouncedSave()

        if (saveImmediate) {
          debouncedSave.flush()
        }

        return value
      })
    },
    [debouncedSave]
  )

  useEffect(() => {
    return () => {
      debouncedSave.flush()
    }
  }, [debouncedSave])

  useEffect(() => {
    const onWindowBeforeUnload = () => {
      debouncedSave.flush()
    }

    window.addEventListener('beforeunload', onWindowBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onWindowBeforeUnload)
    }
  }, [debouncedSave])

  const saveState = useCallback(
    (immediate = false) => {
      debouncedSave()

      if (immediate) {
        debouncedSave.flush()
      }
    },
    [debouncedSave]
  )

  return [state, setState, saveState]
}
