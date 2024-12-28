import { ReplMeta } from '@jsrepl/shared-types'
import type { TailwindConfig } from '@nag5000/monaco-tailwindcss'
import * as Comlink from 'comlink'
import * as esbuild from 'esbuild-wasm'
import { getBabel } from '@/lib/get-babel'
import { cssEsbuildPlugin } from './css-esbuild-plugin'
import { resetFileSystem, stderrSinceReset } from './fs'
import { jsEsbuildPlugin } from './js-esbuild-plugin'

let initialized = false

function getWasmUrl() {
  const url = new URL('esbuild-wasm/esbuild.wasm', import.meta.url)
  // HACK: With Turbopack, `url` will be relative here and won't include the origin
  // (It is unexpected that URL instance is a relative url, but it is, Turbopack does odd
  // transform for `new URL(..., import.meta.url)`, which produces `instanceof URL`,
  // but with relative `href`).
  // We need to make it absolute to ensure it works when passed to esbuild-wasm.
  const absoluteUrl = new URL(url, location.origin)
  return absoluteUrl
}

async function setup() {
  if (!initialized) {
    const [, loadBabel] = getBabel()
    await Promise.all([
      esbuild.initialize({
        wasmURL: getWasmUrl(),
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

async function build(
  data: {
    input: Record<string, string>
    options: Omit<esbuild.BuildOptions, 'plugins'>
  },
  setTailwindConfig: ((tailwindConfig: string | TailwindConfig) => Promise<void>) &
    Comlink.ProxyMarked,
  processCSSWithTailwind: ((
    css: string,
    content: { content: string; extension: string }[]
  ) => Promise<string>) &
    Comlink.ProxyMarked
) {
  if (!initialized) {
    throw new Error('not initialized')
  }

  const { input, options } = data

  let result: esbuild.BuildResult<esbuild.BuildOptions> | null = null
  let error: BuildError | null = null
  const replMeta: ReplMeta = {
    ctxMap: new Map(),
  }

  try {
    resetFileSystem(input)
    result = await esbuild.build({
      ...options,
      plugins: [
        jsEsbuildPlugin({ replMeta }),
        cssEsbuildPlugin({ setTailwindConfig, processCSSWithTailwind }),
      ],
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
    replMeta,
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
