import type {
  CssCodeEditorModel,
  HtmlCodeEditorModel,
  TailwindConfigCodeEditorModel,
  TsxCodeEditorModel,
} from '#imports'
import type { BabelFileResult } from '@babel/core'
import { type SourceMapInput, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
import type { MonacoTailwindcss } from '@nag5000/monaco-tailwindcss'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import { defaultTailwindConfigJson } from '~/utils/tailwind-configs'
import { useBabel } from '@/composables/useBabel'
import { type BabelParseError, isBabelParseError } from '@/types/babel.types'
import type { ReplPayload, ThemeDef } from '@/types/repl.types'
import { cssInject } from '@/utils/css-inject'
import { getNpmPackageFromImportPath } from '@/utils/npm-packages'
import { stringifyPayload } from '@/utils/repl-payload'

export function useCodeEditorRepl(
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null,
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  {
    theme,
    previewIframe,
    onRepl,
    onReplBodyMutation,
  }: {
    theme: Ref<ThemeDef>
    previewIframe: Ref<HTMLIFrameElement | null>
    onRepl: ({ error }: { error: unknown }) => void
    onReplBodyMutation: () => void
  }
) {
  const runtimeConfig = useRuntimeConfig()

  const payloadMap = new Map<number, ReplPayload>()
  const allPayloads = new Set<ReplPayload>()

  let iframeToken = -1
  let delayedUpdateDecorationsTimeoutId: NodeJS.Timeout | undefined

  let decorationsDisposables: (() => void)[] = []
  let decorationUniqIndex = 0
  let monacoTailwindcss: MonacoTailwindcss | null = null
  let configureMonacoTailwindcss:
    | typeof import('@nag5000/monaco-tailwindcss').configureMonacoTailwindcss
    | null = null
  const changedModels = new Set<InstanceType<typeof CodeEditorModel>>()

  const debouncedDoRepl = debounce(doRepl, 300)

  const debouncedUpdateDecorations = debounce(updateDecorations, 1)
  const [babelRef, loadBabel] = useBabel()

  onMounted(async () => {
    ;[, { configureMonacoTailwindcss }] = await Promise.all([
      loadBabel(),
      import('@nag5000/monaco-tailwindcss'),
    ])

    window.addEventListener('message', onMessage)

    models.forEach((model) => {
      changedModels.add(model)
    })

    doRepl()

    models.forEach((model) => {
      model.monacoModel.onDidChangeContent(() => {
        changedModels.add(model)
        debouncedDoRepl()
      })
    })

    watch(theme, () => {
      updateTheme()
    })
  })

  onBeforeUnmount(() => {
    debouncedDoRepl.clear()

    window.removeEventListener('message', onMessage)
    clearTimeout(delayedUpdateDecorationsTimeoutId)
    decorationsDisposables.forEach((d) => d())

    monacoTailwindcss?.dispose()
  })

  return { updateDecorations }

  function updateTheme() {
    previewIframe.value!.contentWindow!.postMessage(
      {
        source: 'jsrepl',
        type: 'update-theme',
        theme: {
          id: theme.value.id,
          isDark: theme.value.isDark,
        },
      },
      runtimeConfig.public.previewUrl
    )
  }

  async function doRepl() {
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
    const themeVal = theme.value

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
      if (!monacoTailwindcss || changedModels.has(tailwindConfigModel)) {
        if (monacoTailwindcss) {
          monacoTailwindcss.setTailwindConfig(tailwindConfig ?? defaultTailwindConfigJson)
        } else {
          monacoTailwindcss = configureMonacoTailwindcss!(monaco, {
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

    previewIframe.value!.contentWindow!.postMessage(
      {
        source: 'jsrepl',
        type: 'repl',
        token: iframeToken,
        jsCode: jsCode ?? '',
        htmlCode: htmlCode,
        cssCode: cssCode,
        importmap: importmap,
        theme: {
          id: themeVal.id,
          isDark: themeVal.isDark,
        },
      },
      runtimeConfig.public.previewUrl
    )

    clearTimeout(delayedUpdateDecorationsTimeoutId)
    delayedUpdateDecorationsTimeoutId = setTimeout(() => {
      updateDecorations()
    }, 1000)

    onRepl({ error: jsError })

    changedModels.clear()
  }

  function handleReplError(error: Error | BabelParseError) {
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
  }

  function onMessage(event: MessageEvent) {
    if (
      event.origin === runtimeConfig.public.previewUrl &&
      event.data?.source === 'jsreplPreview' &&
      event.data.type === 'ready' &&
      event.data.token === -1
    ) {
      doRepl()
      return
    }

    if (
      event.origin === runtimeConfig.public.previewUrl &&
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
        clearTimeout(delayedUpdateDecorationsTimeoutId)
        debouncedUpdateDecorations()
      }

      if (event.data.type === 'body-mutation') {
        onReplBodyMutation()
      }
    }
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

  function updateDecorations() {
    const editor = getEditor()
    const tsxModel = models.get('file:///index.tsx') as TsxCodeEditorModel
    if (!editor || !tsxModel || editor.getModel() !== tsxModel.monacoModel) {
      return
    }

    const payloads = Array.from(payloadMap.values())

    const cssStyles: string[] = []
    const decorationDefs = payloads
      .map((payload) => getDecorDef(payload, cssStyles))
      .filter((x) => x !== null)

    const oldDecorationsDisposables = decorationsDisposables
    decorationsDisposables = []

    oldDecorationsDisposables.forEach((d) => d())
    const decorations = editor.createDecorationsCollection(decorationDefs)
    decorationsDisposables.push(() => decorations.clear())

    const removeStyle = cssInject(cssStyles.join('\n'))
    decorationsDisposables.push(removeStyle)
  }

  function getDecorDef(payload: ReplPayload, cssStylesRef: string[]) {
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
          afterContentClassName: `jsrepl-decor ${uniqClassName} jsrepl-kind-${kind}`,
        },
      }
    } catch (e) {
      console.error('create decoration error', e, payload)
      return null
    }
  }

  async function getTailwindCSSCode({
    tsx,
    html,
    css,
  }: {
    tsx: string
    html: string
    css: string
  }): Promise<string> {
    try {
      return await monacoTailwindcss!.generateStylesFromContent(css, [
        { content: tsx, extension: 'tsx' },
        { content: html, extension: 'html' },
      ])
    } catch (e) {
      console.error('tailwind css error', e)
      return ''
    }
  }
}
