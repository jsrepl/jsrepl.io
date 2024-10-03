import type { NodePath, PluginObj, types } from '@babel/core'
import type * as Babel from '@babel/standalone'
import type {
  BabelTransformResult,
  BabelTransformResultError,
  BabelTransformResultMetadata,
} from '@/types'

const jsReplPreset = {
  plugins: [replPlugin],
}

export function transformCode(
  babel: typeof Babel,
  code: string
): BabelTransformResult | BabelTransformResultError {
  try {
    const result = _transformCode(babel, code)
    return {
      code: result.code ?? '',
      sourcemap: result.map,
      metadata: result.metadata as unknown as BabelTransformResultMetadata,
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

function _transformCode(babel: typeof Babel, code: string) {
  const output = babel.transform(code, {
    parserOpts: {
      sourceType: 'module',
    },
    filename: 'index.tsx',
    presets: [
      ['react', { runtime: 'automatic' }],
      ['typescript', {}],
      [jsReplPreset, {}],
    ],
    sourceMaps: 'both',
  })

  return output
}

function isNewlyCreatedPath(path: NodePath) {
  return !path.node.loc
}

function replPlugin({ types: t }: { types: typeof types }): PluginObj {
  const processedNodes = new WeakSet()
  let exprKey = 0

  return {
    visitor: {
      ImportDeclaration(path) {
        const importPath = path.node.source.value
        const metadata = this.file.metadata as BabelTransformResultMetadata
        metadata.importPaths ??= []
        metadata.importPaths.push(importPath)
      },

      CallExpression(path) {
        if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
          return
        }

        processedNodes.add(path.node)
        const callee = path.node.callee

        // console.log(...) -> console.log.apply(console, __r(...))
        // console.debug(...) -> console.debug.apply(console, __r(...))
        // console.info(...) -> console.info.apply(console, __r(...))
        // console.warn(...) -> console.warn.apply(console, __r(...))
        // console.error(...) -> console.error.apply(console, __r(...))
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object) &&
          callee.object.name === 'console' &&
          t.isIdentifier(callee.property) &&
          ['log', 'debug', 'info', 'warn', 'error'].includes(callee.property.name)
        ) {
          path.replaceWith(
            t.callExpression(t.memberExpression(callee, t.identifier('apply')), [
              callee.object,
              t.callExpression(t.identifier('__r'), [
                t.objectExpression([
                  t.objectProperty(t.identifier('id'), t.numericLiteral(++exprKey)),
                  t.objectProperty(
                    t.identifier('kind'),
                    t.stringLiteral('console-' + callee.property.name)
                  ),
                  t.objectProperty(t.identifier('source'), t.stringLiteral(path.getSource())),
                  t.objectProperty(
                    t.identifier('lineStart'),
                    path.node?.loc?.start?.line != null
                      ? t.numericLiteral(path.node.loc.start.line)
                      : t.nullLiteral()
                  ),
                  t.objectProperty(
                    t.identifier('lineEnd'),
                    path.node?.loc?.end?.line != null
                      ? t.numericLiteral(path.node.loc.end.line)
                      : t.nullLiteral()
                  ),
                  t.objectProperty(
                    t.identifier('colStart'),
                    path.node?.loc?.start?.column != null
                      ? t.numericLiteral(path.node.loc.start.column)
                      : t.nullLiteral()
                  ),
                  t.objectProperty(
                    t.identifier('colEnd'),
                    path.node?.loc?.end?.column != null
                      ? t.numericLiteral(path.node.loc.end.column)
                      : t.nullLiteral()
                  ),
                ]),
                ...path.node.arguments,
              ]),
            ])
          )
        }
      },

      VariableDeclaration(path) {
        if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
          return
        }

        processedNodes.add(path.node)

        const declarations = path.get('declarations')
        declarations.forEach((declaration) => {
          const node = declaration.node
          if (node.init && t.isIdentifier(node.id) && node.id.name) {
            const varName = node.id.name
            const initValue = node.init

            const callExpression = t.callExpression(t.identifier('__r'), [
              t.objectExpression([
                t.objectProperty(t.identifier('id'), t.numericLiteral(++exprKey)),
                t.objectProperty(t.identifier('kind'), t.stringLiteral('variable')),
                t.objectProperty(t.identifier('source'), t.stringLiteral(path.getSource())),
                t.objectProperty(t.identifier('varName'), t.stringLiteral(varName)),
                t.objectProperty(
                  t.identifier('lineStart'),
                  path.node?.loc?.start?.line != null
                    ? t.numericLiteral(path.node.loc.start.line)
                    : t.nullLiteral()
                ),
                t.objectProperty(
                  t.identifier('lineEnd'),
                  path.node?.loc?.end?.line != null
                    ? t.numericLiteral(path.node.loc.end.line)
                    : t.nullLiteral()
                ),
                t.objectProperty(
                  t.identifier('colStart'),
                  path.node?.loc?.start?.column != null
                    ? t.numericLiteral(path.node.loc.start.column)
                    : t.nullLiteral()
                ),
                t.objectProperty(
                  t.identifier('colEnd'),
                  path.node?.loc?.end?.column != null
                    ? t.numericLiteral(path.node.loc.end.column)
                    : t.nullLiteral()
                ),
              ]),
              initValue,
            ])

            node.init = callExpression
          }
        })
      },

      ExpressionStatement(path) {
        if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
          return
        }

        processedNodes.add(path.node)

        // skip console.log(...), console.debug(...), etc
        if (t.isCallExpression(path.node.expression)) {
          const callee = path.node.expression.callee
          if (
            t.isMemberExpression(callee) &&
            t.isIdentifier(callee.object) &&
            callee.object.name === 'console'
          ) {
            return
          }
        }

        const callExpression = t.callExpression(t.identifier('__r'), [
          t.objectExpression([
            t.objectProperty(t.identifier('id'), t.numericLiteral(++exprKey)),
            t.objectProperty(t.identifier('kind'), t.stringLiteral('expression')),
            t.objectProperty(t.identifier('source'), t.stringLiteral(path.getSource())),
            t.objectProperty(
              t.identifier('lineStart'),
              path.node?.loc?.start?.line != null
                ? t.numericLiteral(path.node.loc.start.line)
                : t.nullLiteral()
            ),
            t.objectProperty(
              t.identifier('lineEnd'),
              path.node?.loc?.end?.line != null
                ? t.numericLiteral(path.node.loc.end.line)
                : t.nullLiteral()
            ),
            t.objectProperty(
              t.identifier('colStart'),
              path.node?.loc?.start?.column != null
                ? t.numericLiteral(path.node.loc.start.column)
                : t.nullLiteral()
            ),
            t.objectProperty(
              t.identifier('colEnd'),
              path.node?.loc?.end?.column != null
                ? t.numericLiteral(path.node.loc.end.column)
                : t.nullLiteral()
            ),
          ]),
          path.node.expression,
        ])

        path.replaceWith(t.expressionStatement(callExpression))
      },
    },
  }
}
