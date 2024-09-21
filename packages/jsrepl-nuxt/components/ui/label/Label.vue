<script setup lang="ts">
import { cn } from '@/utils/cn'
import type { HTMLAttributes } from 'vue'
import { type LabelVariants, labelVariants } from '.'

interface Props {
  variant?: LabelVariants['variant']
  size?: LabelVariants['size']
  col?: boolean | undefined
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  col: false,
  class: '',
})
</script>

<template>
  <label :class="cn(labelVariants({ variant, size, col }), props.class)">
    <slot />
  </label>
</template>
