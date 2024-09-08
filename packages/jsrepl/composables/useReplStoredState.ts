import type { ReplStoredState } from '@/types/repl.types'
import { atou, utoa } from '@/utils/zip'
import type { Router } from 'vue-router'

export function useReplStoredState(): [Ref<ReplStoredState>, () => void, () => Promise<void>] {
  const state: Ref<ReplStoredState> = ref(getDefaultState())
  const router = useRouter()

  return [
    state,
    () => {
      state.value = load(router)
    },
    () => save(state.value, router),
  ]
}

function load(router: Router): ReplStoredState {
  const { query } = router.currentRoute.value
  const modelsQP = query.i
  const currentModelNameQP = query.c
  const showPreviewQP = query.p

  let models: Omit<ReplStoredState, 'currentModelName' | 'showPreview'> | null = null

  if (typeof modelsQP === 'string') {
    try {
      models = deserialize(modelsQP) as Omit<ReplStoredState, 'currentModelName' | 'showPreview'>
    } catch (e) {
      console.error('load error', e)
    }
  }

  const state = {
    ...getDefaultState(),
    ...models,
    ...(typeof currentModelNameQP === 'string'
      ? { currentModelName: currentModelNameQP as ReplStoredState['currentModelName'] }
      : null),
    ...(typeof showPreviewQP === 'string' ? { showPreview: showPreviewQP === '1' } : null),
  }

  return state
}

async function save(state: ReplStoredState, router: Router): Promise<void> {
  try {
    const query = toQueryParams(state)
    await router.replace({ query })
  } catch (e) {
    console.error('save error', e)
  }
}

export function toQueryParams(state: ReplStoredState): Record<string, string> {
  const { currentModelName, showPreview, ...models } = state
  const modelsQP = serialize(models)
  return { i: modelsQP, c: currentModelName, p: showPreview ? '1' : '0' }
}

function deserialize(serialized: string): unknown {
  return JSON.parse(atou(decodeURIComponent(serialized)))
}

function serialize(storedState: unknown): string {
  return encodeURIComponent(utoa(JSON.stringify(storedState)))
}

function getDefaultState(): ReplStoredState {
  return {
    info: getDefaultInfo(),
    tsx: getDefaultTsx(),
    html: getDefaultHtml(),
    css: getDefaultCss(),
    currentModelName: 'tsx',
    showPreview: true,
  }
}

function getDefaultInfo(): string {
  const json = { title: '', description: '' }
  return JSON.stringify(json, null, 2)
}

function getDefaultHtml(): string {
  return `<div class="flex items-center justify-center h-full dark:text-stone-100">
  <time id="clock" class="text-5xl font-bold"></time>
</div>`
}

function getDefaultCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  height: 100%;
}

body {
  margin: 0;
  padding: 1rem;
}

*,
::before,
::after {
  box-sizing: border-box;
}`
}

function getDefaultTsx(): string {
  return `import { format } from 'date-fns';

let now = new Date();

const clock = document.getElementById('clock') as HTMLTimeElement;
clock.dateTime = now.toISOString();
clock.textContent = formatTime(now);

setInterval(() => {
  now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = formatTime(now);
}, 1000);

function formatTime(date: Date) {
  return format(date, 'HH:mm:ss');
}
`
}
