<template>
  <header
    class="bg-background/90 md:header-sticky-stuck relative z-[1] backdrop-blur-sm md:sticky md:top-0"
  >
    <div class="container flex items-center gap-2 py-3 leading-10">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-lg font-light leading-10 tracking-wide"
      >
        <Logo width="1.5rem" height="1.5rem" />
        <span class="tracking-wide text-stone-200">JSREPL</span>
      </NuxtLink>

      <div
        class="text-secondary-foreground/80 ml-auto flex items-center text-sm font-medium leading-10 [&_a]:px-3 [&_a]:underline-offset-4 hover:[&_a]:underline"
      >
        <NuxtLink to="/releases" class="">Changelog</NuxtLink>

        <div class="border-border mx-2 h-5 border-l" />

        <NuxtLink to="/repl" class="text-primary inline-flex items-center text-nowrap">
          <LucidePlus :size="18" class="mr-1" />New REPL
        </NuxtLink>

        <div class="border-border mx-2 h-5 border-l" />

        <NuxtLink
          to="https://github.com/jsrepl/jsrepl.io"
          target="_blank"
          class="text-secondary-foreground/70 hover:text-secondary-foreground/90 inline-flex h-10 w-10 items-center justify-center !p-0"
          aria-label="GitHub"
        >
          <Icon name="simple-icons:github" size="20" />
        </NuxtLink>
      </div>

      <!--
      <div class="ml-auto">
        <LoginOAuthButton v-if="!user" variant="link" size="sm" provider="github" />
        <LogoutButton v-if="user" variant="link" size="sm" />
      </div>
      -->
    </div>
  </header>
</template>

<script setup lang="ts">
import { LucidePlus } from 'lucide-vue-next'

//const user = useSupabaseUser()
</script>
