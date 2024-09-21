import { type ShallowRef, shallowRef } from 'vue'

const interact: ShallowRef<typeof import('interactjs').default | null> = shallowRef(null)

export function useInteract(): [typeof interact, typeof loadInteract] {
  return [interact, loadInteract]
}

async function loadInteract(): Promise<void> {
  interact.value = interact.value ?? (await import('interactjs')).default
}
