<template>
  <i>Dialogs can be closed with ESC by default.</i>
  <dl>
    <dt><code>variant=default</code></dt>
    <dd>
      <Dialog :ref="dialogRefs[0]">Dialog</Dialog>
      <Button @click="() => dialogRefs[0].value!.showModal()">Show modal</Button>
    </dd>

    <dt><code>title="Title"</code></dt>
    <dd>
      <Dialog :ref="dialogRefs[1]" title="Title">Dialog</Dialog>
      <Button @click="() => dialogRefs[1].value!.showModal()">Show modal</Button>
    </dd>

    <dt><code>backdrop-close</code></dt>
    <dd>
      <Dialog :ref="dialogRefs[2]" backdrop-close>Dialog</Dialog>
      <Button @click="() => dialogRefs[2].value!.showModal()">Show modal</Button>
    </dd>

    <dt><code>close-button</code></dt>
    <dd>
      <Dialog :ref="dialogRefs[3]" close-button>Dialog</Dialog>
      <Button @click="() => dialogRefs[3].value!.showModal()">Show modal</Button>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { Dialog } from '@/components/ui/dialog'

const dialogRefs = Array.from({ length: 99 }).map(() =>
  ref<InstanceType<typeof Dialog> | null>(null)
)
</script>
