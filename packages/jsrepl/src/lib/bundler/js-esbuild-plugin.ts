import * as esbuild from 'esbuild-wasm'
import { assert } from '@/lib/assert'
import { getBabel, isBabelParseError } from '@/lib/get-babel'
import { getFileExtension } from '../fs-utils'
import { preventInfiniteLoopsPlugin } from './babel/prevent-infinite-loops-plugin'
import { replPlugin } from './babel/repl-plugin'
import { Cache } from './cache'
import { fs } from './fs'
import { babelParseErrorToEsbuildError } from './utils'

const skipPaths = [/tailwind\.config\.(ts|js)?$/]

const replTransformCache = new Cache()

export const JsEsbuildPlugin: esbuild.Plugin = {
  name: 'jsrepl-js',
  setup(build) {
    build.onLoad({ filter: /\.(ts|tsx|js|jsx)$/ }, onLoadCallback)
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

    return {
      contents: transformed,
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

function transform(code: string, filePath: string): string {
  const cached = replTransformCache.get(code, filePath)
  if (cached !== undefined) {
    return cached
  }

  const jsReplPreset = {
    plugins: [replPlugin, preventInfiniteLoopsPlugin],
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

  const result = output.code ?? ''

  replTransformCache.set(code, filePath, result)

  return result
}
