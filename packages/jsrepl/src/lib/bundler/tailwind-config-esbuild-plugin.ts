import type { PluginObj, types } from '@babel/core'
import * as esbuild from 'esbuild-wasm'
import { getBabel, isBabelParseError } from '@/lib/get-babel'
import { fs } from './fs'
import { babelParseErrorToEsbuildError } from './utils'

export const TailwindConfigEsbuildPlugin: esbuild.Plugin = {
  name: 'tailwind-config',
  setup(build) {
    build.onLoad({ filter: /tailwind\.config\.(js|ts)$/ }, onLoadCallback)
  },
}

function onLoadCallback(args: esbuild.OnLoadArgs): esbuild.OnLoadResult | undefined {
  try {
    const babel = getBabel()[0].value!
    const code = fs.readFileSync(args.path, { encoding: 'utf8' })
    const ext = args.path.split('.').pop() as esbuild.Loader

    const result = babel.transform(code, {
      parserOpts: {
        sourceType: 'module',
      },
      filename: args.path,
      plugins: [
        args.path.endsWith('.ts') ? ['syntax-typescript', { isTSX: false }] : null,
        updateImports,
      ].filter((x) => x !== null),
      sourceMaps: false,
    })

    return {
      contents: result.code ?? '',
      loader: ext,
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
