<template>
  <div>
    <TooltipProvider>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <Toaster />
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
import { TooltipProvider } from '@/components/ui/tooltip'
</script>
