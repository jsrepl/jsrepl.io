<template>
  <div
    class="mx-auto flex items-start justify-evenly gap-x-8 gap-y-16 px-4 pt-12 max-sm:flex-col-reverse"
  >
    <div>
      <NuxtLink
        :to="{ hash: '', replace: true }"
        class="relative mb-2 inline-block before:absolute before:-left-8 before:text-4xl before:opacity-30 hover:underline hover:before:content-['#']"
      >
        <h1 class="text-4xl font-bold">Release Notes</h1>
      </NuxtLink>

      <div class="space-y-16">
        <article v-for="release in releases" :id="release.title" :key="release._id" class="py-8">
          <NuxtLink
            :to="{ hash: '#' + release.title, replace: true }"
            class="relative before:absolute before:-left-4 before:opacity-30 hover:underline hover:before:content-['#']"
          >
            <time class="opacity-50">{{ new Date(release.date).toDateString() }}</time>
          </NuxtLink>
          <ContentRenderer :value="release" class="prose prose-slate dark:prose-invert" />
        </article>
      </div>
    </div>

    <nav class="top-16 sm:sticky sm:pr-[10%]">
      <ul class="space-y-1 whitespace-nowrap text-gray-500">
        <li key="-">
          <NuxtLink
            :to="{ hash: '', replace: true }"
            class="px-1 py-0.5 font-mono text-slate-400 hover:text-foreground"
            >Release Notes</NuxtLink
          >
        </li>

        <li v-for="release in releases" :key="release._id">
          <NuxtLink
            :to="{ hash: '#' + release.title, replace: true }"
            class="px-1 py-0.5 font-mono text-slate-400 hover:text-foreground"
            >{{ release.title }}</NuxtLink
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Release Notes',
})

const releases = await queryContent('releases').sort({ date: -1 }).find()
</script>
