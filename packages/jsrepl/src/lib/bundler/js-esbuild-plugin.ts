import type { NodePath, PluginObj, PluginPass, types } from '@babel/core'
import * as esbuild from 'esbuild-wasm'
import { assert } from '@/lib/assert'
import { getBabel, isBabelParseError } from '@/lib/get-babel'
import { fs } from './fs'
import { babelParseErrorToEsbuildError } from './utils'

const skipPaths = [/tailwind\.config\.(ts|js)?$/]

const replTransformCache = new Map<string, string>()
const replTransformCacheMaxSize = 5

export const JsEsbuildPlugin: esbuild.Plugin = {
  name: 'jsrepl-js',
  setup(build) {
    build.onLoad({ filter: /\.(ts|tsx|js|jsx)$/ }, onLoadCallback)
  },
}

function onLoadCallback(args: esbuild.OnLoadArgs): esbuild.OnLoadResult | undefined {
  console.log('JSReplEsbuildPlugin onLoadCallback')
  assert(args.path.startsWith('/'), 'path expected to start with "/"')

  if (skipPaths.some((regex) => regex.test(args.path))) {
    return undefined
  }

  try {
    const contents = fs.readFileSync(args.path, { encoding: 'utf8' })
    const transformed = replTransform(contents, args.path)
    const ext = args.path.split('.').pop()

    return {
      contents: transformed,
      loader: ext as esbuild.Loader,
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

function replTransform(code: string, filePath: string): string {
  const cached = replTransformCache.get(code)
  if (cached !== undefined) {
    return cached
  }

  const jsReplPreset = {
    plugins: [replPlugin],
  }

  const babel = getBabel()[0].value!
  const output = babel.transform(code, {
    parserOpts: {
      sourceType: 'module',
    },
    filename: filePath,
    presets: [[jsReplPreset, {}]],
    plugins: [
      // Allow Babel to parse TypeScript without transforming it
      filePath.endsWith('.ts') || filePath.endsWith('.tsx')
        ? ['syntax-typescript', { isTSX: filePath.endsWith('.tsx') }]
        : null,
    ].filter((x) => x !== null),
    sourceMaps: 'inline',
  })

  const result = output.code ?? ''

  replTransformCache.set(code, result)
  while (replTransformCache.size > replTransformCacheMaxSize) {
    replTransformCache.delete(replTransformCache.keys().next().value as string)
  }

  return result
}

function isNewlyCreatedPath(path: NodePath) {
  return !path.node.loc
}

function replPlugin({ types: t }: { types: typeof types }): PluginObj {
  const processedNodes = new WeakSet()
  let exprKey = 0

  return {
    visitor: {
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
                  ...getCommonWrapperFields.call(this, {
                    t,
                    path,
                    id: ++exprKey,
                    kind: 'console-' + callee.property.name,
                  }),
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
                ...getCommonWrapperFields.call(this, {
                  t,
                  path,
                  id: ++exprKey,
                  kind: 'variable',
                }),
                t.objectProperty(t.identifier('varName'), t.stringLiteral(varName)),
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
            ...getCommonWrapperFields.call(this, {
              t,
              path,
              id: ++exprKey,
              kind: 'expression',
            }),
          ]),
          path.node.expression,
        ])

        path.replaceWith(t.expressionStatement(callExpression))
      },
    },
  }
}

function getCommonWrapperFields(
  this: PluginPass,
  {
    t,
    path,
    id,
    kind,
  }: {
    t: typeof types
    path: NodePath
    id: number
    kind: string
  }
) {
  const filePath = this.filename!
  assert(filePath != null, 'filePath must be defined')
  assert(filePath.startsWith('/'), 'filePath must start with /')

  return [
    t.objectProperty(t.identifier('id'), t.numericLiteral(id)),
    t.objectProperty(t.identifier('kind'), t.stringLiteral(kind)),
    t.objectProperty(t.identifier('source'), t.stringLiteral(path.getSource())),
    t.objectProperty(t.identifier('filePath'), t.stringLiteral(filePath)),
    t.objectProperty(
      t.identifier('lineStart'),
      path.node?.loc?.start?.line != null
        ? t.numericLiteral(path.node.loc.start.line)
        : t.nullLiteral()
    ),
    t.objectProperty(
      t.identifier('lineEnd'),
      path.node?.loc?.end?.line != null ? t.numericLiteral(path.node.loc.end.line) : t.nullLiteral()
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
  ]
}
