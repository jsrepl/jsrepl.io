import React, { useEffect, useMemo, useRef } from 'react'
import { useTheme } from 'next-themes'
import { shikiToMonaco } from '@shikijs/monaco'
import * as monaco from 'monaco-editor'
import codeEditorStyles from '@/components/code-editor.module.css'
import useCodeEditorDTS from '@/hooks/useCodeEditorDTS'
import useCodeEditorRepl from '@/hooks/useCodeEditorRepl'
import { useCodeHighlighter } from '@/hooks/useCodeHighlighter'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import useMonacopilot from '@/hooks/useMonacopilot'
import { useReplModels } from '@/hooks/useReplModels'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import {
  PrettierFormattingProvider,
  SUPPORTED_FORMATTING_LANGUAGES,
} from '@/lib/monaco-prettier-formatting-provider'
import { Themes } from '@/lib/themes'
import { cn } from '@/lib/utils'

if (process.env.NEXT_PUBLIC_NODE_ENV === 'test' && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__monaco = monaco
}

setupMonaco()
setupInitialMonacoThemes()
setupTailwindCSS()

export default function CodeEditor() {
  const [replState] = useReplStoredState()
  const [userState] = useUserStoredState()
  const { editor, setEditor } = useMonacoEditor()
  const { models, readOnlyModels } = useReplModels()
  const { highlighter, loadedHighlightTheme } = useCodeHighlighter()

  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(editor)

  const { resolvedTheme: themeId } = useTheme()
  const theme = useMemo(() => Themes.find((theme) => theme.id === themeId) ?? Themes[0]!, [themeId])

  const currentTextModel = useMemo(() => {
    return models.get(replState.activeModel)?.monacoModel ?? null
  }, [models, replState.activeModel])

  const isReadOnly = useMemo(() => {
    return readOnlyModels.has(replState.activeModel)
  }, [replState.activeModel, readOnlyModels])

  const readOnlyMessage = useMemo(() => {
    return readOnlyModels.get(replState.activeModel)?.message
  }, [replState.activeModel, readOnlyModels])

  const editorInitialOptions = useRef<monaco.editor.IStandaloneEditorConstructionOptions>({
    model: currentTextModel,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    fontSize: userState.editor.fontSize,
    minimap: { enabled: false },
    readOnly: isReadOnly,
    theme: loadedHighlightTheme ?? (theme.isDark ? 'initial-dark' : 'initial-light'),
    quickSuggestions: {
      other: true,
      comments: true,

      // Tailwind CSS intellisense autosuggestion in TSX (otherwise it works only by pressing Ctrl+Space manually, unlike in html/css).
      strings: true,
    },
    tabSize: 2,
    renderLineHighlight: userState.editor.renderLineHighlight,
    lineNumbers: userState.editor.lineNumbers,
  })

  useEffect(() => {
    editorInitialOptions.current.model = currentTextModel
    editorRef.current?.setModel(currentTextModel)
  }, [currentTextModel, editorRef])

  useEffect(() => {
    const options = {
      readOnly: isReadOnly,
      readOnlyMessage: readOnlyMessage ? { value: readOnlyMessage } : undefined,
    }
    Object.assign(editorInitialOptions.current, options)
    editorRef.current?.updateOptions(options)
  }, [isReadOnly, editorRef, readOnlyMessage])

  useEffect(() => {
    const fontSize = userState.editor.fontSize
    editorInitialOptions.current.fontSize = fontSize
    editorRef.current?.updateOptions({ fontSize })
  }, [userState.editor.fontSize, editorRef])

  useEffect(() => {
    const renderLineHighlight = userState.editor.renderLineHighlight
    editorInitialOptions.current.renderLineHighlight = renderLineHighlight
    editorRef.current?.updateOptions({ renderLineHighlight })
  }, [userState.editor.renderLineHighlight, editorRef])

  useEffect(() => {
    const lineNumbers = userState.editor.lineNumbers
    editorInitialOptions.current.lineNumbers = lineNumbers
    editorRef.current?.updateOptions({ lineNumbers })
  }, [userState.editor.lineNumbers, editorRef])

  useEffect(() => {
    if (highlighter && loadedHighlightTheme) {
      editorInitialOptions.current.theme = loadedHighlightTheme

      shikiToMonaco(highlighter, monaco)
      monaco.editor.setTheme(loadedHighlightTheme)
    }
  }, [highlighter, loadedHighlightTheme])

  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current!, editorInitialOptions.current)
    editor.focus()
    setEditor(editor)
    editorRef.current = editor

    return () => {
      editor.dispose()
      setEditor(null)
      editorRef.current = null
    }
  }, [setEditor])

  useCodeEditorDTS(models)
  useCodeEditorRepl(models, { theme })
  useMonacopilot()

  return (
    <div
      ref={containerRef}
      className={cn('bg-editor-background min-h-0 flex-1', codeEditorStyles.codeEditor)}
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

  const prettierFormattingProvider = new PrettierFormattingProvider()
  monaco.languages.registerDocumentFormattingEditProvider(
    SUPPORTED_FORMATTING_LANGUAGES.map((language) => ({ language, exclusive: true })),
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

function setupInitialMonacoThemes() {
  monaco.editor.defineTheme('initial-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#00000000',
      'editor.lineHighlightBackground': '#FFFFFF0F',
      focusBorder: '#00000000',
    },
  })

  monaco.editor.defineTheme('initial-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#00000000',
      'editor.lineHighlightBackground': '#EEEEEE1F',
      focusBorder: '#00000000',
    },
  })
}
