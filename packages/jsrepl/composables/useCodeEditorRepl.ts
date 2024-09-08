import { useBabel } from '@/composables/useBabel'
import { type BabelParseError, isBabelParseError } from '@/types/babel.types'
import { type ReplPayload, type ThemeDef } from '@/types/repl.types'
import { cssInject } from '@/utils/css-inject'
import type { CssModelShared } from '@/utils/css-model-shared'
import type { HtmlModelShared } from '@/utils/html-model-shared'
import { getNpmPackageFromImportPath } from '@/utils/npm-packages'
import { stringifyPayload } from '@/utils/repl-payload'
import type { TsxModelShared } from '@/utils/tsx-model-shared'
import type { BabelFileResult } from '@babel/core'
import { type SourceMapInput, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
import type { MonacoTailwindcss } from '@nag5000/monaco-tailwindcss'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'

export function useCodeEditorRepl(
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null,
  getTsxModelShared: () => TsxModelShared | null,
  getHtmlModelShared: () => HtmlModelShared | null,
  getCssModelShared: () => CssModelShared | null,
  {
    monacoTailwindcssPromise,
    theme,
    previewIframe,
    onRepl,
    onReplBodyMutation,
  }: {
    monacoTailwindcssPromise: Promise<MonacoTailwindcss>
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

  let decorations: monaco.editor.IEditorDecorationsCollection
  let decorationsDisposables: (() => void)[] = []
  let decorationUniqIndex = 0
  let monacoTailwindcss: MonacoTailwindcss | null = null

  const debouncedDoRepl = debounce(doRepl, 300)

  const debouncedUpdateDecorations = debounce(updateDecorations, 1)
  const [babel, loadBabel] = useBabel()

  onMounted(async () => {
    ;[, monacoTailwindcss] = await Promise.all([loadBabel(), monacoTailwindcssPromise])

    window.addEventListener('message', onMessage)

    const tsxModelShared = getTsxModelShared()!
    const htmlModelShared = getHtmlModelShared()!
    const cssModelShared = getCssModelShared()!

    doRepl()

    tsxModelShared.model.onDidChangeContent(() => {
      debouncedDoRepl()
    })

    htmlModelShared.model.onDidChangeContent(() => {
      debouncedDoRepl()
    })

    cssModelShared.model.onDidChangeContent(() => {
      debouncedDoRepl()
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

    const tsxModelShared = getTsxModelShared()!
    const htmlModelShared = getHtmlModelShared()!
    const cssModelShared = getCssModelShared()!

    const {
      code: jsCode,
      metadata: jsMetadata,
      error: jsError,
    } = tsxModelShared.getBabelTransformResult(babel.value!)
    const themeVal = theme.value

    const htmlCode = !jsError ? htmlModelShared.getValue() : ''

    const currToken = iframeToken
    const cssCode: string = !jsError
      ? await getTailwindCSSCode(monacoTailwindcss!, {
          tsx: tsxModelShared.getValue(),
          html: htmlModelShared.getValue(),
          css: cssModelShared.getValue(),
        })
      : ''

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
          const tsxModelShared = getTsxModelShared()!
          const { sourcemap } = tsxModelShared.getBabelTransformResult(babel.value!)
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
    const tsxModelShared = getTsxModelShared()
    if (!editor || !tsxModelShared || editor.getModel() !== tsxModelShared.model) {
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
    decorations = editor.createDecorationsCollection(decorationDefs)
    decorationsDisposables.push(() => decorations.clear())

    const removeStyle = cssInject(cssStyles.join('\n'))
    decorationsDisposables.push(removeStyle)
  }

  function getDecorDef(payload: ReplPayload, cssStylesRef: string[]) {
    try {
      const { /* result, */ ctx } = payload
      const { lineStart, kind /* lineEnd, colStart, colEnd, source */ } = ctx
      const uniqClassName = `jsrepl-decor-${decorationUniqIndex++}`

      const stringifiedPayload = stringifyPayload(payload, babel.value!)
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

  async function getTailwindCSSCode(
    monacoTailwindcss: MonacoTailwindcss,
    { tsx, html, css }: { tsx: string; html: string; css: string }
  ): Promise<string> {
    try {
      return await monacoTailwindcss.generateStylesFromContent(css, [
        { content: tsx, extension: 'tsx' },
        { content: html, extension: 'html' },
      ])
    } catch (e) {
      console.error('tailwind css error', e)
      return ''
    }
  }
}
