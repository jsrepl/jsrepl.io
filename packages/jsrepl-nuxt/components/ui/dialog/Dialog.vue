<script setup lang="ts">
import { cn } from '@/utils/cn'
import { LucideX } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'
import { ref, watchEffect } from 'vue'
import { type DialogVariants, dialogVariants } from '.'

interface Props {
  variant?: DialogVariants['variant']
  size?: DialogVariants['size']
  class?: HTMLAttributes['class']
  title?: string
  closeButton?: boolean
  backdropClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  class: '',
  title: '',
  closeButton: false,
  backdropClose: false,
})

const dialogRef = ref<HTMLDialogElement | null>(null)

defineExpose({
  ref: dialogRef,
  showModal(...args: Parameters<HTMLDialogElement['showModal']>) {
    dialogRef.value?.showModal(...args)
  },
  show(...args: Parameters<HTMLDialogElement['show']>) {
    dialogRef.value?.show(...args)
  },
  close(...args: Parameters<HTMLDialogElement['close']>) {
    dialogRef.value?.close(...args)
  },
})

watchEffect((onCleanup) => {
  const dialog = dialogRef.value
  if (!props.backdropClose || !dialog) {
    return
  }

  dialog.addEventListener('click', closeOnBackdropClick)

  onCleanup(() => {
    dialog.removeEventListener('click', closeOnBackdropClick)
  })
})

function closeOnBackdropClick(event: MouseEvent) {
  const dialog = dialogRef.value
  if (!dialog || event.target !== dialog) {
    return
  }

  const rect = dialog.getBoundingClientRect()
  const isInDialog =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom

  if (!isInDialog) {
    close()
  }
}

function close() {
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialogRef" :class="cn(dialogVariants({ variant, size }), props.class)">
    <h1 v-if="title" class="-mt-8 mb-4 text-center text-lg font-medium">
      {{ title }}
    </h1>

    <Button
      v-if="closeButton"
      variant="none"
      size="none"
      autofocus
      aria-label="Close dialog"
      class="text-secondary-foreground absolute right-2 top-2 *:opacity-30 *:hover:opacity-80"
      @click="close"
    >
      <LucideX :size="24" />
    </Button>

    <slot />
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(1px);
}
</style>
