<template>
  <div ref="elRef" :style="{ width: `${model.width}px`, height: `${model.height}px` }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { Interactable } from '@interactjs/core/Interactable'

const model = defineModel<{ width: number; height: number }>({ required: true })

const props = defineProps<{
  left?: boolean
  right?: boolean
  top?: boolean
  bottom?: boolean
}>()

const elRef = ref<HTMLDivElement | null>(null)
const [interact, loadInteract] = useInteract()

onMounted(() => {
  setTimeout(() => {
    loadInteract()
  }, 1000)
})

watchEffect((onCleanup) => {
  if (!interact.value) {
    return
  }

  if (!elRef.value) {
    return
  }

  const interactable = setupResizable(interact.value, elRef.value)

  onCleanup(() => {
    interactable?.unset()
  })
})

function setupResizable(
  interact: typeof import('interactjs').default,
  el: HTMLDivElement
): Interactable {
  const interactable = interact(el)
    .resizable({
      edges: { left: props.left, right: props.right, bottom: props.bottom, top: props.top },
      listeners: {
        move(event) {
          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
          })
        },
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'main',
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 200, height: 100 },
        }),
      ],
    })
    .on('resizestart', (event) => {
      event.target.style.pointerEvents = 'none'
    })
    .on('resizeend', (event) => {
      event.target.style.pointerEvents = ''
      model.value = { width: event.rect.width, height: event.rect.height }
    })

  return interactable
}
</script>
