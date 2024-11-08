import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import * as monaco from 'monaco-editor'
import { MonacoEditorContext } from '@/context/monaco-editor-context'
import { ReplHistoryModeContext } from '@/context/repl-history-mode-context'
import { ReplStateContext } from '@/context/repl-state-context'
import { UserStateContext } from '@/context/user-state-context'
import useCodeEditorDTS from '@/hooks/useCodeEditorDTS'
import useCodeEditorRepl from '@/hooks/useCodeEditorRepl'
import { CodeEditorModel } from '@/lib/code-editor-model'
import { getFileExtension } from '@/lib/fs-utils'
import { loadMonacoTheme } from '@/lib/monaco-themes'
import { PrettierFormattingProvider } from '@/lib/prettier-formatting-provider'
import * as ReplFS from '@/lib/repl-fs'
import { readOnlyFiles } from '@/lib/repl-fs-meta'
import { Themes } from '@/lib/themes'
import { cn } from '@/lib/utils'
import styles from './code-editor.module.css'

if (process.env.NEXT_PUBLIC_NODE_ENV === 'test' && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__monaco = monaco
}

export default function CodeEditor() {
  const { replState, saveReplState } = useContext(ReplStateContext)!
  const { userState } = useContext(UserStateContext)!
  const { historyMode } = useContext(ReplHistoryModeContext)!
  const { editorRef, setEditor } = useContext(MonacoEditorContext)!

  const containerRef = useRef<HTMLDivElement>(null)
  const monacoModelRefs = useRef(new Set<monaco.editor.ITextModel>())

  const [isThemeLoaded, setIsThemeLoaded] = useState(false)
  const { resolvedTheme: themeId } = useTheme()
  const theme = useMemo(() => Themes.find((theme) => theme.id === themeId) ?? Themes[0], [themeId])

  const models = useMemo(() => {
    const map = new Map<string, InstanceType<typeof CodeEditorModel>>()
    console.log('models')

    replState.fs.walk('/', (path, entry) => {
      if (entry.kind === ReplFS.Kind.File) {
        const uri = monaco.Uri.parse('file://' + path)
        const model = new CodeEditorModel(uri, entry)
        map.set(uri.path, model)
      }
    })

    for (const monacoModel of monaco.editor.getModels()) {
      if (!map.has(monacoModel.uri.path)) {
        console.log('monacoModel dispose in models', monacoModel.uri.path)
        monacoModel.dispose()
      }
    }

    return map
  }, [replState.fs])

  useEffect(() => {
    const _monacoModelRefs = new Set<monaco.editor.ITextModel>()

    for (const model of models.values()) {
      const value = model.getValue()
      let monacoModel = monaco.editor.getModel(model.uri)
      if (!monacoModel) {
        monacoModel = monaco.editor.createModel(value, getMonacoLanguage(model.filePath), model.uri)
      } else if (value !== monacoModel.getValue()) {
        monacoModel.setValue(value)
      }

      model.monacoModel = monacoModel
      _monacoModelRefs.add(monacoModel)
    }

    for (const monacoModel of monacoModelRefs.current) {
      if (!_monacoModelRefs.has(monacoModel)) {
        monacoModel.dispose()
      }
    }

    monacoModelRefs.current = _monacoModelRefs
  }, [models])

  useEffect(() => {
    return () => {
      for (const monacoModel of monacoModelRefs.current) {
        monacoModel.dispose()
      }

      monacoModelRefs.current = new Set<monaco.editor.ITextModel>()
    }
  }, [])

  useEffect(() => {
    setupMonaco()
    setupTailwindCSS()
  }, [])

  useEffect(() => {
    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        model.setValue(model.monacoModel.getValue())
        saveReplState()
      })
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [models, saveReplState])

  const isReadOnly = useMemo(() => {
    if (historyMode) {
      return true
    }

    const path = replState.activeModel
    if (path && readOnlyFiles.has(path)) {
      return true
    }

    return false
  }, [replState.activeModel, historyMode])

  const editorInitialOptions = useRef<monaco.editor.IStandaloneEditorConstructionOptions>({
    model: null,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    // TODO: make it configurable
    fontSize: userState.editorFontSize,
    minimap: { enabled: false },
    readOnly: isReadOnly,
    theme: theme.id,
    quickSuggestions: {
      other: true,
      comments: true,

      // Tailwind CSS intellisense autosuggestion in TSX (otherwise it works only by pressing Ctrl+Space manually, unlike in html/css).
      strings: true,
    },
    tabSize: 2,
    renderLineHighlight: 'none',
    scrollBeyondLastLine: false,
  })

  useEffect(() => {
    const currentTextModel = models.get(replState.activeModel)?.monacoModel ?? null

    console.log('editor setModel', currentTextModel, editorRef)
    editorRef.current?.setModel(currentTextModel)
    editorInitialOptions.current.model = currentTextModel
  }, [models, replState.activeModel, editorRef])

  useEffect(() => {
    editorInitialOptions.current.readOnly = isReadOnly
    if (isReadOnly !== editorRef.current?.getOption(monaco.editor.EditorOptions.readOnly.id)) {
      editorRef.current?.updateOptions({ readOnly: isReadOnly })
    }
  }, [isReadOnly, editorRef])

  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize: userState.editorFontSize })
  }, [userState.editorFontSize, editorRef])

  useEffect(() => {
    loadMonacoTheme(theme).then(() => {
      monaco.editor.setTheme(theme.id)
      setIsThemeLoaded(true)
    })
  }, [theme])

  useEffect(() => {
    console.log('editor create')
    const editor = monaco.editor.create(containerRef.current!, editorInitialOptions.current)
    setEditor(editor)

    return () => {
      console.log('editor dispose')
      editor.dispose()
      setEditor(null)
    }
  }, [setEditor])

  useCodeEditorDTS(models)
  useCodeEditorRepl(models, { theme })

  return (
    <div
      ref={containerRef}
      className={cn('min-h-0 flex-1', styles.codeEditor, { 'opacity-0': !isThemeLoaded })}
    />
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

function getMonacoLanguage(path: string): string {
  const ext = getFileExtension(path)
  if (!ext) {
    return 'plaintext'
  }

  const language = {
    '.tsx': 'typescript',
    '.ts': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.json': 'json',
    '.html': 'html',
    '.css': 'css',
    '.md': 'markdown',
  }[ext]

  return language ?? 'plaintext'
}
