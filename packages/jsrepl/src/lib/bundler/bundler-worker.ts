import * as Comlink from 'comlink'
import * as esbuild from 'esbuild-wasm'
import { getBabel } from '@/lib/get-babel'
import { resetFileSystem, stderrSinceReset } from './fs'
import { JSReplEsbuildPlugin } from './jsrepl-esbuild-plugin'
import { TailwindConfigEsbuildPlugin } from './tailwind-config-esbuild-plugin'

let initialized = false

async function setup() {
  if (!initialized) {
    const [, loadBabel] = getBabel()
    await Promise.all([
      esbuild.initialize({
        wasmURL: new URL('esbuild-wasm/esbuild.wasm', import.meta.url),
        worker: false,
      }),
      loadBabel(),
    ])

    initialized = true
  }

  return {
    ok: initialized,
  }
}

type BuildError = Error & {
  errors?: esbuild.Message[]
  warnings?: esbuild.Message[]
}

async function build(data: {
  input: Record<string, string>
  options: Omit<esbuild.BuildOptions, 'plugins'>
}) {
  if (!initialized) {
    throw new Error('not initialized')
  }

  const { input, options } = data

  let result: esbuild.BuildResult<esbuild.BuildOptions> | null = null
  let error: BuildError | null = null

  try {
    resetFileSystem(input)
    result = await esbuild.build({
      ...options,
      plugins: [JSReplEsbuildPlugin, TailwindConfigEsbuildPlugin],
    })
  } catch (err) {
    error = err as BuildError
  }

  return {
    ok: error === null && result !== null && result.errors.length === 0 && stderrSinceReset === '',
    result,
    error: error
      ? {
          message: error.message,
          errors: error.errors ?? [],
          warnings: error.warnings ?? [],
        }
      : null,
    stderrSinceReset,
  }
}

export type BuildResult = Awaited<ReturnType<typeof build>>

export type Expose = {
  setup: typeof setup
  build: typeof build
}

Comlink.expose({
  setup,
  build,
} as Expose)
