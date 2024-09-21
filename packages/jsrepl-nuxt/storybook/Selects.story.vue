<template>
  <code>State: {{ selected }}</code>
  <dl>
    <dt><code>variant=default</code></dt>
    <dd>
      <Select v-model="selected">
        <option value="option-1">Option 1</option>
        <option value="option-2">Option 2</option>
        <option value="option-3">Option 3</option>
      </Select>
    </dd>

    <dt><code>Wrapped in Label</code></dt>
    <dd>
      <Label>
        Label
        <Select v-model="selected">
          <option value="option-1">Option 1</option>
          <option value="option-2">Option 2</option>
          <option value="option-3">Option 3</option>
        </Select>
      </Label>
    </dd>

    <dt><code>Wrapped in Label col</code></dt>
    <dd>
      <Label col>
        Label
        <Select v-model="selected">
          <option value="option-1">Option 1</option>
          <option value="option-2">Option 2</option>
          <option value="option-3">Option 3</option>
        </Select>
      </Label>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { Select } from '@/components/ui/select'

const selected = ref('option-1')
</script>
