<template>
  <div>
    <TheHeader />

    <div class="container my-24 max-w-3xl">
      <template v-if="error.statusCode === 404">
        <h1 class="mb-4 text-4xl font-bold">404</h1>
        <h2 class="mb-6 text-2xl">
          Woops! You are looking for "<span
            class="cursor-not-allowed underline decoration-gray-500 decoration-dashed decoration-2 underline-offset-8"
            >{{ error.url }}</span
          >", but it doesn't exist.
        </h2>
      </template>

      <template v-else>
        <h1 class="mb-4 text-4xl font-bold">Something went wrong :(</h1>
        <h2 class="mb-6 text-2xl">
          {{ error.statusCode }} {{ error.statusMessage }} - {{ error.message }}
        </h2>
      </template>

      <div class="mt-12 flex flex-wrap items-center gap-4">
        <ButtonLink size="lg" to="/">Go to the home page</ButtonLink>

        <ButtonLink
          variant="link"
          size="lg"
          to="https://github.com/jsrepl/jsrepl.io/issues"
          target="_blank"
        >
          <Icon name="simple-icons:github" size="20" class="mr-2" />
          Report an issue
        </ButtonLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = useError()

const pageTitle = computed(() => {
  return `${error.value.statusCode} - ${error.value.message}`
})

useHead({
  title: pageTitle,
  bodyAttrs: {
    class: 'dark',
  },
})
</script>
