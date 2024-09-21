<template>
  <dl>
    <dt><code>variant=default</code></dt>
    <dd>
      <Button>Button</Button>
    </dd>

    <dt><code>variant=destructive</code></dt>
    <dd>
      <Button variant="destructive">Button</Button>
    </dd>

    <dt><code>variant=secondary</code></dt>
    <dd>
      <Button variant="secondary">Button</Button>
    </dd>

    <dt><code>variant=ghost</code></dt>
    <dd>
      <Button variant="ghost">Button</Button>
    </dd>

    <dt><code>variant=ghost-primary</code></dt>
    <dd>
      <Button variant="ghost-primary">Button</Button>
    </dd>

    <dt><code>variant=link</code></dt>
    <dd>
      <Button variant="link">Button</Button>
    </dd>

    <dt><code>size=default</code></dt>
    <dd>
      <Button>Button</Button>
    </dd>

    <dt><code>size=xs</code></dt>
    <dd>
      <Button size="xs">Button</Button>
    </dd>

    <dt><code>size=sm</code></dt>
    <dd>
      <Button size="sm">Button</Button>
    </dd>

    <dt><code>size=lg</code></dt>
    <dd>
      <Button size="lg">Button</Button>
    </dd>

    <dt><code>size=icon</code></dt>
    <dd>
      <Button size="icon">
        <LucideMail width="18" hanging="18" />
      </Button>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { LucideMail } from 'lucide-vue-next'
</script>
