import {
  type ReplPayload,
  ReplPayloadContextKind,
  ReplPayloadError,
  ReplPayloadWarning,
  type Theme,
  type UpdateReplMessageData,
} from '@jsrepl/shared-types'
import type { MonacoTailwindcss, TailwindConfig } from '@nag5000/monaco-tailwindcss'
import * as Comlink from 'comlink'
import type * as esbuild from 'esbuild-wasm'
import * as monaco from 'monaco-editor'
import { type BuildResult } from '@/lib/bundler/bundler-worker'
import { getBundler } from '@/lib/bundler/get-bundler'
import type { CodeEditorModel } from '@/lib/code-editor-model'
import { DebugLog, debugLog } from '@/lib/debug-log'
import { type ImportMap, type ReplInfo } from '@/types'
import { isBabelParseEsbuildError } from '../bundler/utils'
import { consoleLogRepl } from '../console-utils'
import { getPackageUrl } from '../package-provider'
import { type ReplData, replDataRef } from './data'

const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL!

let monacoTailwindcss: MonacoTailwindcss | null = null

let _abortController: AbortController | null = null

let replIndex = 0

export function abortRepl() {
  if (_abortController && !_abortController.signal.aborted) {
    _abortController.abort()
  }
}

export async function sendRepl({
  models,
  addPayload,
  previewIframe,
  theme,
  packageProvider,
}: {
  models: Map<string, CodeEditorModel>
  addPayload: (token: number | string, payload: ReplPayload) => void
  previewIframe: HTMLIFrameElement
  theme: Theme
  packageProvider: 'auto' | 'esm.sh' | 'esm.sh-proxy'
}): Promise<ReplInfo> {
  const replData: ReplData = replDataRef.current
  const token = replDataRef.current.token

  abortRepl()

  const abortController = (_abortController = new AbortController())
  const checkAborted = () => {
    if (abortController && abortController.signal.aborted) {
      throw 'aborted'
    }

    if (token !== replDataRef.current.token) {
      throw 'aborted'
    }
  }

  consoleLogRepl('debug', `%c REPL begin (${++replIndex})`, 'font-weight: bold;')

  const input: Record<string, string> = {}
  const entryPoints: string[] = []

  // TODO: something can be cached here and reused later, in case of html content and set of scripts/styles were not changed.
  const previewDoc = document.implementation.createHTMLDocument('JSRepl Preview')
  const htmlModel = models.get('/index.html')
  if (htmlModel) {
    previewDoc.open()
    previewDoc.write(htmlModel.getValue())
    previewDoc.close()

    // Include it so tailwindcss will pick it up when processing css.
    input[htmlModel.filePath] = htmlModel.getValue()

    // Include it so it will be present in the output bundle.
    entryPoints.push(htmlModel.filePath)
  } else {
    for (const model of models.values()) {
      if (model.kind === 'client-script') {
        const script = previewDoc.createElement('script')
        script.type = 'module'
        script.src = model.filePath
        previewDoc.head.appendChild(script)
      }
    }
  }

  for (const model of models.values()) {
    const { filePath, kind } = model

    switch (kind) {
      case 'tailwind-config':
        input[filePath] = model.getValue()
        entryPoints.push(filePath)
        break
      case 'stylesheet':
      case 'client-script':
        input[filePath] = model.getValue()
        break
    }
  }

  const entryPointScripts: HTMLScriptElement[] = Array.from(previewDoc.scripts).filter(
    (script) => script.src && !script.src.startsWith('data:')
  )

  const entryPointStylesheets: HTMLLinkElement[] = Array.from(
    previewDoc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  ).filter((styleSheet) => styleSheet.href && !styleSheet.href.startsWith('data:'))

  entryPointScripts.forEach((script) => {
    entryPoints.push(script.src)
  })

  entryPointStylesheets.forEach((styleSheet) => {
    entryPoints.push(styleSheet.href)
  })

  const bundler = getBundler()

  const options: Omit<esbuild.BuildOptions, 'plugins'> = {
    bundle: true,
    packages: 'external',
    platform: 'neutral',
    outdir: '.',
    entryPoints,
    sourcemap: 'both',
    metafile: true,
    jsx: 'automatic',
    loader: {
      '.html': 'copy',
    },
  }

  debugLog(DebugLog.REPL, 'esbuild input', input)
  debugLog(DebugLog.REPL, 'esbuild options', options)

  const bundle: BuildResult = await bundler.build(
    {
      input,
      options,
    },
    Comlink.proxy(setTailwindConfig),
    Comlink.proxy(processCSSWithTailwind)
  )

  checkAborted()

  replData.bundle = bundle
  debugLog(DebugLog.REPL, 'esbuild bundle', bundle)

  const bundleErrors: esbuild.Message[] = [
    ...(bundle.error?.errors ?? []),
    ...(bundle.result?.errors ?? []),
  ]

  const bundleWarnings: esbuild.Message[] = [
    ...(bundle.error?.warnings ?? []),
    ...(bundle.result?.warnings ?? []),
  ]

  for (const error of bundleErrors) {
    const payload = getPayloadFromEsbuildMessage(error, ReplPayloadContextKind.Error)
    addPayload(token, payload)
  }

  for (const warning of bundleWarnings) {
    const payload = getPayloadFromEsbuildMessage(warning, ReplPayloadContextKind.Warning)
    addPayload(token, payload)
  }

  if (bundle.ok) {
    processPreviewDoc(previewDoc, {
      bundle,
      theme,
      token,
      entryPointScripts,
      entryPointStylesheets,
      packageProvider,
    })

    const srcdoc = previewDoc.documentElement.outerHTML

    if (!previewIframe.contentWindow) {
      throw 'aborted'
    }

    previewIframe.contentWindow.postMessage(
      {
        source: 'jsrepl',
        type: 'repl',
        token,
        srcdoc,
      } as UpdateReplMessageData,
      previewUrl
    )
  }

  if (bundle.error) {
    consoleLogRepl('error', bundle.error.message)
  }

  const replInfo: ReplInfo = {
    ok: bundle.ok,
    masterErrorMessage: bundle.error?.message,
    errors: bundleErrors,
    warnings: bundleWarnings,
  }

  return replInfo
}

function processPreviewDoc(
  doc: Document,
  data: {
    bundle: BuildResult
    theme: Pick<Theme, 'id' | 'isDark'>
    token: number
    entryPointScripts: HTMLScriptElement[]
    entryPointStylesheets: HTMLLinkElement[]
    packageProvider: 'auto' | 'esm.sh' | 'esm.sh-proxy'
  }
) {
  const { bundle, theme, token, entryPointScripts, entryPointStylesheets, packageProvider } = data
  const result = bundle.result!

  // OutputFile.path starts with '/'.
  const outputFiles = result.outputFiles!

  // Metafile.inputs and Metafile.outputs do not have leading '/'.
  const metafile = result.metafile!

  doc.documentElement.dataset.token = token.toString()
  doc.documentElement.classList.toggle('dark', theme.isDark)

  const headFragment = doc.createDocumentFragment()

  const metaColorScheme = doc.createElement('meta')
  metaColorScheme.name = 'color-scheme'
  metaColorScheme.content = theme.isDark ? 'dark light' : 'light dark'
  headFragment.appendChild(metaColorScheme)

  const packages: Set<string> = new Set(
    Object.values(metafile.outputs)
      .flatMap((x) => x.imports)
      .filter(
        (x) =>
          x.external &&
          (x.kind === 'import-statement' ||
            x.kind === 'require-call' ||
            x.kind === 'dynamic-import' ||
            x.kind === 'require-resolve')
      )
      .map((x) => x.path)
  )

  const importmap: ImportMap = {
    imports: Array.from(packages).reduce(
      (acc, packageName) => {
        const packageUrl = getPackageUrl(packageProvider, packageName)
        acc[packageName] = packageUrl
        return acc
      },
      {} as ImportMap['imports']
    ),
  }

  const importmapScript = doc.createElement('script')
  importmapScript.type = 'importmap'
  importmapScript.textContent = JSON.stringify(importmap)
  headFragment.appendChild(importmapScript)

  const setupScript = doc.createElement('script')
  setupScript.type = 'module'
  setupScript.textContent = `window.parent.hooks.setup(window, ${token})`
  headFragment.appendChild(setupScript)

  const entryPointSrc2Outputs = (src: string) => {
    src = src.replace(/^\.?\//, '')

    const [outputFilePath /* don't have leading "/" */, metafileOutput] =
      Object.entries(metafile.outputs).find(
        ([, output]) => output.entryPoint /* don't have leading "/" */ === src
      ) ?? []

    const outputFile = outputFilePath
      ? outputFiles.find((x) => x.path /* starts with "/" */ === '/' + outputFilePath)
      : undefined

    return { outputFile, metafileOutput }
  }

  for (const link of entryPointStylesheets) {
    const { outputFile } = entryPointSrc2Outputs(link.href!)
    if (outputFile) {
      link.href = 'data:text/css;base64,' + btoa(outputFile.text)
      link.dataset.path = outputFile.path
    }
  }

  for (const script of entryPointScripts) {
    const { outputFile, metafileOutput } = entryPointSrc2Outputs(script.src!)
    if (outputFile) {
      script.src = 'data:text/javascript;base64,' + btoa(outputFile.text)
      script.type = 'module'
      script.dataset.path = outputFile.path
    }

    const cssOutputFile = metafileOutput?.cssBundle
      ? outputFiles.find(
          (x) =>
            x.path /* starts with "/" */ ===
            '/' + metafileOutput.cssBundle /* don't have leading "/" */
        )
      : undefined

    if (cssOutputFile) {
      const link = doc.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'data:text/css;base64,' + btoa(cssOutputFile.text)
      link.dataset.path = cssOutputFile.path
      headFragment.appendChild(link)
    }
  }

  doc.head.prepend(headFragment)

  const afterJsScript = doc.createElement('script')
  afterJsScript.type = 'module'
  afterJsScript.textContent = `window.parent.hooks.afterJsScript(window, ${token})`
  doc.body.appendChild(afterJsScript)
}

async function setTailwindConfig(tailwindConfig: string | TailwindConfig) {
  if (monacoTailwindcss) {
    monacoTailwindcss.setTailwindConfig(tailwindConfig)
  } else {
    const { configureMonacoTailwindcss } = await import('@nag5000/monaco-tailwindcss')
    monacoTailwindcss = configureMonacoTailwindcss(monaco, { tailwindConfig })
  }
}

async function processCSSWithTailwind(
  css: string,
  content: { content: string; extension: string }[]
): Promise<string> {
  if (!monacoTailwindcss) {
    throw new Error('monacoTailwindcss is not initialized')
  }

  const result = await monacoTailwindcss.generateStylesFromContent(css, content)
  return result
}

function getPayloadFromEsbuildMessage(
  msg: esbuild.Message,
  kind: ReplPayloadContextKind.Error | ReplPayloadContextKind.Warning
): ReplPayloadError | ReplPayloadWarning {
  let filePath = msg.location?.file ?? ''
  if (filePath && !filePath.startsWith('/')) {
    filePath = '/' + filePath
  }

  const isBabelParseError = isBabelParseEsbuildError(msg)
  const text = isBabelParseError ? msg.detail.shortMessage : msg.text

  const commonPart = {
    id: crypto.randomUUID(),
    isError: true,
    result: text,
    timestamp: Date.now(),
    ctx: {
      id: `bundle-${kind}-${msg.id}-${msg.location?.file}-${msg.location?.line}:${msg.location?.column}`,
      lineStart: msg.location?.line ?? 1,
      lineEnd: msg.location?.line ?? 1,
      colStart: (msg.location?.column ?? 0) + 1,
      colEnd: (msg.location?.column ?? 0) + 1,
      source: '',
      filePath,
    },
  }

  let payload: ReplPayloadError | ReplPayloadWarning

  if (kind === ReplPayloadContextKind.Error) {
    payload = { ...commonPart, ctx: { ...commonPart.ctx, kind } }
  } else {
    payload = { ...commonPart, ctx: { ...commonPart.ctx, kind } }
  }

  return payload
}

export function dispose() {
  monacoTailwindcss?.dispose()
  monacoTailwindcss = null
}
