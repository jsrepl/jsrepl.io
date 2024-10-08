import { type Dispatch, type SetStateAction } from 'react'
import type { MonacoTailwindcss } from '@nag5000/monaco-tailwindcss'
import type debounce from 'debounce'
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
import { getOriginalPosition } from '@/lib/sourcemap-utils'
import { defaultTailwindConfigJson } from '@/lib/tailwind-configs'
import { type ImportMap, Output, type ReplPayload, type Theme } from '@/types'

let iframeToken = -1
let monacoTailwindcss: MonacoTailwindcss | null = null
let delayedUpdateDecorationsTimeoutId: NodeJS.Timeout
const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL!

let __bundle: BuildResult | null = null
let __output: Output | null = null

export async function sendRepl({
  models,
  changedModels,
  allPayloads,
  payloadMap,
  updateDecorations,
  previewIframe,
  theme,
}: {
  models: Map<string, CodeEditorModel>
  changedModels: Set<CodeEditorModel>
  allPayloads: Set<ReplPayload>
  payloadMap: Map<number | string, ReplPayload>
  updateDecorations: () => void
  previewIframe: HTMLIFrameElement
  theme: Theme
}): Promise<() => void> {
  iframeToken = (iframeToken + 1) % Number.MAX_VALUE
  const currToken = iframeToken

  const modelsArray = Array.from(models.values())
  const jsModels: JsCodeEditorModel[] = modelsArray.filter(
    (model) => model instanceof JsCodeEditorModel
  )
  const cssModels: CssCodeEditorModel[] = modelsArray.filter(
    (model) => model instanceof CssCodeEditorModel
  )
  const htmlModel = models.get('/index.html') as HtmlCodeEditorModel | undefined
  const tailwindConfigModel = models.get('/tailwind.config.ts') as
    | TailwindConfigCodeEditorModel
    | undefined

  // const babel = getBabel()[0].value!

  const previewDoc = document.implementation.createHTMLDocument('JSRepl Preview')
  if (htmlModel) {
    previewDoc.open()
    previewDoc.write(htmlModel.getValue())
    previewDoc.close()
  }

  const previewDocScriptsSrcArray = Array.from(previewDoc.scripts).map((script) => script.src)

  let bundle: BuildResult | null = null

  const bundler = getBundler()

  const input: Record<string, string> = {}
  const entryPoints: string[] = []

  if (tailwindConfigModel) {
    input[tailwindConfigModel.monacoModel.uri.path] = tailwindConfigModel.getValue()
  }

  for (const model of jsModels) {
    const origFilePath = model.monacoModel.uri.path
    // const { code, error } = model.getBabelTransformResult(babel)

    // if (error) {
    //   throw new ReplBuildError('transpilation', error, {
    //     filePath: origFilePath,
    //   })
    // }

    const transpiledFilePath = origFilePath
    input[transpiledFilePath] = model.getValue()

    if (
      previewDocScriptsSrcArray.includes(origFilePath /* /file.ts */) ||
      previewDocScriptsSrcArray.includes('.' + origFilePath /* ./file.ts */) ||
      previewDocScriptsSrcArray.includes(origFilePath.replace(/^\//, '') /* file.ts */)
    ) {
      entryPoints.push(transpiledFilePath)
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

  bundle = await bundler.build({
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
    },
  })

  // use generator?
  if (iframeToken !== currToken) {
    throw 'cancelled'
  }

  const output: Output = {
    importmap: null,
    tailwindConfig:
      bundle.result?.outputFiles?.find((x) => x.path === '/tailwind.config.js')?.text ?? null,
    js: new Map(),
    css: new Map(),
    html: new Map(),
    metadata: {
      knownConfigRegexes: [/tailwind\.config\.js$/],
    },
  }

  __bundle = bundle
  __output = output
  console.log('bundle', bundle)

  if (!bundle.ok) {
    allPayloads.clear()
    payloadMap.clear()

    const bundleErrors: esbuild.Message[] = [
      ...(bundle.error?.errors ?? []),
      ...(bundle.result?.errors ?? []),
      // TODO: add warnings as well
    ]

    for (const error of bundleErrors) {
      let filePath = error.location?.file ?? ''
      if (filePath && !filePath.startsWith('/')) {
        filePath = '/' + filePath
      }

      const payload: ReplPayload = {
        isPromise: false,
        promiseInfo: undefined,
        isError: true,
        result: error.text,
        ctx: {
          id: `bundle-error-${error.id}-${error.location?.file}-${error.location?.line}:${error.location?.column}`,
          lineStart: error.location?.line ?? 1,
          lineEnd: error.location?.line ?? 1,
          colStart: (error.location?.column ?? 0) + 1,
          colEnd: (error.location?.column ?? 0) + 1,
          source: '',
          filePath,
          kind: 'error',
        },
      }

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
    // TODO: process only if "@tailwind" is used in css
    const tailwindConfig = bundle?.result?.outputFiles?.find(
      (x) => x.path === '/tailwind.config.js'
    )?.text

    // TODO: process only if "@tailwind" is used in css
    if (!monacoTailwindcss || (tailwindConfigModel && changedModels.has(tailwindConfigModel))) {
      if (monacoTailwindcss) {
        monacoTailwindcss.setTailwindConfig(tailwindConfig ?? defaultTailwindConfigJson)
      } else {
        const { configureMonacoTailwindcss } = await import('@nag5000/monaco-tailwindcss')
        // use generator?
        if (iframeToken !== currToken) {
          throw 'cancelled'
        }
        monacoTailwindcss = configureMonacoTailwindcss(monaco, {
          tailwindConfig: tailwindConfig ?? defaultTailwindConfigJson,
        })
      }
    }

    const tailwindContent =
      bundle?.result?.outputFiles
        ?.filter(
          (x) =>
            ['.js', '.html'].some((ext) => x.path.endsWith(ext)) &&
            !output.metadata.knownConfigRegexes.some((regex) => regex.test(x.path))
        )
        ?.map((x) => ({
          content: x.text,
          extension: x.path.split('.').pop() ?? '',
        })) ?? []

    const cssFiles = bundle?.result?.outputFiles?.filter((x) => x.path.endsWith('.css')) ?? []

    // TODO: process only if "@tailwind" is used in css
    for (const cssFile of cssFiles) {
      const css = await processCSSWithTailwind(monacoTailwindcss!, cssFile.text, tailwindContent)
      output.css.set(cssFile.path, {
        url: 'data:text/css;base64,' + btoa(css),
      })

      if (iframeToken !== currToken) {
        throw 'cancelled'
      }
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
        !output.metadata.knownConfigRegexes.some((regex) => regex.test(outputFile.path))
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

    const srcdoc = getIframeTemplate(previewDoc, output, theme, iframeToken)

    previewIframe.contentWindow!.postMessage(
      {
        source: 'jsrepl',
        type: 'repl',
        token: iframeToken,
        srcdoc,
      },
      previewUrl
    )

    clearTimeout(delayedUpdateDecorationsTimeoutId)
    delayedUpdateDecorationsTimeoutId = setTimeout(() => {
      updateDecorations()
    }, 1000)
  }

  return () => {
    clearTimeout(delayedUpdateDecorationsTimeoutId)
    monacoTailwindcss?.dispose()
    monacoTailwindcss = null
    __bundle = null
    __output = null
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
    //models,
    debouncedUpdateDecorations,
  }: {
    setPreviewIframeReadyId: Dispatch<SetStateAction<string | null>>
    allPayloads: Set<ReplPayload>
    payloadMap: Map<number | string, ReplPayload>
    //models: Map<string, CodeEditorModel>
    debouncedUpdateDecorations: debounce.DebouncedFunction<() => void>
  }
) {
  if (
    event.origin === previewUrl &&
    event.data?.source === 'jsreplPreview' &&
    event.data.type === 'ready' &&
    event.data.token === -1
  ) {
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

      if (payload.ctx.kind === 'window-error') {
        // const babel = getBabel()[0].value!
        // const tsxModel = models.get('/index.tsx') as TsxCodeEditorModel
        //const { sourcemap } = tsxModel.getBabelTransformResult(babel)

        // base64 url -> output file path
        const filePath = Array.from(__output!.js.entries()).find(
          ([, { url }]) => url === payload.ctx.filePath
        )?.[0]
        const sourcemap = filePath
          ? __bundle?.result?.outputFiles?.find((x) => x.path === filePath + '.map')?.text
          : undefined

        if (sourcemap) {
          const { line, column, source } = getOriginalPosition(
            sourcemap,
            payload.ctx.lineStart,
            payload.ctx.colStart
          )

          if (line && source) {
            payload.ctx.lineStart = line
            payload.ctx.lineEnd = line
            payload.ctx.colStart = column ?? 1
            payload.ctx.colEnd = column ?? 1
            payload.ctx.filePath = '/' + source

            allPayloads.add(payload)
            payloadMap.set(payload.ctx.id, payload)
          }
        }
      } else {
        allPayloads.add(payload)
        payloadMap.set(payload.ctx.id, payload)
      }
    }

    if (event.data.type === 'repl' || event.data.type === 'script-complete') {
      clearTimeout(delayedUpdateDecorationsTimeoutId)
      debouncedUpdateDecorations()
    }
  }
}

async function processCSSWithTailwind(
  monacoTailwindcss: MonacoTailwindcss,
  css: string,
  content: { content: string; extension: string }[]
): Promise<string> {
  try {
    const result = await monacoTailwindcss.generateStylesFromContent(css, content)
    console.log('tailwind css result', result)
    return result
  } catch (e) {
    console.error('tailwind css error', e)
    return ''
  }
}

export class ReplBuildError extends Error {
  constructor(
    public readonly code: string,
    public readonly cause: Error,
    public readonly location?: {
      /**
       * Path is relative to the root of the project.
       * For example: '/index.tsx', '/index.html', '/index.css', '/tailwind.config.ts'
       */
      filePath: string
      line?: number
      column?: number
    }
  ) {
    super(`Failed to build REPL (${code})`)
  }
}
