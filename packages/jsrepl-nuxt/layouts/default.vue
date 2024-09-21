<template>
  <div class="flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-1">
      <slot />
    </main>
    <TheFooter class="mt-32 max-md:mt-20" />
  </div>
</template>

<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'dark',
  },
})
</script>
