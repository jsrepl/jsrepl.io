import {
  Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import debounce from 'debounce'
import { load, save } from '@/lib/user-stored-state'
import type { UserStoredState } from '@/types/repl.types'

export function useUserStoredState(): [UserStoredState, Dispatch<SetStateAction<UserStoredState>>] {
  const [state, _setState] = useState<UserStoredState>(() => load(localStorage))
  const stateRef = useRef(state)

  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        save(stateRef.current, localStorage)
      }, 500),
    []
  )

  const setState = useCallback(
    (value: SetStateAction<UserStoredState>) => {
      _setState(value)
      _setState((value) => {
        stateRef.current = value
        debouncedSave()
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

  return [state, setState]
}
