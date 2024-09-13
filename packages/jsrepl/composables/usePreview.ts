import type { ShallowRef } from 'vue'
import type CodeEditor from '~/components/CodeEditor.vue'
import { PreviewPosition, type ReplStoredState, type UserStoredState } from '~/types/repl.types'

const positionOptions = [
  { value: PreviewPosition.FloatTopRight, label: 'Floating: top right' },
  { value: PreviewPosition.FloatBottomRight, label: 'Floating: bottom right' },
  { value: PreviewPosition.AsideRight, label: 'Dock to right' },
]

export function usePreview({
  codeEditorRef,
  userStoredState,
  replStoredState,
}: {
  codeEditorRef: ShallowRef<typeof CodeEditor | null>
  userStoredState: Ref<UserStoredState>
  replStoredState: Ref<ReplStoredState>
}) {
  const mightBeHidden = ref(false)
  const floatSize = ref({ width: 350, height: 180 })
  const asideSize = ref({ width: 350, height: 0 })
  let hideTimeoutId: NodeJS.Timeout | undefined

  const shown = ref(replStoredState.value.showPreview)
  watch(shown, () => {
    replStoredState.value.showPreview = shown.value
  })

  const position = computed({
    get() {
      return userStoredState.value.previewPos
    },
    set(value) {
      userStoredState.value.previewPos = value
    },
  })

  onBeforeUnmount(() => {
    clearTimeout(hideTimeoutId)
  })

  const size = computed({
    get() {
      switch (position.value) {
        case 'float-bottom-right':
        case 'float-top-right':
          return floatSize.value
        case 'aside-right':
          return asideSize.value
        default:
          return { width: 0, height: 0 }
      }
    },
    set(value) {
      switch (position.value) {
        case 'float-bottom-right':
        case 'float-top-right':
          floatSize.value = value
          asideSize.value.width = value.width
          break
        case 'aside-right':
          asideSize.value = value
          floatSize.value.width = value.width
          break
      }
    },
  })

  function toggle(force?: boolean) {
    if (typeof force === 'boolean' && shown.value === force) {
      return
    }

    shown.value = typeof force === 'boolean' ? force : !shown.value
  }

  function onRepl() {
    clearTimeout(hideTimeoutId)

    hideTimeoutId = setTimeout(() => {
      mightBeHidden.value = true
    }, 1000)
  }

  function onReplBodyMutation() {
    clearTimeout(hideTimeoutId)
    mightBeHidden.value = false
  }

  function reload() {
    codeEditorRef.value?.restartRepl()
  }

  return {
    positionOptions,
    position,
    size,
    shown,
    mightBeHidden,
    toggle,
    onRepl,
    onReplBodyMutation,
    reload,
  }
}
