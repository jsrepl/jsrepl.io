import { useRouter, useSearchParams } from 'next/navigation'
import * as ReplFS from '@/lib/repl-fs'
import { defaultTailwindConfigTs } from '@/lib/tailwind-configs'
import { atou, utoa } from '@/lib/zip'
import type { ReplStoredState } from '@/types'

export type OldModelDefV0 = {
  /**
   * Path is relative to the root of the project.
   * For example: '/index.tsx', '/index.html', '/index.css', '/tailwind.config.ts'
   */
  path: string
  content: string
}

export type OldReplStoredStateV0 = {
  activeModel: string
  models: Array<OldModelDefV0>
  showPreview: boolean
}

const SCHEMA_VERSION = '1'

export function load(searchParams: ReturnType<typeof useSearchParams>): ReplStoredState {
  try {
    const versionQP = searchParams.get('v')
    const state = getDefaultState()

    if (!versionQP) {
      loadSchemaV0(searchParams, state)
    } else if (versionQP === SCHEMA_VERSION) {
      loadSchemaCurrent(searchParams, state)
    }

    return state
  } catch (e) {
    console.error('load error', e)
    return getDefaultState()
  }
}

function loadSchemaCurrent(
  searchParams: ReturnType<typeof useSearchParams>,
  state: ReplStoredState
) {
  const fsQP = searchParams.get('f')
  const openedModelsQP = searchParams.get('o')
  const activeModelQP = searchParams.get('a')
  const showPreviewQP = searchParams.get('p')

  if (typeof fsQP === 'string') {
    state.fs = ReplFS.FS.fromJSON(deserialize(fsQP) as ReplFS.FSJson)
  }

  if (typeof openedModelsQP === 'string') {
    state.openedModels = deserialize(openedModelsQP) as string[]
  }

  if (typeof activeModelQP === 'string') {
    state.activeModel = activeModelQP
  }

  if (typeof showPreviewQP === 'string') {
    state.showPreview = showPreviewQP === '1'
  }
}

function loadSchemaV0(searchParams: ReturnType<typeof useSearchParams>, state: ReplStoredState) {
  const activeModelQP = searchParams.get('c')
  const showPreviewQP = searchParams.get('p')
  const modelsQP = searchParams.get('i')

  const oldPathMap: Record<string, string> = {
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

  let models: Array<OldModelDefV0> | { tsx: string; html: string; css: string } | null = null

  if (typeof modelsQP === 'string') {
    models = deserialize(modelsQP) as
      | Array<OldModelDefV0>
      | { tsx: string; html: string; css: string }
  }

  if (Array.isArray(models)) {
    models = models.map((model) => ({
      ...model,
      path: 'uri' in model ? oldPathMap[model.uri as string] ?? model.uri : model.path,
    }))
  } else if (typeof models === 'object' && models !== null && 'tsx' in models) {
    // Old format
    models = [
      {
        path: '/index.tsx',
        content: models.tsx,
      },
      {
        path: '/index.html',
        content: models.html,
      },
      {
        path: '/index.css',
        content: models.css,
      },
    ]
  } else {
    models = null
  }

  if (models) {
    const indextsx = models.find((model) => model.path === '/index.tsx')!
    indextsx.content = `import './index.css'\n\n${indextsx.content}`

    const indexhtml = models.find((model) => model.path === '/index.html')!
    indexhtml.content += `\n\n<script type="module" src="/index.tsx"></script>`

    const indexcss = models.find((model) => model.path === '/index.css')!

    state.fs = ReplFS.FS.fromJSON({
      'index.tsx': {
        content: indextsx.content,
        kind: ReplFS.Kind.File,
      },
      'index.html': {
        content: indexhtml.content,
        kind: ReplFS.Kind.File,
      },
      'index.css': {
        content: indexcss.content,
        kind: ReplFS.Kind.File,
      },
    })

    state.activeModel = '/index.tsx'
    state.openedModels = ['/index.tsx', '/index.html', '/index.css']
  }

  if (typeof activeModelQP === 'string') {
    state.activeModel = oldPathMap[activeModelQP] ?? activeModelQP
  }

  if (typeof showPreviewQP === 'string') {
    state.showPreview = showPreviewQP === '1'
  }
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
  const { activeModel, showPreview, fs, openedModels } = state
  return {
    f: serialize(fs.toJSON()),
    o: serialize(openedModels),
    a: activeModel,
    p: showPreview ? '1' : '0',
    v: SCHEMA_VERSION,
  }
}

export function toQueryParamsV0(state: OldReplStoredStateV0): Record<string, string> {
  const { activeModel, models, showPreview } = state
  return {
    c: activeModel,
    i: serialize(models),
    p: showPreview ? '1' : '0',
  }
}

function deserialize(serialized: string): unknown {
  return JSON.parse(atou(decodeURIComponent(serialized)))
}

function serialize(storedState: unknown): string {
  return encodeURIComponent(utoa(JSON.stringify(storedState)))
}

function getDefaultState(): ReplStoredState {
  return {
    fs: getDefaultFs(),
    openedModels: ['/index.ts', '/index.html', '/index.css'],
    activeModel: '/index.ts',
    showPreview: true,
  }
}

function getDefaultFs(): ReplStoredState['fs'] {
  return ReplFS.FS.fromJSON({
    'index.ts': {
      content: getDefaultTs(),
      kind: ReplFS.Kind.File,
    },
    'index.html': {
      content: getDefaultHtml(),
      kind: ReplFS.Kind.File,
    },
    'index.css': {
      content: getDefaultCss(),
      kind: ReplFS.Kind.File,
    },
    'tailwind.config.ts': {
      content: defaultTailwindConfigTs,
      kind: ReplFS.Kind.File,
    },
  })
}

function getDefaultHtml(): string {
  return `<div class="flex items-center justify-center h-full dark:text-stone-100">
  <time id="clock" class="text-5xl font-bold"></time>
</div>

<script type="module" src="/index.ts"></script>
`
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
}
`
}

function getDefaultTs(): string {
  return `import { format } from 'date-fns';
import './index.css';

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
