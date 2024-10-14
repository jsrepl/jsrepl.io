import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import * as monaco from 'monaco-editor'
import { ReplStateContext } from '@/context/repl-state-context'
import useCodeEditorRepl from '@/hooks/useCodeEditorRepl'
import useCodeEditorTypescript from '@/hooks/useCodeEditorTypescript'
import type { CodeEditorModel } from '@/lib/code-editor-models/code-editor-model'
import { createCodeEditorModel } from '@/lib/code-editor-models/code-editor-model-factory'
import { loadMonacoTheme } from '@/lib/monaco-themes'
import { PrettierFormattingProvider } from '@/lib/prettier-formatting-provider'
import * as ReplFS from '@/lib/repl-fs'
import { Themes } from '@/lib/themes'
import { cn } from '@/lib/utils'
import styles from './code-editor.module.css'

type Props = {
  className?: string
}

export default function CodeEditor({ className }: Props) {
  console.log('CodeEditor render')

  const { replState, saveReplState } = useContext(ReplStateContext)!

  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const updateDecorationsRef = useRef(() => {})
  const modelsDisposables = useRef<(() => void)[]>([])

  const [isThemeLoaded, setIsThemeLoaded] = useState(false)
  const { resolvedTheme: themeId } = useTheme()
  const theme = useMemo(() => Themes.find((theme) => theme.id === themeId) ?? Themes[0], [themeId])

  const models = useMemo(() => {
    console.log('models useMemo')

    modelsDisposables.current.forEach((disposable) => disposable())
    modelsDisposables.current = []
    const map = new Map<string, InstanceType<typeof CodeEditorModel>>()

    replState.fs.walk('/', (path, entry) => {
      if (entry.kind === ReplFS.Kind.File) {
        const model = createCodeEditorModel({ path, file: entry })
        map.set(path, model)
        modelsDisposables.current.push(() => model.monacoModel.dispose())
      }
    })

    return map
  }, [replState.fs])

  useEffect(() => {
    return () => {
      modelsDisposables.current.forEach((disposable) => disposable())
    }
  }, [])

  useEffect(() => {
    setupMonaco()
    setupTailwindCSS()
  }, [])

  const onModelChange = useCallback(
    (editorModel: InstanceType<typeof CodeEditorModel>) => {
      console.log('onModelChange', editorModel)
      editorModel.file.content = editorModel.getValue()
      saveReplState()
    },
    [saveReplState]
  )

  useEffect(() => {
    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        onModelChange(model)
      })
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [models, onModelChange])

  const currentTextModel = useMemo(
    () => models.get(replState.activeModel)?.monacoModel ?? null,
    [models, replState.activeModel]
  )

  useEffect(() => {
    editorRef.current?.setModel(currentTextModel)

    const lang = currentTextModel?.getLanguageId()
    if (lang === 'typescript' || lang === 'javascript') {
      updateDecorationsRef.current()
    }
  }, [currentTextModel])

  const editorInitialOptions = useRef<monaco.editor.IStandaloneEditorConstructionOptions>({
    model: currentTextModel,
    automaticLayout: true,
    padding: { top: 20, bottom: 20 },
    // TODO: make it configurable
    fontSize: 16,
    minimap: { enabled: false },
    theme: theme.id,
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

  useEffect(() => {
    loadMonacoTheme(theme).then(() => {
      console.log('set theme is loaded')
      monaco.editor.setTheme(theme.id)
      setIsThemeLoaded(true)
    })
  }, [theme])

  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current!, editorInitialOptions.current)
    editorRef.current = editor

    return () => {
      editor.dispose()
    }
  }, [])

  useCodeEditorTypescript(editorRef, models)

  const { updateDecorations } = useCodeEditorRepl(editorRef, models, { theme })
  updateDecorationsRef.current = updateDecorations

  return (
    <>
      <div
        className={cn(className, styles.codeEditor, { 'opacity-0': !isThemeLoaded })}
        ref={containerRef}
      />
    </>
  )
}

function setupMonaco() {
  self.MonacoEnvironment = {
    getWorker(workerId, label) {
      switch (label) {
        case 'json':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url)
          )
        case 'css':
        case 'scss':
        case 'less':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url)
          )
        case 'html':
        case 'handlebars':
        case 'razor':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url)
          )
        case 'typescript':
        case 'javascript':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url)
          )
        case 'tailwindcss':
          return new Worker(new URL('@/lib/monaco-tailwindcss.worker', import.meta.url))
        default:
          return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url))
      }
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
