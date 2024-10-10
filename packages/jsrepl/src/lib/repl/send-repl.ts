import type { MonacoTailwindcss } from '@nag5000/monaco-tailwindcss'
import * as Comlink from 'comlink'
import type * as esbuild from 'esbuild-wasm'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import { assert } from '@/lib/assert'
import { type BuildResult } from '@/lib/bundler/bundler-worker'
import { getBundler } from '@/lib/bundler/get-bundler'
import type { CodeEditorModel } from '@/lib/code-editor-models/code-editor-model'
import { CssCodeEditorModel } from '@/lib/code-editor-models/css-code-editor-model'
import { HtmlCodeEditorModel } from '@/lib/code-editor-models/html-code-editor-model'
import { JsCodeEditorModel } from '@/lib/code-editor-models/js-code-editor-model'
import { TailwindConfigCodeEditorModel } from '@/lib/code-editor-models/tailwind-config-code-editor-model'
import { defaultTailwindConfigJson } from '@/lib/tailwind-configs'
import { type ImportMap, Output, type ReplPayload, type Theme } from '@/types'
import { type ReplData, replDataRef } from './data'

const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL!

let monacoTailwindcss: MonacoTailwindcss | null = null

// let delayedUpdateDecorationsTimeoutId: NodeJS.Timeout
let _abortController: AbortController | null = null

const knownConfigRegexes: RegExp[] = [/tailwind\.config\.js$/]

export async function sendRepl({
  models,
  allPayloads,
  payloadMap,
  updateDecorations,
  previewIframe,
  theme,
}: {
  models: Map<string, CodeEditorModel>
  allPayloads: Set<ReplPayload>
  payloadMap: Map<number | string, ReplPayload>
  updateDecorations: () => void
  previewIframe: HTMLIFrameElement
  theme: Theme
}): Promise<() => void> {
  if (_abortController && !_abortController.signal.aborted) {
    _abortController.abort()
  }

  const abortController = (_abortController = new AbortController())
  const checkAborted = () => {
    if (abortController && abortController.signal.aborted) {
      throw 'aborted'
    }
  }

  const replData: ReplData = (replDataRef.current = {
    token: (replDataRef.current.token + 1) % Number.MAX_VALUE,
    bundle: null,
    output: null,
  })

  const modelsArray = Array.from(models.values())
  const jsModels: JsCodeEditorModel[] = modelsArray.filter(
    (model) => model instanceof JsCodeEditorModel
  )
  const cssModels: CssCodeEditorModel[] = modelsArray.filter(
    (model) => model instanceof CssCodeEditorModel
  )
  const htmlModel = models.get('/index.html') as HtmlCodeEditorModel | undefined
  const tailwindConfigModel = (models.get('/tailwind.config.ts') ??
    models.get('/tailwind.config.js')) as TailwindConfigCodeEditorModel | undefined

  // const babel = getBabel()[0].value!

  const previewDoc = document.implementation.createHTMLDocument('JSRepl Preview')
  if (htmlModel) {
    previewDoc.open()
    previewDoc.write(htmlModel.getValue())
    previewDoc.close()
  }

  const previewDocScriptsSrcArray = Array.from(previewDoc.scripts).map((script) => script.src)

  // TODO: CodeEditorModel's know about cache (getValue returns cached value if file is not changed).
  // Can we (re)use it for esbuild cache somehow?, so esbuild doesn't need to re-transpile unchanged files?
  // or it is tricky and maybe not worth it? I mean one file can affect another, etc, they are not independent in general.
  const input: Record<string, string> = {}

  const entryPoints: string[] = []

  if (htmlModel) {
    input[htmlModel.monacoModel.uri.path] = htmlModel.getValue()
    entryPoints.push(htmlModel.monacoModel.uri.path)
  }

  if (tailwindConfigModel) {
    input[tailwindConfigModel.monacoModel.uri.path] = tailwindConfigModel.getValue()
    entryPoints.push(tailwindConfigModel.monacoModel.uri.path)
  }

  for (const model of jsModels) {
    const filePath = model.monacoModel.uri.path
    input[filePath] = model.getValue()

    if (
      // TODO: (???) !htmlModel ||
      previewDocScriptsSrcArray.includes(filePath /* /file.ts */) ||
      previewDocScriptsSrcArray.includes('.' + filePath /* ./file.ts */) ||
      previewDocScriptsSrcArray.includes(filePath.replace(/^\//, '') /* file.ts */)
    ) {
      entryPoints.push(filePath)
    }
  }

  if (
    entryPoints.length === 0
    /* && !htmlModel */ // TODO: tmp. Decide whether it's default behavior or not. If not, don't forget to do migration from old repls. NOTE:!!! The same behavior should be for index.css!
    // NOTE:!!! The same behavior should be for index.css!
  ) {
    const model =
      models.get('/index.ts') ||
      models.get('/index.tsx') ||
      models.get('/index.js') ||
      models.get('/index.jsx')
    if (model) {
      entryPoints.push(model.monacoModel.uri.path)
    }
  }

  for (const model of cssModels) {
    const filePath = model.monacoModel.uri.path
    input[filePath] = model.getValue()
  }

  // const external = transpiledJsArray
  //   .map((x) => x.metadata?.importPaths ?? [])
  //   .flat()
  //   .filter((x) => !x.startsWith('./'))

  const bundler = getBundler()
  const bundle: BuildResult = await bundler.build(
    {
      input,
      options: {
        bundle: true,
        //external,
        packages: 'external',
        platform: 'neutral',
        //outdir: 'out',
        outdir: '.',
        entryPoints,
        sourcemap: 'both',
        metafile: true,
        jsx: 'automatic',
        loader: {
          '.html': 'copy',
        },
      },
    },
    Comlink.proxy(setTailwindConfig),
    Comlink.proxy(processCSSWithTailwind)
  )

  checkAborted()

  console.log('bundle', bundle)

  const output: Output = {
    importmap: null,
    tailwindConfig:
      bundle.result?.outputFiles?.find((x) => x.path === '/tailwind.config.js')?.text ?? null,
    js: new Map(),
    css: new Map(),
    html: new Map(),
    // metadata: {},
  }

  replData.bundle = bundle
  replData.output = output

  if (!bundle.ok) {
    allPayloads.clear()
    payloadMap.clear()

    const bundleErrors: esbuild.Message[] = [
      ...(bundle.error?.errors ?? []),
      ...(bundle.result?.errors ?? []),
    ]

    const bundleWarnings: esbuild.Message[] = [
      ...(bundle.error?.warnings ?? []),
      ...(bundle.result?.warnings ?? []),
    ]

    for (const error of bundleErrors) {
      const payload = getPayloadFromEsbuildMessage(error, 'error')
      allPayloads.add(payload)
      payloadMap.set(payload.ctx.id, payload)
    }

    for (const warning of bundleWarnings) {
      const payload = getPayloadFromEsbuildMessage(warning, 'warning')
      allPayloads.add(payload)
      payloadMap.set(payload.ctx.id, payload)
    }

    if (bundle.error) {
      toast.error(bundle.error.message, {
        duration: Infinity,
      })
      // throw new ReplBuildError('bundler', bundle.error)
    }

    updateDecorations()
  }

  if (bundle.ok) {
    const cssFiles = bundle?.result?.outputFiles?.filter((x) => x.path.endsWith('.css')) ?? []

    // TODO: process only if "@tailwind" is used in css
    // TODO: Promise.all
    for (const cssFile of cssFiles) {
      const css = cssFile.text
      output.css.set(cssFile.path, {
        url: 'data:text/css;base64,' + btoa(css),
      })
    }

    allPayloads.clear()
    payloadMap.clear()

    const packages: Set<string> = new Set(
      Object.values(bundle.result?.metafile?.outputs ?? {})
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
          acc[packageName] = `https://esm.sh/${packageName}`
          return acc
        },
        {} as ImportMap['imports']
      ),
    }

    output.importmap = importmap

    for (const outputFile of bundle.result?.outputFiles ?? []) {
      if (
        outputFile.path.endsWith('.js') &&
        !knownConfigRegexes.some((regex) => regex.test(outputFile.path))
      ) {
        const url = 'data:text/javascript;base64,' + btoa(outputFile.text)

        const entryPoint =
          bundle.result!.metafile?.outputs[outputFile.path.replace(/^\//, '')]?.entryPoint
        assert(entryPoint != null, 'entryPoint is expected to be defined')
        assert(!entryPoint!.startsWith('/'), 'entryPoint is expected to not start with /')

        output.js.set(outputFile.path, {
          url,
          entryPoint: '/' + entryPoint,
        })
      }
    }

    if (htmlModel) {
      output.html.set('/index.html', {
        text: htmlModel.getValue(),
      })
    }

    console.log('output', output)

    const srcdoc = getIframeTemplate(previewDoc, output, theme, replData.token)

    previewIframe.contentWindow!.postMessage(
      {
        source: 'jsrepl',
        type: 'repl',
        token: replData.token,
        srcdoc,
      },
      previewUrl
    )

    // clearTimeout(delayedUpdateDecorationsTimeoutId)
    // delayedUpdateDecorationsTimeoutId = setTimeout(() => {
    //   updateDecorations()
    // }, 1000)
  }

  return () => {
    // clearTimeout(delayedUpdateDecorationsTimeoutId)
    monacoTailwindcss?.dispose()
    monacoTailwindcss = null
    // replData.bundle = null
    // replData.output = null
  }
}

function getIframeTemplate(
  newDoc: Document,
  output: Output,
  theme: Pick<Theme, 'id' | 'isDark'>,
  token: number
) {
  newDoc.documentElement.dataset.token = token.toString()
  newDoc.documentElement.classList.toggle('dark', theme.isDark)

  const headFragment = document.createDocumentFragment()

  const metaColorScheme = newDoc.createElement('meta')
  metaColorScheme.name = 'color-scheme'
  metaColorScheme.content = theme.isDark ? 'dark light' : 'light dark'
  headFragment.appendChild(metaColorScheme)

  const importmapScript = newDoc.createElement('script')
  importmapScript.type = 'importmap'
  importmapScript.textContent = JSON.stringify(output.importmap!)
  headFragment.appendChild(importmapScript)

  const setupScript = newDoc.createElement('script')
  setupScript.type = 'module'
  setupScript.textContent = `window.parent.hooks.setup(window, ${token})`
  headFragment.appendChild(setupScript)

  for (const [cssPath, css] of output.css) {
    const existingLink = newDoc.querySelector(
      `link[href="${cssPath}"], link[href="${cssPath.replace(/^\//, '')}"], link[href=".${cssPath}"]`
    ) as HTMLLinkElement | null
    if (existingLink) {
      existingLink.href = css.url
      existingLink.dataset.path = cssPath
    } else {
      const link = newDoc.createElement('link')
      link.rel = 'stylesheet'
      link.href = css.url
      link.dataset.path = cssPath
      headFragment.appendChild(link)
    }
  }

  for (const [jsPath, js] of output.js) {
    const existingScript = newDoc.querySelector(
      [
        `script[src="${jsPath}"]`,
        `script[src="${jsPath.replace(/^\//, '')}"]`,
        `script[src=".${jsPath}"]`,
        ...(js.entryPoint && js.entryPoint !== jsPath
          ? [
              `script[src="${js.entryPoint}"]`,
              `script[src="${js.entryPoint.replace(/^\//, '')}"]`,
              `script[src=".${js.entryPoint}"]`,
            ]
          : []),
      ].join(',')
    ) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.src = js.url
      existingScript.type = 'module'
      existingScript.dataset.path = jsPath
    } else {
      const script = newDoc.createElement('script')
      script.type = 'module'
      script.src = js.url
      script.dataset.path = jsPath
      headFragment.appendChild(script)
    }
  }

  newDoc.head.prepend(headFragment)

  const afterJsScript = newDoc.createElement('script')
  afterJsScript.type = 'module'
  afterJsScript.textContent = `window.parent.hooks.afterJsScript(window, ${token})`
  newDoc.body.appendChild(afterJsScript)

  return newDoc.documentElement.outerHTML
}

async function setTailwindConfig(tailwindConfig: string) {
  console.log('setTailwindConfig')

  if (monacoTailwindcss) {
    console.log('setTailwindConfig setTailwindConfig')
    monacoTailwindcss.setTailwindConfig(tailwindConfig ?? defaultTailwindConfigJson)
  } else {
    console.log('setTailwindConfig configureMonacoTailwindcss')
    const { configureMonacoTailwindcss } = await import('@nag5000/monaco-tailwindcss')
    monacoTailwindcss = configureMonacoTailwindcss(monaco, {
      tailwindConfig: tailwindConfig ?? defaultTailwindConfigJson,
    })
  }

  console.log('setTailwindConfig done')
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
  kind: 'error' | 'warning'
): ReplPayload {
  let filePath = msg.location?.file ?? ''
  if (filePath && !filePath.startsWith('/')) {
    filePath = '/' + filePath
  }

  const payload: ReplPayload = {
    isPromise: false,
    promiseInfo: undefined,
    isError: true,
    result: msg.text,
    ctx: {
      id: `bundle-${kind}-${msg.id}-${msg.location?.file}-${msg.location?.line}:${msg.location?.column}`,
      lineStart: msg.location?.line ?? 1,
      lineEnd: msg.location?.line ?? 1,
      colStart: (msg.location?.column ?? 0) + 1,
      colEnd: (msg.location?.column ?? 0) + 1,
      source: '',
      filePath,
      kind,
    },
  }

  return payload
}
