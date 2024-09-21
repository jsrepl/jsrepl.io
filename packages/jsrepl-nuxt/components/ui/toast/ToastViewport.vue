<script setup lang="ts">
import { cn } from '@/utils/cn'
import { ToastViewport, type ToastViewportProps } from 'radix-vue'
import { type HTMLAttributes, computed } from 'vue'

const props = defineProps<ToastViewportProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <ToastViewport
    v-bind="delegatedProps"
    :class="
      cn(
        'fixed bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:left-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        props.class
      )
    "
  />
</template>
