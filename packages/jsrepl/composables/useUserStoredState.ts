import { PreviewPosition, Theme, type UserStoredState } from '@/types/repl.types'

export function useUserStoredState(): [Ref<UserStoredState>, () => void, () => void] {
  const localState: Ref<UserStoredState> = ref(getDefaultState())

  const themeCookie = useCookie<Theme | null | undefined>('theme', {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 400),
    sameSite: 'lax',
  })

  return [
    localState,
    () => {
      localState.value = load()
    },
    () => save(localState.value),
  ]

  function load(): UserStoredState {
    let deserialized: Omit<UserStoredState, 'theme'> | null = null

    try {
      const serialized = import.meta.server ? null : localStorage.getItem('state')
      deserialized = serialized ? deserialize(serialized) : null
    } catch (e) {
      console.error('repl :: user state load error', e)
    }

    const state: UserStoredState = {
      ...getDefaultState(),
      ...deserialized,
    }

    state.theme = themeCookie.value || state.theme

    return state
  }

  function save(state: UserStoredState): void {
    try {
      const { theme, ...localStorageState } = state
      const serialized = serialize(localStorageState)
      localStorage.setItem('state', serialized)
      themeCookie.value = theme
    } catch (e) {
      console.error('repl :: user state save error', e)
    }
  }
}

function deserialize(serialized: string): Omit<UserStoredState, 'theme'> {
  return JSON.parse(serialized)
}

function serialize(storedState: Omit<UserStoredState, 'theme'>): string {
  return JSON.stringify(storedState)
}

function getDefaultState(): UserStoredState {
  return {
    theme: Theme.DarkPlus,
    previewPos: PreviewPosition.FloatBottomRight,
    version: undefined,
  }
}
