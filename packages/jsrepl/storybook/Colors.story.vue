<template>
  <ul>
    <li>
      <code>--background</code>
      <span class="bg-background" />
    </li>

    <li>
      <code>--foreground</code>
      <span class="bg-foreground" />
    </li>

    <li>
      <code>--muted</code>
      <span class="bg-muted" />
    </li>

    <li>
      <code>--muted-foreground</code>
      <span class="bg-muted-foreground" />
    </li>

    <li>
      <code>--popover</code>
      <span class="bg-popover" />
    </li>

    <li>
      <code>--popover-foreground</code>
      <span class="bg-popover-foreground" />
    </li>

    <li>
      <code>--tooltip</code>
      <span class="bg-tooltip" />
    </li>

    <li>
      <code>--tooltip-foreground</code>
      <span class="bg-tooltip-foreground" />
    </li>

    <li>
      <code>--card</code>
      <span class="bg-card" />
    </li>

    <li>
      <code>--card-foreground</code>
      <span class="bg-card-foreground" />
    </li>

    <li>
      <code>--border</code>
      <span class="bg-border" />
    </li>

    <li>
      <code>--input</code>
      <span class="bg-input" />
    </li>

    <li>
      <code>--primary</code>
      <span class="bg-primary" />
    </li>

    <li>
      <code>--primary-foreground</code>
      <span class="bg-primary-foreground" />
    </li>

    <li>
      <code>--secondary</code>
      <span class="bg-secondary" />
    </li>

    <li>
      <code>--secondary-foreground</code>
      <span class="bg-secondary-foreground" />
    </li>

    <li>
      <code>--accent</code>
      <span class="bg-accent" />
    </li>

    <li>
      <code>--accent-foreground</code>
      <span class="bg-accent-foreground" />
    </li>

    <li>
      <code>--destructive</code>
      <span class="bg-destructive" />
    </li>

    <li>
      <code>--destructive-foreground</code>
      <span class="bg-destructive-foreground" />
    </li>

    <li>
      <code>--ring</code>
      <span class="bg-ring" />
    </li>

    <li>
      <code>--radius</code>
      <div class="rounded border border-foreground px-2">rounded</div>
      <div class="rounded-sm border border-foreground px-2">rounded-sm</div>
      <div class="rounded-md border border-foreground px-2">rounded-md</div>
      <div class="rounded-lg border border-foreground px-2">rounded-lg</div>
      <div class="rounded-xl border border-foreground px-2">rounded-xl</div>
    </li>
  </ul>
</template>

<style scoped>
li {
  @apply flex items-center gap-3;
}

li span {
  @apply inline-block h-5 w-8 rounded;
  border: 1px solid white;
  outline: 1px solid black;
}
</style>
