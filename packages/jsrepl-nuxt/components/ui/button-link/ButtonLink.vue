<script setup lang="ts">
import type { NuxtLinkProps } from '#app'
import { cn } from '@/utils/cn'
import { useForwardProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import {
  /*type ButtonLinkVariants,*/
  buttonLinkVariants,
} from '.'
import { type ButtonVariants, buttonVariants } from '../button'

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<NuxtLinkProps & Props>(), {
  variant: 'default',
  size: 'default',
  class: '',
})

const delegatedProps = computed(() => {
  const { variant, size, class: _, ...delegated } = props
  return delegated
})

// https://www.shadcn-vue.com/docs/contribution#boolean-props
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NuxtLink
    v-bind="forwardedProps"
    :class="cn(buttonVariants({ variant, size }), buttonLinkVariants(), props.class)"
  >
    <slot />
  </NuxtLink>
</template>
