import { ReplMeta, ReplPayload } from '@jsrepl/shared-types'
import * as esbuild from 'esbuild-wasm'
import { assert } from '@/lib/assert'
import { FileCache } from '@/lib/file-cache'
import { getBabel, isBabelParseError } from '@/lib/get-babel'
import { getFileExtension } from '../fs-utils'
import { preventInfiniteLoopsPlugin } from './babel/prevent-infinite-loops-plugin'
import { ReplPluginMetadata, replPlugin } from './babel/repl-plugin'
import { initSkip } from './babel/skip-utils'
import { fs } from './fs'
import { babelParseErrorToEsbuildError } from './utils'

const skipPaths = [/tailwind\.config\.(ts|js)?$/]

type TransformResult = { code: string; metadata: ReplPluginMetadata }
const replTransformCache = new FileCache<TransformResult>()

export function jsEsbuildPlugin({ replMeta }: { replMeta: ReplMeta }): esbuild.Plugin {
  const ctxList: ReplPayload['ctx'][] = []

  return {
    name: 'esbuild-jsrepl-js',
    setup(build) {
      build.onLoad({ filter: /\.(ts|tsx|js|jsx)$/ }, onLoadCallback)
      build.onEnd(() => {
        for (const ctx of ctxList) {
          replMeta.ctxMap.set(ctx.id, ctx)
        }
      })
    },
  }

  function onLoadCallback(args: esbuild.OnLoadArgs): esbuild.OnLoadResult | undefined {
    assert(args.path.startsWith('/'), 'path expected to start with "/"')

    if (skipPaths.some((regex) => regex.test(args.path))) {
      return undefined
    }

    try {
      const contents = fs.readFileSync(args.path, { encoding: 'utf8' })
      const transformed = transform(contents, args.path)
      const loader = getFileExtension(args.path).slice(1) as esbuild.Loader

      ctxList.push(...transformed.metadata.replPlugin.ctxList)

      return {
        contents: transformed.code,
        loader,
      }
    } catch (error) {
      return {
        errors: [
          isBabelParseError(error)
            ? babelParseErrorToEsbuildError(error, args.path)
            : {
                text: error instanceof Error ? error.message : String(error),
              },
        ],
      }
    }
  }
}

function transform(code: string, filePath: string): TransformResult {
  const cached = replTransformCache.get(code, filePath)
  if (cached !== undefined) {
    return cached
  }

  const skipUtils = initSkip()
  const jsReplPreset = {
    plugins: [
      [replPlugin, { skipUtils }],
      [preventInfiniteLoopsPlugin, { skipUtils }],
    ],
  }

  const ext = getFileExtension(filePath)

  const babel = getBabel()[0].value!
  const output = babel.transform(code, {
    parserOpts: {
      sourceType: 'module',
    },
    filename: filePath,
    presets: [[jsReplPreset, {}]],
    plugins: [
      // Allow Babel to parse TypeScript without transforming it
      ext === '.ts' || ext === '.tsx' ? ['syntax-typescript', { isTSX: ext === '.tsx' }] : null,
      ext === '.jsx' ? ['syntax-jsx'] : null,
    ].filter((x) => x !== null),
    sourceMaps: 'inline',
  })

  const outputCode = output.code ?? ''
  const metadata = output.metadata as unknown as ReplPluginMetadata
  const result: TransformResult = { code: outputCode, metadata }
  replTransformCache.set(code, filePath, result)

  return result
}
