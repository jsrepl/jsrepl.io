import { type Dispatch, type SetStateAction } from 'react'
import type { MonacoTailwindcss } from '@nag5000/monaco-tailwindcss'
import type debounce from 'debounce'
import * as monaco from 'monaco-editor'
import { CodeEditorModel } from '@/lib/code-editor-model'
import { defaultTailwindConfigJson } from '@/lib/tailwind-configs'
import { type BabelParseError, type ReplPayload, type Theme, isBabelParseError } from '@/types'
import { CssCodeEditorModel } from './css-code-editor-model'
import { getBabel } from './get-babel'
import { HtmlCodeEditorModel } from './html-code-editor-model'
import { getNpmPackageFromImportPath } from './npm-packages'
import { getOriginalPosition } from './sourcemap-utils'
import { TailwindConfigCodeEditorModel } from './tailwind-config-code-editor-model'
import { TsxCodeEditorModel } from './tsx-code-editor-model'

let iframeToken = -1
let monacoTailwindcss: MonacoTailwindcss | null = null
let delayedUpdateDecorationsTimeoutId: NodeJS.Timeout
const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL!

export async function sendRepl({
  models,
  configureMonacoTailwindcss,
  changedModels,
  allPayloads,
  payloadMap,
  updateDecorations,
  previewIframe,
  theme,
}: {
  models: Map<string, CodeEditorModel>
  configureMonacoTailwindcss: typeof import('@nag5000/monaco-tailwindcss').configureMonacoTailwindcss
  changedModels: Set<CodeEditorModel>
  allPayloads: Set<ReplPayload>
  payloadMap: Map<number, ReplPayload>
  updateDecorations: () => void
  previewIframe: HTMLIFrameElement
  theme: Theme
}): Promise<() => void> {
  console.log('doRepl')

  iframeToken = (iframeToken + 1) % Number.MAX_VALUE

  const tsxModel = models.get('file:///index.tsx') as TsxCodeEditorModel
  const htmlModel = models.get('file:///index.html') as HtmlCodeEditorModel
  const cssModel = models.get('file:///index.css') as CssCodeEditorModel
  const tailwindConfigModel = models.get(
    'file:///tailwind.config.ts'
  ) as TailwindConfigCodeEditorModel

  const babel = getBabel()[0].value!
  const {
    code: jsCode,
    metadata: jsMetadata,
    error: jsError,
  } = tsxModel.getBabelTransformResult(babel)

  const htmlCode = !jsError ? htmlModel.getValue() : ''
  const { code: tailwindConfig, error: tailwindConfigError } = tailwindConfigModel
    ? tailwindConfigModel.getBabelTransformResult(babel)
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
        monacoTailwindcss = configureMonacoTailwindcss(monaco, {
          tailwindConfig: tailwindConfig ?? defaultTailwindConfigJson,
        })
      }
    }
  }

  const currToken = iframeToken
  const cssCode: string =
    !jsError && !tailwindConfigError
      ? await getTailwindCSSCode(monacoTailwindcss!, {
          tsx: jsCode,
          html: htmlCode,
          css: cssModel.getValue(),
        })
      : cssModel.getValue()

  if (iframeToken !== currToken) {
    throw 'cancelled'
  }

  allPayloads.clear()
  payloadMap.clear()

  if (jsError) {
    handleReplError(jsError, {
      allPayloads,
      payloadMap,
      updateDecorations,
    })
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

  previewIframe.contentWindow!.postMessage(
    {
      source: 'jsrepl',
      type: 'repl',
      token: iframeToken,
      jsCode: jsCode ?? '',
      htmlCode: htmlCode,
      cssCode: cssCode,
      importmap: importmap,
      theme: {
        id: theme.id,
        isDark: theme.isDark,
      },
    },
    previewUrl
  )

  clearTimeout(delayedUpdateDecorationsTimeoutId)
  delayedUpdateDecorationsTimeoutId = setTimeout(() => {
    updateDecorations()
  }, 1000)

  return () => {
    clearTimeout(delayedUpdateDecorationsTimeoutId)
    monacoTailwindcss?.dispose()
    monacoTailwindcss = null
  }
}

export async function updatePreviewTheme(previewIframe: HTMLIFrameElement, theme: Theme) {
  previewIframe.contentWindow!.postMessage(
    {
      source: 'jsrepl',
      type: 'update-theme',
      theme: {
        id: theme.id,
        isDark: theme.isDark,
      },
    },
    previewUrl
  )
}

export async function onPreviewMessage(
  event: MessageEvent,
  {
    setPreviewIframeReadyId,
    allPayloads,
    payloadMap,
    models,
    debouncedUpdateDecorations,
  }: {
    setPreviewIframeReadyId: Dispatch<SetStateAction<string | null>>
    allPayloads: Set<ReplPayload>
    payloadMap: Map<number, ReplPayload>
    models: Map<string, CodeEditorModel>
    debouncedUpdateDecorations: debounce.DebouncedFunction<() => void>
  }
) {
  if (
    event.origin === previewUrl &&
    event.data?.source === 'jsreplPreview' &&
    event.data.type === 'ready' &&
    event.data.token === -1
  ) {
    console.log('jsreplPreview ready')
    setPreviewIframeReadyId(event.data.previewId as string)
    return
  }

  if (
    event.origin === previewUrl &&
    event.data?.source === 'jsreplPreview' &&
    event.data.token === iframeToken
  ) {
    if (event.data.type === 'repl') {
      const payload = event.data.payload as ReplPayload

      if (payload.ctx.kind === 'error') {
        const babel = getBabel()[0].value!
        const tsxModel = models.get('file:///index.tsx') as TsxCodeEditorModel
        const { sourcemap } = tsxModel.getBabelTransformResult(babel)
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
  }
}

function handleReplError(
  error: Error | BabelParseError,
  {
    allPayloads,
    payloadMap,
    updateDecorations,
  }: {
    allPayloads: Set<ReplPayload>
    payloadMap: Map<number, ReplPayload>
    updateDecorations: () => void
  }
) {
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

async function getTailwindCSSCode(
  monacoTailwindcss: MonacoTailwindcss,
  {
    tsx,
    html,
    css,
  }: {
    tsx: string
    html: string
    css: string
  }
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
