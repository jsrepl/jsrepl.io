<script setup lang="ts">
import { useCodeEditorRepl } from '@/composables/useCodeEditorRepl'
import { useCodeEditorTypescript } from '@/composables/useCodeEditorTypescript'
import { CssModelShared } from '@/utils/css-model-shared'
import { HtmlModelShared } from '@/utils/html-model-shared'
import { InfoModelShared } from '@/utils/info-model-shared'
import { loadMonacoTheme } from '@/utils/monaco-themes'
import { Themes } from '@/utils/themes'
import { TsxModelShared } from '@/utils/tsx-model-shared'
import type { MonacoTailwindcss } from '@nag5000/monaco-tailwindcss'
import * as monaco from 'monaco-editor'
// @ts-expect-error: no types for this
import { IQuickInputService } from 'monaco-editor/esm/vs/platform/quickinput/common/quickInput'
import { type Theme, type ThemeDef } from '~/types/repl.types'
import { PrettierFormattingProvider } from '~/utils/prettier-formatting-provider'

const containerRef = ref<HTMLElement | null>(null)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
let infoModel: monaco.editor.ITextModel
let tsxModel: monaco.editor.ITextModel
let htmlModel: monaco.editor.ITextModel
let cssModel: monaco.editor.ITextModel
let infoModelShared: InfoModelShared | null = null
let tsxModelShared: TsxModelShared | null = null
let htmlModelShared: HtmlModelShared | null = null
let cssModelShared: CssModelShared | null = null
let monacoTailwindcss: MonacoTailwindcss | null = null

const props = defineProps<{
  infoValue: string
  tsxValue: string
  htmlValue: string
  cssValue: string
  selectedModelName: 'info' | 'tsx' | 'html' | 'css'
  theme: ThemeDef
  previewIframe: HTMLIFrameElement | null
}>()

const { infoValue, tsxValue, htmlValue, cssValue, selectedModelName, theme, previewIframe } =
  toRefs(props)

const emit = defineEmits([
  'info-change',
  'tsx-change',
  'html-change',
  'css-change',
  'repl',
  'replBodyMutation',
])

defineExpose({
  getEditor: () => editor.value,
  getTsxModelShared: () => tsxModelShared,
  getHtmlModelShared: () => htmlModelShared,
  getCssModelShared: () => cssModelShared,
})

const [userStoredState] = useUserStoredState()

const selectedModel = computed(() => {
  switch (selectedModelName.value) {
    case 'info':
      return infoModel
    case 'tsx':
      return tsxModel
    case 'html':
      return htmlModel
    case 'css':
      return cssModel
    default:
      return tsxModel
  }
})

setupMonaco()
const monacoTailwindcssPromise = setupTailwindCSS()

await loadMonacoTheme(theme.value)

watch(theme, async (theme) => {
  await loadMonacoTheme(theme)
  editor.value?.updateOptions({ theme: theme.id })
})

watch(selectedModelName, () => {
  editor.value?.setModel(selectedModel.value)

  if (selectedModel.value === tsxModel) {
    updateDecorations()
  }
})

onMounted(() => {
  infoModel = monaco.editor.createModel(
    infoValue.value,
    'json',
    monaco.Uri.parse('file:///index.json')
  )

  tsxModel = monaco.editor.createModel(
    tsxValue.value,
    'typescript',
    monaco.Uri.parse('file:///index.tsx')
  )

  htmlModel = monaco.editor.createModel(
    htmlValue.value,
    'html',
    monaco.Uri.parse('file:///index.html')
  )

  cssModel = monaco.editor.createModel(cssValue.value, 'css', monaco.Uri.parse('file:///index.css'))

  editor.value = monaco.editor.create(containerRef.value!, {
    model: selectedModel.value,
    automaticLayout: true,
    padding: { top: 20, bottom: 20 },
    // TODO: make it configurable
    fontSize: 16,
    minimap: { enabled: false },
    theme: theme.value.id,
    quickSuggestions: {
      other: true,
      comments: true,

      // Tailwind CSS intellisense autosuggestion in TSX (otherwise it works only by pressing Ctrl+Space manually, unlike in html/css).
      strings: true,
    },
    tabSize: 2,
    // TODO: make it configurable
    renderLineHighlight: 'none',
    scrollBeyondLastLine: false,
  })

  infoModel.onDidChangeContent(() => {
    infoModelShared?.invalidateCache()
    emit('info-change', infoModelShared)
  })

  tsxModel.onDidChangeContent(() => {
    tsxModelShared?.invalidateCache()
    emit('tsx-change', tsxModelShared)
  })

  htmlModel.onDidChangeContent(() => {
    htmlModelShared?.invalidateCache()
    emit('html-change', htmlModelShared)
  })

  cssModel.onDidChangeContent(() => {
    cssModelShared?.invalidateCache()
    emit('css-change', cssModelShared)
  })

  infoModelShared = new InfoModelShared(infoModel)
  tsxModelShared = new TsxModelShared(tsxModel)
  htmlModelShared = new HtmlModelShared(htmlModel)
  cssModelShared = new CssModelShared(cssModel)

  const quickInputCommand = editor.value.addCommand(0, (accessor, func) => {
    const quickInputService = accessor.get(IQuickInputService)
    func(quickInputService)
  })

  editor.value.addAction({
    id: 'themeSelector',
    label: 'Choose Color Theme...',
    run: (editor) => {
      if (!quickInputCommand) {
        return
      }

      editor.trigger(
        '',
        quickInputCommand,
        (quickInput: {
          pick: (
            arg0: { type: string; id: string; label: string }[]
          ) => Promise<{ type: string; id: string; label: string }>
        }) => {
          quickInput
            .pick(
              Themes.map((theme) => ({
                type: 'item',
                id: theme.id,
                label: theme.label,
              }))
            )
            .then((selected) => {
              if (selected) {
                userStoredState.value.theme = selected.id as Theme
              }
            })
        }
      )
    },
  })
})

useCodeEditorTypescript(
  () => editor.value,
  () => tsxModelShared
)

const { updateDecorations } = useCodeEditorRepl(
  () => editor.value,
  () => tsxModelShared,
  () => htmlModelShared,
  () => cssModelShared,
  {
    monacoTailwindcssPromise,
    theme,
    previewIframe,
    onRepl: ({ error }) => emit('repl', { error }),
    onReplBodyMutation: () => emit('replBodyMutation'),
  }
)

onBeforeUnmount(() => {
  monacoTailwindcss?.dispose()

  editor.value?.dispose()
  infoModel?.dispose()
  tsxModel?.dispose()
  htmlModel?.dispose()
  cssModel?.dispose()
})

function setupMonaco() {
  self.MonacoEnvironment = {
    getWorker: async function (workerId, label) {
      let worker

      switch (label) {
        case 'json':
          worker = await import('monaco-editor/esm/vs/language/json/json.worker?worker')
          break
        case 'css':
        case 'scss':
        case 'less':
          worker = await import('monaco-editor/esm/vs/language/css/css.worker?worker')
          break
        case 'html':
        case 'handlebars':
        case 'razor':
          worker = await import('monaco-editor/esm/vs/language/html/html.worker?worker')
          break
        case 'typescript':
        case 'javascript':
          worker = await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
          break
        case 'tailwindcss':
          worker = await import('@nag5000/monaco-tailwindcss/tailwindcss.worker?worker')
          break
        default:
          worker = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
      }

      return new worker.default()
    },
  }

  monaco.editor.addKeybindingRules([
    {
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      command: 'editor.action.formatDocument',
      when: 'editorHasDocumentFormattingProvider && editorTextFocus && !editorReadonly',
    },
  ])

  monaco.languages.registerDocumentFormattingEditProvider(
    { language: 'typescript', exclusive: true },
    new PrettierFormattingProvider()
  )

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: true,
    trailingCommas: 'ignore',
    // schemas: [],
  })
}

async function setupTailwindCSS() {
  const { configureMonacoTailwindcss, tailwindcssData } = await import(
    '@nag5000/monaco-tailwindcss'
  )

  monaco.languages.css.cssDefaults.setOptions({
    data: {
      dataProviders: {
        tailwindcssData,
      },
    },
  })

  monacoTailwindcss = configureMonacoTailwindcss(monaco, {
    // TODO: make it configurable
    tailwindConfig: {
      corePlugins: {
        // TODO: make it configurable
        preflight: false,
      },
      darkMode: 'class',
    },
  })

  return monacoTailwindcss
}
</script>

<template>
  <div ref="containerRef" />
</template>

<style scoped>
:deep(.jsrepl-decor) {
  --color: #666;
}

:deep(.jsrepl-kind-console-warn) {
  --color: rgb(177, 105, 35);
}

:deep(.jsrepl-kind-error),
:deep(.jsrepl-kind-babel-parse-error),
:deep(.jsrepl-kind-console-error) {
  --color: rgb(177, 35, 35);
}

:deep(.jsrepl-decor::before) {
  margin: 0 0 0 3em;
  content: '// → ';
  color: var(--color);
}

:deep(.jsrepl-decor::after) {
  content: var(--value);
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  background-color: rgba(0, 0, 0, 0);
  color: var(--color);
}

/* Fix text clipping due to Tailwind CSS preflight styles: `* { box-sizing: border-box; }` */
:deep(.monaco-editor .action-widget) {
  box-sizing: content-box;
}
</style>
