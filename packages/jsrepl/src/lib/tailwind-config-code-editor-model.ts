import type { PluginObj, types } from '@babel/core'
import type * as Babel from '@babel/standalone'
import type { BabelTransformResult, BabelTransformResultError } from '@/types'
import { CodeEditorModel } from './code-editor-model'

export class TailwindConfigCodeEditorModel extends CodeEditorModel {
  #babelTransformResult: BabelTransformResult | BabelTransformResultError | null = null

  getBabelTransformResult(babel: typeof Babel): BabelTransformResult | BabelTransformResultError {
    return (
      this.#babelTransformResult ??
      (this.#babelTransformResult = this.#transformCode(babel, this.getValue()))
    )
  }

  override invalidateCache() {
    super.invalidateCache()
    this.#babelTransformResult = null
  }

  #transformCode(
    babel: typeof Babel,
    code: string
  ): BabelTransformResult | BabelTransformResultError {
    try {
      const result = babel.transform(code, {
        parserOpts: {
          sourceType: 'module',
        },
        filename: 'tailwind.config.ts',
        presets: [['typescript', {}]],
        plugins: [updateImports],
        sourceMaps: false,
      })

      return {
        code: result.code ?? '',
        sourcemap: null,
        metadata: {
          importPaths: undefined,
        },
        error: null,
      }
    } catch (e) {
      return {
        code: null,
        sourcemap: null,
        metadata: null,
        error: e as Error,
      }
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
