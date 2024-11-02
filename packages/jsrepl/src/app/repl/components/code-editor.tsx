import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import * as monaco from 'monaco-editor'
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
import { virtualFilesStorage } from '@/lib/virtual-files-storage'
import CodeEditorHeader from './code-editor-header'
import styles from './code-editor.module.css'
import { ErrorsNotification } from './errors-notification'

if (process.env.NEXT_PUBLIC_NODE_ENV === 'test' && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__monaco = monaco
}

export default function CodeEditor({ className }: { className?: string }) {
  const { replState, saveReplState } = useContext(ReplStateContext)!
  const { userState } = useContext(UserStateContext)!

  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const [isThemeLoaded, setIsThemeLoaded] = useState(false)
  const { resolvedTheme: themeId } = useTheme()
  const theme = useMemo(() => Themes.find((theme) => theme.id === themeId) ?? Themes[0], [themeId])

  const models = useMemo(() => {
    const map = new Map<string, InstanceType<typeof CodeEditorModel>>()

    replState.fs.walk('/', (path, entry) => {
      if (entry.kind === ReplFS.Kind.File) {
        const content = entry.content.startsWith('virtual://')
          ? virtualFilesStorage.get(entry.content) ?? entry.content
          : entry.content

        const uri = monaco.Uri.parse('file://' + path)
        let monacoModel = monaco.editor.getModel(uri)
        if (!monacoModel) {
          monacoModel = monaco.editor.createModel(content, getMonacoLanguage(uri.path), uri)
        } else if (content !== monacoModel.getValue()) {
          monacoModel.setValue(content)
        }

        const model = new CodeEditorModel(entry, monacoModel)
        map.set(uri.path, model)
      }
    })

    for (const monacoModel of monaco.editor.getModels()) {
      if (!map.has(monacoModel.uri.path)) {
        monacoModel.dispose()
      }
    }

    return map
  }, [replState.fs])

  useEffect(() => {
    setupMonaco()
    setupTailwindCSS()
  }, [])

  const onModelChange = useCallback(
    (editorModel: InstanceType<typeof CodeEditorModel>) => {
      if (readOnlyFiles.has(editorModel.filePath)) {
        return
      }

      if (editorModel.filePath.startsWith('virtual://')) {
        virtualFilesStorage.set(editorModel.filePath, editorModel.getValue())
      } else {
        editorModel.file.content = editorModel.getValue()
      }
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
  }, [currentTextModel])

  const isReadOnly = useMemo(() => {
    const path = currentTextModel?.uri.path
    if (path && readOnlyFiles.has(path)) {
      return true
    }

    return false
  }, [currentTextModel])

  useEffect(() => {
    if (isReadOnly !== editorRef.current?.getOption(monaco.editor.EditorOptions.readOnly.id)) {
      editorRef.current?.updateOptions({ readOnly: isReadOnly })
    }
  }, [isReadOnly])

  const editorInitialOptions = useRef<monaco.editor.IStandaloneEditorConstructionOptions>({
    model: currentTextModel,
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
    editorRef.current?.updateOptions({ fontSize: userState.editorFontSize })
  }, [userState.editorFontSize])

  useEffect(() => {
    loadMonacoTheme(theme).then(() => {
      monaco.editor.setTheme(theme.id)
      setIsThemeLoaded(true)
    })
  }, [theme])

  useEffect(() => {
    return () => {
      for (const model of models.values()) {
        model.dispose()
      }
    }
  }, [models])

  useEffect(() => {
    return () => {
      for (const monacoModel of monaco.editor.getModels()) {
        monacoModel.dispose()
      }
    }
  }, [])

  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current!, editorInitialOptions.current)
    editorRef.current = editor

    return () => {
      editor.dispose()
    }
  }, [])

  useCodeEditorDTS(editorRef, models)
  useCodeEditorRepl(editorRef, models, { theme })

  return (
    <>
      <div className={cn(className, 'relative flex min-w-24 flex-col [grid-area:editor]')}>
        <CodeEditorHeader editorRef={editorRef} />
        <div
          ref={containerRef}
          className={cn('min-h-0 flex-1', styles.codeEditor, { 'opacity-0': !isThemeLoaded })}
        />
        <ErrorsNotification />
      </div>
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
