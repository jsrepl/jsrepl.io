<script setup lang="ts">
import { cn } from '@/utils/cn'
import type { HTMLAttributes } from 'vue'
import { type SelectVariants, selectVariants } from '.'

interface Props {
  variant?: SelectVariants['variant']
  size?: SelectVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  class: '',
})

const model = defineModel<string>()
</script>

<template>
  <select v-model="model" :class="cn(selectVariants({ variant, size }), props.class)">
    <slot />
  </select>
</template>
