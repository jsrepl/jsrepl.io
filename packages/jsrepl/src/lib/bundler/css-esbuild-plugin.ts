import type { PluginObj, types } from '@babel/core'
import type * as Comlink from 'comlink'
import * as esbuild from 'esbuild-wasm'
import { getBabel, isBabelParseError } from '@/lib/get-babel'
import { defer } from '../promise-with-resolvers'
import { Cache } from './cache'
import { fs } from './fs'
import { babelParseErrorToEsbuildError } from './utils'

const tailwindConfigCache = new Cache()

let tailwindContent: { content: string; extension: string }[] | null = null
let tailwindConfigReadyDeferred: PromiseWithResolvers<void> | null = null
let lastAppliedTailwindConfig: string | undefined

export function CssEsbuildPlugin({
  setTailwindConfig,
  processCSSWithTailwind,
}: {
  setTailwindConfig: ((tailwindConfig: string) => Promise<void>) & Comlink.ProxyMarked
  processCSSWithTailwind: ((
    css: string,
    content: { content: string; extension: string }[]
  ) => Promise<string>) &
    Comlink.ProxyMarked
}): esbuild.Plugin {
  return {
    name: 'jsrepl-css',
    setup(build) {
      tailwindContent = null
      tailwindConfigReadyDeferred = null

      build.onResolve({ filter: /tailwind\.config\.(js|ts)$/ }, (args) => {
        tailwindConfigReadyDeferred = defer()
        return {
          path: args.path,
          namespace: 'tailwind-config',
        }
      })

      build.onLoad({ filter: /.*/, namespace: 'tailwind-config' }, (args) =>
        onTailwindConfigLoadCallback(args, build, setTailwindConfig)
      )

      build.onLoad({ filter: /\.css$/ }, (args) => onCssLoadCallback(args, processCSSWithTailwind))

      build.onDispose(() => {
        tailwindContent = null
        tailwindConfigReadyDeferred = null
      })
    },
  }
}

async function onTailwindConfigLoadCallback(
  args: esbuild.OnLoadArgs,
  build: esbuild.PluginBuild,
  setTailwindConfig: ((tailwindConfig: string) => Promise<void>) & Comlink.ProxyMarked
): Promise<esbuild.OnLoadResult | null | undefined> {
  let transformFailure: esbuild.TransformFailure | undefined

  try {
    const babel = getBabel()[0].value!
    const contents = fs.readFileSync(args.path, { encoding: 'utf8' })

    let transformedCode = tailwindConfigCache.get(contents, args.path)
    if (transformedCode === undefined) {
      const ext = args.path.split('.').pop()
      const result = babel.transform(contents, {
        parserOpts: {
          sourceType: 'module',
        },
        filename: args.path,
        plugins: [
          args.path.endsWith('.ts') ? ['syntax-typescript', { isTSX: false }] : null,
          updateImports,
        ].filter((x) => x !== null),
        sourceMaps: 'inline',
      })

      try {
        const transformed = await build.esbuild.transform(result.code ?? '', {
          loader: ext as esbuild.Loader,
        })

        transformedCode = transformed.code
      } catch (error) {
        transformFailure = error as esbuild.TransformFailure
        throw transformFailure
      }

      tailwindConfigCache.set(contents, args.path, transformedCode)
    }

    if (lastAppliedTailwindConfig !== transformedCode) {
      await setTailwindConfig(transformedCode)
      lastAppliedTailwindConfig = transformedCode
    }

    tailwindConfigReadyDeferred?.resolve()

    return {
      contents: transformedCode,
      loader: 'js',
    }
  } catch (error) {
    tailwindConfigReadyDeferred?.reject('tailwind-config-ready-rejected')

    if (transformFailure) {
      return {
        errors: transformFailure.errors,
        warnings: transformFailure.warnings,
      }
    }

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

// TODO: cache?
async function onCssLoadCallback(
  args: esbuild.OnLoadArgs,
  processCSSWithTailwind: ((
    css: string,
    content: { content: string; extension: string }[]
  ) => Promise<string>) &
    Comlink.ProxyMarked
): Promise<esbuild.OnLoadResult | null | undefined> {
  try {
    const contents = fs.readFileSync(args.path, { encoding: 'utf8' })
    if (!/@(apply|tailwind)/.test(contents)) {
      return {
        contents,
        loader: 'css',
      }
    }

    if (tailwindContent === null) {
      tailwindContent = fs
        .readdirSync('/', { recursive: true, withFileTypes: true })
        .filter(
          (dirent) =>
            dirent.isFile() &&
            /\.(tsx|ts|jsx|js|html)$/i.test(dirent.name) &&
            !/tailwind\.config\.(ts|js)$/i.test(dirent.name)
        )
        .map((dirent) => ({
          content: fs.readFileSync(dirent.parentPath + '/' + dirent.name, { encoding: 'utf8' }),
          extension: dirent.name.split('.').pop()!,
        }))
    }

    await tailwindConfigReadyDeferred?.promise
    const css = await processCSSWithTailwind(contents, tailwindContent)

    return {
      contents: css,
      loader: 'css',
    }
  } catch (error) {
    if (error === 'tailwind-config-ready-rejected') {
      return undefined
    }

    return {
      errors: [
        {
          text: error instanceof Error ? error.message : String(error),
        },
      ],
    }
  }
}

// Keep an eye on the ability to use importmaps in workers:  https://github.com/WICG/import-maps/issues/2
function updateImports({ types: t }: { types: typeof types }): PluginObj {
  return {
    visitor: {
      // Replace `import typography from '@tailwindcss/typography'` with `import typography from 'https://esm.sh/@tailwindcss/typography'`
      ImportDeclaration(path) {
        const importPath = path.node.source.value
        if (importPath.startsWith('https://') || importPath.startsWith('.')) {
          return
        }

        path.replaceWith(
          t.importDeclaration(path.node.specifiers, t.stringLiteral(`https://esm.sh/${importPath}`))
        )
      },
    },
  }
}
