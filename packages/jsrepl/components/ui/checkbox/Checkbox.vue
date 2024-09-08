<script setup lang="ts">
import { cn } from '@/utils/cn'
import type { HTMLAttributes } from 'vue'
import { type CheckboxVariants, checkboxVariants } from '.'

interface Props {
  variant?: CheckboxVariants['variant']
  size?: CheckboxVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  class: '',
})

const model = defineModel<boolean>()
</script>

<template>
  <input
    v-model="model"
    :class="cn(checkboxVariants({ variant, size }), props.class)"
    type="checkbox"
  />
</template>
