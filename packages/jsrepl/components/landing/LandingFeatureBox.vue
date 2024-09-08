<template>
  <div class="flex flex-col gap-4 rounded-xl bg-[#202127] p-6 text-white/85">
    <div class="flex h-12 w-12 items-center justify-center rounded-sm bg-background">
      <slot name="icon" />
    </div>

    <h2 class="font-medium"><slot name="title" /></h2>

    <p class="text-sm text-gray-400">
      <slot name="description" />
    </p>
  </div>
</template>
