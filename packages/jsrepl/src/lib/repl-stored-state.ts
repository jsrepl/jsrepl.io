import { useRouter, useSearchParams } from 'next/navigation'
import { defaultTailwindConfigTs } from '@/lib/tailwind-configs'
import { atou, utoa } from '@/lib/zip'
import type { ModelDef, ReplStoredState } from '@/types'

const SCHEMA_VERSION = '1'

export function load(searchParams: ReturnType<typeof useSearchParams>): ReplStoredState {
  const modelsQP = searchParams.get('i')
  const activeModelQP = searchParams.get('c')
  const showPreviewQP = searchParams.get('p')
  const versionQP = searchParams.get('v')

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
      arr = models.map((model) => ({
        ...model,
        path: 'uri' in model ? fixPath(model.uri as string) : model.path,
      }))
    } else if (typeof models === 'object' && models !== null && 'tsx' in models) {
      // Old format
      arr = [
        {
          path: '/index.tsx',
          // @ts-expect-error: Old format
          content: models.tsx,
        },
        {
          path: '/index.html',
          // @ts-expect-error: Old format
          content: models.html,
        },
        {
          path: '/index.css',
          // @ts-expect-error: Old format
          content: models.css,
        },
      ]
    } else {
      arr = []
    }

    state.models = new Map(arr.map((model) => [model.path, model]))

    if (!versionQP) {
      const indexhtml = state.models.get('/index.html')!
      indexhtml.content += `\n\n<script type="module" src="/index.tsx"></script>`

      const indextsx = state.models.get('/index.tsx')!
      indextsx.content = `import './index.css'\n\n${indextsx.content}`
    }
  }

  if (typeof activeModelQP === 'string') {
    state.activeModel = fixPath(activeModelQP)
  }

  if (typeof showPreviewQP === 'string') {
    state.showPreview = showPreviewQP === '1'
  }

  return state
}

// Convert old paths to new paths
function fixPath(path: string): string {
  const oldMap = {
    tsx: '/index.tsx',
    html: '/index.html',
    css: '/index.css',
    'file:///index.tsx': '/index.tsx',
    'file:///index.html': '/index.html',
    'file:///index.css': '/index.css',
    'file:///tailwind.config.ts': '/tailwind.config.ts',
    'index.tsx': '/index.tsx',
    'index.html': '/index.html',
    'index.css': '/index.css',
    'tailwind.config.ts': '/tailwind.config.ts',
  }

  return oldMap[path as keyof typeof oldMap] ?? path
}

export function save(state: ReplStoredState, router: ReturnType<typeof useRouter>): void {
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
  return { i: modelsQP, c: activeModel, p: showPreview ? '1' : '0', v: SCHEMA_VERSION }
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
    activeModel: '/index.tsx',
    showPreview: true,
  }
}

function getDefaultModels(): ReplStoredState['models'] {
  return new Map([
    [
      '/index.tsx',
      {
        path: '/index.tsx',
        content: getDefaultTsx(),
      },
    ],
    [
      '/index.html',
      {
        path: '/index.html',
        content: getDefaultHtml(),
      },
    ],
    [
      '/index.css',
      {
        path: '/index.css',
        content: getDefaultCss(),
      },
    ],
    [
      '/tailwind.config.ts',
      {
        path: '/tailwind.config.ts',
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
