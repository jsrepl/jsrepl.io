import {
  Dispatch,
  type SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import debounce, { DebouncedFunction } from 'debounce'
import { load, save } from '@/lib/user-stored-state'
import { UserStoredState } from '@/types'

export type UserStateContextType = {
  state: UserStoredState
  setState: Dispatch<SetStateAction<UserStoredState>>
}

export const UserStateContext = createContext<UserStateContextType | null>(null)

export default function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [state, _setState] = useState<UserStoredState>(() => load(localStorage))
  const stateRef = useRef(state)
  const debouncedSave = useRef<DebouncedFunction<() => void>>(undefined)

  const setState = useCallback((value: SetStateAction<UserStoredState>) => {
    _setState(value)
    _setState((value) => {
      stateRef.current = value
      debouncedSave.current?.()
      return value
    })
  }, [])

  useEffect(() => {
    const debounced = debounce(() => {
      save(stateRef.current, localStorage)
    }, 500)

    debouncedSave.current = debounced

    return () => {
      debounced.clear()
    }
  }, [])

  useEffect(() => {
    const onWindowBeforeUnload = () => {
      debouncedSave.current?.flush()
    }

    window.addEventListener('beforeunload', onWindowBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onWindowBeforeUnload)
    }
  }, [])

  return (
    <UserStateContext.Provider value={{ state, setState }}>{children}</UserStateContext.Provider>
  )
}
