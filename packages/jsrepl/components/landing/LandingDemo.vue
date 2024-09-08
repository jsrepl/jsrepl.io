<template>
  <div class="flex items-start gap-x-2 gap-y-4 max-lg:flex-col">
    <div class="flex flex-shrink-0 flex-col gap-3 text-gray-400 lg:w-1/3 lg:p-6">
      <h2 class="text-2xl font-semibold text-white/85"><slot name="title" /></h2>
      <slot name="text" />
      <p v-if="replLink">
        <a :href="replLink" target="_blank" class="underline underline-offset-4">Try it yourself</a>
      </p>
    </div>
    <slot name="media" :video-props="videoProps" :img-props="imgProps" />
  </div>
</template>

<script setup lang="ts">
import type { ImgHTMLAttributes, VideoHTMLAttributes } from 'vue'

defineProps<{
  replLink?: string
}>()

const videoProps = {
  width: '840',
  height: '420',
  autoplay: true,
  muted: true,
  loop: true,
  class: 'min-w-0 flex-1 rounded-md border border-border shadow-xl',
} as VideoHTMLAttributes

const imgProps = {
  width: '840',
  height: '420',
  class: 'min-w-0 flex-1 rounded-md border border-border shadow-xl',
  loading: 'lazy',
} as ImgHTMLAttributes
</script>
