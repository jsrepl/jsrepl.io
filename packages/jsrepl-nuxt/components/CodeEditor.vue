<script setup lang="ts">
import * as monaco from 'monaco-editor'
// @ts-expect-error: no types for this
import { IQuickInputService } from 'monaco-editor/esm/vs/platform/quickinput/common/quickInput'
import type { ModelDef, Theme, ThemeDef } from '~/types/repl.types'
import { createCodeEditorModel } from '~/utils/code-editor-model-factory'
import { PrettierFormattingProvider } from '~/utils/prettier-formatting-provider'
import { useCodeEditorRepl } from '@/composables/useCodeEditorRepl'
import { useCodeEditorTypescript } from '@/composables/useCodeEditorTypescript'
import { loadMonacoTheme } from '@/utils/monaco-themes'
import { Themes } from '@/utils/themes'

const emit = defineEmits(['model-change', 'repl', 'replBodyMutation'])

const props = defineProps<{
  modelDefinitions: Map<string, ModelDef>
  activeModel: string
  theme: ThemeDef
  previewIframe: HTMLIFrameElement | null
}>()

const { modelDefinitions, activeModel, theme, previewIframe } = toRefs(props)

const containerRef = ref<HTMLElement | null>(null)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
const models = shallowReactive(new Map<string, InstanceType<typeof CodeEditorModel>>())

const [userStoredState] = useUserStoredState()
const currentTextModel = computed(() => models.get(activeModel.value)?.monacoModel ?? null)

defineExpose({
  getEditor: () => editor.value,
  restartRepl: () => {
    const model = models.get('file:///index.tsx')
    model?.monacoModel.setValue(model.getValue())
  },
})

setupMonaco()
setupTailwindCSS()

await loadMonacoTheme(theme.value)

watch(theme, async (theme) => {
  await loadMonacoTheme(theme)
  editor.value?.updateOptions({ theme: theme.id })
})

watch(currentTextModel, () => {
  editor.value?.setModel(currentTextModel.value)

  if (currentTextModel.value?.uri.toString() === 'file:///index.tsx') {
    updateDecorations()
  }
})

onMounted(() => {
  modelDefinitions.value.forEach((modelDef) => {
    const model = createCodeEditorModel(modelDef)
    if (model) {
      models.set(modelDef.uri, model)
      model.monacoModel.onDidChangeContent(() => {
        emit('model-change', model)
      })
    }
  })

  editor.value = monaco.editor.create(containerRef.value!, {
    model: currentTextModel.value,
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

useCodeEditorTypescript(() => editor.value, models)

const { updateDecorations } = useCodeEditorRepl(() => editor.value, models, {
  theme,
  previewIframe,
  onRepl: ({ error }) => emit('repl', { error }),
  onReplBodyMutation: () => emit('replBodyMutation'),
})

onBeforeUnmount(() => {
  editor.value?.dispose()
  models.forEach((model) => {
    model.monacoModel.dispose()
  })
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
          worker = await import('@/utils/monaco-tailwindcss.worker?worker')
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

  const prettierFormattingProvider = new PrettierFormattingProvider()
  monaco.languages.registerDocumentFormattingEditProvider(
    [
      { language: 'typescript', exclusive: true },
      { language: 'javascript', exclusive: true },
      { language: 'html', exclusive: true },
      { language: 'css', exclusive: true },
    ],
    prettierFormattingProvider
  )

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: true,
    trailingCommas: 'ignore',
    // schemas: [],
  })
}

async function setupTailwindCSS() {
  const { tailwindcssData } = await import('@nag5000/monaco-tailwindcss')

  monaco.languages.css.cssDefaults.setOptions({
    data: {
      dataProviders: {
        tailwindcssData,
      },
    },
  })
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
