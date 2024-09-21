<script setup lang="ts">
definePageMeta({
  layout: 'custom',
})

const user = useSupabaseUser()

// Get redirect path from cookies
const cookieName = useRuntimeConfig().public.supabase.cookieName
const redirectPath = useCookie(`${cookieName}-redirect-path`).value

let resolve: (value?: unknown) => void
const promise = new Promise((r) => {
  resolve = r
})

watch(
  user,
  async () => {
    if (user.value) {
      // Clear cookie
      useCookie(`${cookieName}-redirect-path`).value = null

      const next = useRoute().query.next
      if (typeof next === 'string' && next.length > 0) {
        await navigateTo(next, { replace: true })
        nextTick(() => resolve())
        return
      }

      await navigateTo(redirectPath || '/', { replace: true })
      nextTick(() => resolve())
      return
    }
  },
  { immediate: true }
)

await Promise.race([promise, new Promise((r) => setTimeout(r, 3000))])
</script>

<template>
  <div class="p-4">Waiting for login...</div>
</template>
