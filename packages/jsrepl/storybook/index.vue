<template>
  <div>
    <div class="mb-4 flex flex-wrap gap-4 border-b p-3">
      <Label>
        Show bg pattern
        <Checkbox v-model="showBgPattern" />
      </Label>

      <Label>
        Theme
        <Select v-model="themeId">
          <option v-for="t in Themes" :key="t.id" :value="t.id">{{ t.label }}</option>
        </Select>
      </Label>

      <Button variant="secondary" @click="expandAll">Expand all</Button>
      <Button variant="secondary" @click="collapseAll">Collapse all</Button>
    </div>

    <div class="flex flex-1 flex-col gap-4 p-4" :class="[{ 'bg-pattern': showBgPattern }]">
      <details>
        <summary>Colors</summary>
        <Colors />
      </details>

      <details>
        <summary>Buttons</summary>
        <Buttons />
      </details>

      <details>
        <summary>Selects</summary>
        <Selects />
      </details>

      <details>
        <summary>Dialogs</summary>
        <Dialogs />
      </details>

      <details>
        <summary>Checkboxes</summary>
        <Checkboxes />
      </details>

      <details>
        <summary>Dropdown Menu</summary>
        <DropdownMenus />
      </details>

      <details>
        <summary>Logins</summary>
        <Logins />
      </details>

      <details>
        <summary>Toasts</summary>
        <Toasts />
      </details>

      <details>
        <summary>Tooltips</summary>
        <Tooltips />
      </details>

      <details>
        <summary>Logos</summary>
        <Logos />
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Theme } from '~/types/repl.types'
import { Themes } from '~/utils/themes'
import Buttons from './Buttons.story.vue'
import Checkboxes from './Checkboxes.story.vue'
import Colors from './Colors.story.vue'
import Dialogs from './Dialogs.story.vue'
import DropdownMenus from './DropdownMenus.story.vue'
import Logins from './Login.story.vue'
import Logos from './Logos.story.vue'
import Selects from './Selects.story.vue'
import Toasts from './Toasts.story.vue'
import Tooltips from './Tooltips.story.vue'

const themeId = ref<Theme>(Themes[0].id)
const showBgPattern = ref(false)

const theme = computed(() => {
  return Themes.find((theme) => theme.id === themeId.value)
})

definePageMeta({
  layout: 'custom',
})

useHead({
  title: 'Storybook',
  bodyAttrs: {
    class: () => (theme.value ? `theme-${theme.value.id}` : ''),
  },
})

function expandAll() {
  document.querySelectorAll('details').forEach((d) => (d.open = true))
}

function collapseAll() {
  document.querySelectorAll('details').forEach((d) => (d.open = false))
}
</script>

<style scoped>
details {
  padding-left: 1rem;
}

summary {
  margin-left: -1rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

:deep() {
  dt {
    font-weight: 500;
  }

  dt::before {
    content: '• ';
  }

  dd {
    margin-top: 0.2rem;
    margin-left: 1rem;
    margin-bottom: 0.5rem;
  }
}

.bg-pattern {
  --p: #527da74f;
  background-image: repeating-linear-gradient(
      45deg,
      var(--p) 25%,
      transparent 25%,
      transparent 75%,
      var(--p) 75%,
      var(--p)
    ),
    repeating-linear-gradient(
      45deg,
      var(--p) 25%,
      transparent 25%,
      transparent 75%,
      var(--p) 75%,
      var(--p)
    );
  background-position:
    0 0,
    10px 10px;
  background-size: 20px 20px;
}
</style>
