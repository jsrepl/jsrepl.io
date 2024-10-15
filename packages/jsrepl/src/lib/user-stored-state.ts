import { PreviewPosition, UserStoredState } from '@/types'

export function load(storage: Storage): UserStoredState {
  let deserialized: UserStoredState | null = null

  try {
    const serialized = storage.getItem('state')
    deserialized = serialized ? deserialize(serialized) : null
  } catch (e) {
    console.error('repl :: user state load error', e)
  }

  const state: UserStoredState = {
    ...getDefaultState(),
    ...deserialized,
  }

  return state
}

export function save(state: UserStoredState, storage: Storage): void {
  try {
    const serialized = serialize(state)
    storage.setItem('state', serialized)
  } catch (e) {
    console.error('repl :: user state save error', e)
  }
}

function deserialize(serialized: string): UserStoredState {
  return JSON.parse(serialized)
}

function serialize(storedState: UserStoredState): string {
  return JSON.stringify(storedState)
}

function getDefaultState(): UserStoredState {
  return {
    previewPos: PreviewPosition.FloatBottomRight,
    showLeftSidebar: true,
    version: undefined,
    leftSidebarWidth: 200,
  }
}
