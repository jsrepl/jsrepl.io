<template>
  <div class="flex flex-col gap-2">
    <span class="my-2 self-center font-medium"
      >To share, simply copy the current URL from the address bar:</span
    >

    <input
      ref="inputRef"
      :value="sharableUrl"
      readonly
      class="h-8 w-full flex-1 rounded border bg-muted px-1 leading-8 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @focus="(e) => (e.target as HTMLInputElement | null)?.select()"
    />

    <Button size="sm" @click="copyUrl">
      <template v-if="copied">
        <LucideClipboardCheck :size="18" class="mr-1" />
        Copied!
      </template>
      <template v-else>
        <LucideClipboardCopy :size="18" class="mr-1" />
        Copy URL to clipboard
      </template>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { LucideClipboardCheck, LucideClipboardCopy } from 'lucide-vue-next'

const inputRef = ref<HTMLInputElement | null>(null)
const copied = ref(false)
let copiedTimeoutId: NodeJS.Timeout | undefined

const props = defineProps<{
  sharableUrl: string
}>()

async function copyUrl() {
  await navigator.clipboard.writeText(props.sharableUrl)
  copied.value = true

  clearTimeout(copiedTimeoutId)
  copiedTimeoutId = setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
