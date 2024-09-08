<template>
  <footer
    class="border-border flex flex-wrap items-center gap-x-28 gap-y-10 border-t p-8 text-gray-300"
  >
    <div>
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-lg font-light tracking-wide">
        <Logo width="1.5rem" height="1.5rem" />
        <span class="tracking-wide">JSREPL</span>
      </NuxtLink>

      <div class="text-sm text-gray-400">Copyright © 2024 Aleksei Nagovitsyn</div>

      <div class="mt-1 text-sm italic text-gray-400">Code, Play, Ship it.</div>
    </div>

    <div class="flex flex-wrap gap-8 [&_a]:underline-offset-4 hover:[&_a]:underline">
      <a href="https://github.com/jsrepl/jsrepl.io" target="_blank"
        >GitHub<LucideArrowUpRight :size="16" class="ml-1 inline-block opacity-30" />
      </a>

      <a href="https://github.com/jsrepl/jsrepl.io/issues" target="_blank"
        >Issues<LucideArrowUpRight :size="16" class="ml-1 inline-block opacity-30" />
      </a>

      <NuxtLink to="/releases">Changelog</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
      <NuxtLink to="/terms">Terms of Service</NuxtLink>
      <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { LucideArrowUpRight } from 'lucide-vue-next'
</script>
