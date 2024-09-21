<template>
  <code>State: {{ checked }}</code>
  <dl>
    <dt><code>variant=default</code></dt>
    <dd class="flex flex-col items-start gap-2">
      <Checkbox v-model="checked" />

      <Label>
        <Checkbox v-model="checked" />
        Checkbox
      </Label>

      <Label>
        Checkbox
        <Checkbox v-model="checked" />
      </Label>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const checked = ref(true)
</script>
