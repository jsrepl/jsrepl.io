import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BabelFileResult } from '@babel/core'
import { type SourceMapInput, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
import type { MonacoTailwindcss } from '@nag5000/monaco-tailwindcss'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import codeEditorStyles from '@/app/repl/components/code-editor.module.css'
import { CodeEditorModel } from '@/lib/code-editor-model'
import { CssCodeEditorModel } from '@/lib/css-code-editor-model'
import { cssInject } from '@/lib/css-inject'
import { getBabel } from '@/lib/get-babel'
import { HtmlCodeEditorModel } from '@/lib/html-code-editor-model'
import { getNpmPackageFromImportPath } from '@/lib/npm-packages'
import { stringifyPayload } from '@/lib/repl-payload'
import { TailwindConfigCodeEditorModel } from '@/lib/tailwind-config-code-editor-model'
import { defaultTailwindConfigJson } from '@/lib/tailwind-configs'
import { TsxCodeEditorModel } from '@/lib/tsx-code-editor-model'
import { type BabelParseError, type ReplPayload, type ThemeDef, isBabelParseError } from '@/types'

let iframeToken = -1
let decorationUniqIndex = 0

export default function useCodeEditorRepl(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  {
    theme,
    onRepl,
    onReplBodyMutation,
  }: { theme: ThemeDef; onRepl: () => void; onReplBodyMutation: () => void }
) {
  const previewUrl = useRef(process.env.NEXT_PUBLIC_PREVIEW_URL!)

  const payloadMap = useMemo(() => new Map<number, ReplPayload>(), [])
  const allPayloads = useMemo(() => new Set<ReplPayload>(), [])
  const delayedUpdateDecorationsTimeoutId = useRef<NodeJS.Timeout>()
  const changedModels = useMemo(() => new Set<InstanceType<typeof CodeEditorModel>>(), [])
  const decorationsDisposables = useRef<(() => void)[]>([])
  const previewIframe = useRef<HTMLIFrameElement>()
  const themeRef = useRef(theme)
  const [previewIframeReady, setPreviewIframeReady] = useState(false)
  const [depsReady, setDepsReady] = useState(false)

  const monacoTailwindcss = useRef<MonacoTailwindcss>()
  const configureMonacoTailwindcss =
    useRef<typeof import('@nag5000/monaco-tailwindcss').configureMonacoTailwindcss>()

  const [babelRef, loadBabel] = useMemo(() => getBabel(), [])

  const updatePreviewTheme = useCallback((theme: ThemeDef) => {
    previewIframe.current!.contentWindow!.postMessage(
      {
        source: 'jsrepl',
        type: 'update-theme',
        theme: {
          id: theme.id,
          isDark: theme.isDark,
        },
      },
      previewUrl.current
    )
  }, [])

  const getDecorDef = useCallback(
    (payload: ReplPayload, cssStylesRef: string[]): monaco.editor.IModelDeltaDecoration | null => {
      try {
        const { /* result, */ ctx } = payload
        const { lineStart, kind /* lineEnd, colStart, colEnd, source */ } = ctx
        const uniqClassName = `jsrepl-decor-${decorationUniqIndex++}`

        const stringifiedPayload = stringifyPayload(payload, babelRef.value!)
        if (stringifiedPayload === null) {
          return null
        }

        const valueCssVar = CSS.escape(stringifiedPayload)
        cssStylesRef.push(`.${uniqClassName}::after { --value: "${valueCssVar}"; }`)

        return {
          // line starts with 1, column starts with 1
          range: new monaco!.Range(lineStart, 1, lineStart, 1),
          options: {
            isWholeLine: true,
            afterContentClassName: `${codeEditorStyles.jsreplDecor} ${codeEditorStyles[`jsreplDecor-${kind}`] ?? ''} ${uniqClassName}`,
          },
        }
      } catch (e) {
        console.error('create decoration error', e, payload)
        return null
      }
    },
    [babelRef]
  )

  const updateDecorations = useCallback(() => {
    const editor = editorRef.current!
    const tsxModel = models.get('file:///index.tsx') as TsxCodeEditorModel
    if (!editor || !tsxModel || editor.getModel() !== tsxModel.monacoModel) {
      return
    }

    const payloads = Array.from(payloadMap.values())

    const cssStyles: string[] = []
    const decorationDefs = payloads
      .map((payload) => getDecorDef(payload, cssStyles))
      .filter((x) => x !== null)

    const oldDecorationsDisposables = decorationsDisposables.current
    decorationsDisposables.current = []

    oldDecorationsDisposables.forEach((d) => d())
    const decorations = editor.createDecorationsCollection(decorationDefs)
    decorationsDisposables.current.push(() => decorations.clear())

    const removeStyle = cssInject(cssStyles.join('\n'))
    decorationsDisposables.current.push(removeStyle)
  }, [editorRef, models, getDecorDef, payloadMap])

  const getTailwindCSSCode = useCallback(
    async ({ tsx, html, css }: { tsx: string; html: string; css: string }): Promise<string> => {
      try {
        return await monacoTailwindcss.current!.generateStylesFromContent(css, [
          { content: tsx, extension: 'tsx' },
          { content: html, extension: 'html' },
        ])
      } catch (e) {
        console.error('tailwind css error', e)
        return ''
      }
    },
    []
  )

  const handleReplError = useCallback(
    (error: Error | BabelParseError) => {
      if (isBabelParseError(error)) {
        const payload = {
          isPromise: false as const,
          promiseInfo: undefined,
          isError: true,
          // HACK: `error.clone()` removes "codeFrame" part from error message
          result: error.clone(),
          ctx: {
            id: -2,
            lineStart: error.loc?.line ?? 1,
            lineEnd: error.loc?.line ?? 1,
            colStart: error.loc?.column ?? 0,
            colEnd: error.loc?.column ?? 0,
            source: '',
            kind: 'babel-parse-error' as const,
          },
        }

        allPayloads.add(payload)
        payloadMap.set(payload.ctx.id, payload)

        updateDecorations()
      }

      console.groupCollapsed(
        '%cREPL%c %s',
        'color: light-dark(#410E0B, #FADEDC); background-color: light-dark(#FCEBEB, #4E3534); border-radius: 2px; padding: 1px 4px;',
        'font-weight: 400;',
        error.message
      )
      console.warn(error)
      console.groupEnd()
    },
    [allPayloads, payloadMap, updateDecorations]
  )

  const doRepl = useCallback(async () => {
    console.log('doRepl')

    iframeToken = (iframeToken + 1) % Number.MAX_VALUE

    const tsxModel = models.get('file:///index.tsx') as TsxCodeEditorModel
    const htmlModel = models.get('file:///index.html') as HtmlCodeEditorModel
    const cssModel = models.get('file:///index.css') as CssCodeEditorModel
    const tailwindConfigModel = models.get(
      'file:///tailwind.config.ts'
    ) as TailwindConfigCodeEditorModel

    const {
      code: jsCode,
      metadata: jsMetadata,
      error: jsError,
    } = tsxModel.getBabelTransformResult(babelRef.value!)

    const htmlCode = !jsError ? htmlModel.getValue() : ''
    const { code: tailwindConfig, error: tailwindConfigError } = tailwindConfigModel
      ? tailwindConfigModel.getBabelTransformResult(babelRef.value!)
      : { code: null, error: null }

    if (tailwindConfigError) {
      console.groupCollapsed(
        '%cREPL%c %s',
        'color: light-dark(#410E0B, #FADEDC); background-color: light-dark(#FCEBEB, #4E3534); border-radius: 2px; padding: 1px 4px;',
        'font-weight: 400;',
        'tailwind config error'
      )
      console.warn(tailwindConfigError)
      console.groupEnd()
    }

    if (!tailwindConfigError) {
      if (!monacoTailwindcss.current || changedModels.has(tailwindConfigModel)) {
        if (monacoTailwindcss.current) {
          monacoTailwindcss.current.setTailwindConfig(tailwindConfig ?? defaultTailwindConfigJson)
        } else {
          monacoTailwindcss.current = configureMonacoTailwindcss.current!(monaco, {
            tailwindConfig: tailwindConfig ?? defaultTailwindConfigJson,
          })
        }
      }
    }

    const currToken = iframeToken
    const cssCode: string =
      !jsError && !tailwindConfigError
        ? await getTailwindCSSCode({
            tsx: jsCode,
            html: htmlCode,
            css: cssModel.getValue(),
          })
        : cssModel.getValue()

    if (iframeToken !== currToken) {
      return
    }

    allPayloads.clear()
    payloadMap.clear()

    if (jsError) {
      handleReplError(jsError)
    }

    const packages: Set<string> = new Set(
      jsMetadata?.importPaths
        ?.map((importPath) => getNpmPackageFromImportPath(importPath))
        .filter((moduleName) => moduleName !== null) ?? []
    )

    const importmap = {
      imports: Array.from(packages).reduce(
        (acc, packageName) => {
          acc[packageName] = `https://esm.sh/${packageName}`
          return acc
        },
        {} as Record<string, string>
      ),
    }

    previewIframe.current!.contentWindow!.postMessage(
      {
        source: 'jsrepl',
        type: 'repl',
        token: iframeToken,
        jsCode: jsCode ?? '',
        htmlCode: htmlCode,
        cssCode: cssCode,
        importmap: importmap,
        theme: {
          id: themeRef.current.id,
          isDark: themeRef.current.isDark,
        },
      },
      previewUrl.current
    )

    clearTimeout(delayedUpdateDecorationsTimeoutId.current)
    delayedUpdateDecorationsTimeoutId.current = setTimeout(() => {
      updateDecorations()
    }, 1000)

    onRepl()

    changedModels.clear()
  }, [
    allPayloads,
    babelRef,
    changedModels,
    getTailwindCSSCode,
    handleReplError,
    models,
    onRepl,
    payloadMap,
    updateDecorations,
  ])

  const debouncedDoRepl = useMemo(() => debounce(doRepl, 300), [doRepl])

  const debouncedUpdateDecorations = useMemo(
    () => debounce(updateDecorations, 1),
    [updateDecorations]
  )

  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (
        event.origin === previewUrl.current &&
        event.data?.source === 'jsreplPreview' &&
        event.data.type === 'ready' &&
        event.data.token === -1
      ) {
        console.log('jsreplPreview ready')
        setPreviewIframeReady(true)
        return
      }

      if (
        event.origin === previewUrl.current &&
        event.data?.source === 'jsreplPreview' &&
        event.data.token === iframeToken
      ) {
        if (event.data.type === 'repl') {
          const payload = event.data.payload as ReplPayload

          if (payload.ctx.kind === 'error') {
            const tsxModel = models.get('file:///index.tsx') as TsxCodeEditorModel
            const { sourcemap } = tsxModel.getBabelTransformResult(babelRef.value!)
            if (sourcemap) {
              const { line, column } = getOriginalPosition(
                sourcemap,
                payload.ctx.lineStart,
                payload.ctx.colStart
              )
              payload.ctx.lineStart = line ?? 1
              payload.ctx.lineEnd = line ?? 1
              payload.ctx.colStart = column ?? 0
              payload.ctx.colEnd = column ?? 0
            }
          }

          allPayloads.add(payload)
          payloadMap.set(payload.ctx.id, payload)
        }

        if (event.data.type === 'repl' || event.data.type === 'script-complete') {
          clearTimeout(delayedUpdateDecorationsTimeoutId.current)
          debouncedUpdateDecorations()
        }

        if (event.data.type === 'body-mutation') {
          onReplBodyMutation()
        }
      }
    },
    [payloadMap, allPayloads, babelRef, debouncedUpdateDecorations, models, onReplBodyMutation]
  )

  useEffect(() => {
    previewIframe.current = document.getElementById('preview-iframe') as HTMLIFrameElement
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(delayedUpdateDecorationsTimeoutId.current)
      decorationsDisposables.current.forEach((d) => d())
      monacoTailwindcss.current?.dispose()
    }
  }, [])

  useEffect(() => {
    return () => {
      debouncedDoRepl.clear()
    }
  }, [debouncedDoRepl])

  useEffect(() => {
    return () => {
      debouncedUpdateDecorations.clear()
    }
  }, [debouncedUpdateDecorations])

  useEffect(() => {
    models.forEach((model) => {
      changedModels.add(model)
    })

    Promise.all([loadBabel(), import('@nag5000/monaco-tailwindcss')]).then(
      ([, { configureMonacoTailwindcss: _configureMonacoTailwindcss }]) => {
        configureMonacoTailwindcss.current = _configureMonacoTailwindcss
        console.log('deps ready')
        setDepsReady(true)
      }
    )
  }, [loadBabel, models, changedModels])

  useEffect(() => {
    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        changedModels.add(model)
        debouncedDoRepl()
      })
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [models, debouncedDoRepl, changedModels])

  useEffect(() => {
    themeRef.current = theme
    if (previewIframeReady) {
      updatePreviewTheme(theme)
    }
  }, [theme, previewIframeReady, updatePreviewTheme])

  useEffect(() => {
    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [onMessage])

  useEffect(() => {
    if (depsReady && previewIframeReady) {
      doRepl()
    }
  }, [depsReady, previewIframeReady, doRepl])

  return { updateDecorations }
}

// line starts with 1, column starts with 0
function getOriginalPosition(
  sourcemap: BabelFileResult['map'],
  line: number,
  column: number
): { line: number | null; column: number | null } {
  if (line < 1 || column < 0) {
    console.error(`getOriginalPosition: invalid position ${line}:${column}`)
    return { line: null, column: null }
  }

  try {
    const tracer = new TraceMap(sourcemap as SourceMapInput)
    const originalPosition = originalPositionFor(tracer, { line, column })
    return originalPosition
  } catch (e) {
    console.error('getOriginalPosition error', e)
    return { line: null, column: null }
  }
}
