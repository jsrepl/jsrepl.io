import { useRouter, useSearchParams } from 'next/navigation'
import { defaultTailwindConfigTs } from '@/lib/tailwind-configs'
import { atou, utoa } from '@/lib/zip'
import type { ModelDef, ReplStoredState } from '@/types'

export function load(searchParams: ReturnType<typeof useSearchParams>): ReplStoredState {
  console.log('LOAD')

  const modelsQP = searchParams.get('i')
  const activeModelQP = searchParams.get('c')
  const showPreviewQP = searchParams.get('p')

  let models: Array<ModelDef> | null = null

  if (typeof modelsQP === 'string') {
    try {
      models = deserialize(modelsQP) as Array<ModelDef>
    } catch (e) {
      console.error('load error', e)
    }
  }

  const state = getDefaultState()

  if (models) {
    let arr: Array<ModelDef>

    if (Array.isArray(models)) {
      arr = models
    } else if (typeof models === 'object' && models !== null && 'tsx' in models) {
      // Old format
      arr = [
        {
          uri: 'file:///index.tsx',
          // @ts-expect-error: Old format
          content: models.tsx,
        },
        {
          uri: 'file:///index.html',
          // @ts-expect-error: Old format
          content: models.html,
        },
        {
          uri: 'file:///index.css',
          // @ts-expect-error: Old format
          content: models.css,
        },
      ]
    } else {
      arr = []
    }

    state.models = new Map(arr.map((model) => [model.uri, model]))
  }

  if (typeof activeModelQP === 'string') {
    const oldFormatMap = {
      tsx: 'file:///index.tsx',
      html: 'file:///index.html',
      css: 'file:///index.css',
    }

    state.activeModel =
      oldFormatMap[activeModelQP as keyof typeof oldFormatMap] ?? 'file:///' + activeModelQP
  }

  if (typeof showPreviewQP === 'string') {
    state.showPreview = showPreviewQP === '1'
  }

  return state
}

export function save(state: ReplStoredState, router: ReturnType<typeof useRouter>): void {
  console.log('SAVE')

  try {
    const query = toQueryParams(state)
    const searchParams = new URLSearchParams(query)
    router.replace(`?${searchParams.toString()}`, { scroll: false })
  } catch (e) {
    console.error('save error', e)
  }
}

export function toQueryParams(state: ReplStoredState): Record<string, string> {
  const { activeModel, showPreview, models } = state
  const modelsArr = Array.from(models.values())
  const modelsQP = serialize(modelsArr)
  return { i: modelsQP, c: activeModel.replace('file:///', ''), p: showPreview ? '1' : '0' }
}

function deserialize(serialized: string): unknown {
  return JSON.parse(atou(decodeURIComponent(serialized)))
}

function serialize(storedState: unknown): string {
  return encodeURIComponent(utoa(JSON.stringify(storedState)))
}

function getDefaultState(): ReplStoredState {
  return {
    models: getDefaultModels(),
    activeModel: 'file:///index.tsx',
    showPreview: true,
  }
}

function getDefaultModels(): ReplStoredState['models'] {
  return new Map([
    [
      'file:///index.tsx',
      {
        uri: 'file:///index.tsx',
        content: getDefaultTsx(),
      },
    ],
    [
      'file:///index.html',
      {
        uri: 'file:///index.html',
        content: getDefaultHtml(),
      },
    ],
    [
      'file:///index.css',
      {
        uri: 'file:///index.css',
        content: getDefaultCss(),
      },
    ],
    [
      'file:///tailwind.config.ts',
      {
        uri: 'file:///tailwind.config.ts',
        content: defaultTailwindConfigTs,
      },
    ],
  ])
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
