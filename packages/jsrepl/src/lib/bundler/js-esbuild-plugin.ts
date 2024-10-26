import type { NodePath, PluginObj, PluginPass, types } from '@babel/core'
import * as esbuild from 'esbuild-wasm'
import { assert } from '@/lib/assert'
import { getBabel, isBabelParseError } from '@/lib/get-babel'
import { getFileExtension } from '../fs-utils'
import { Cache } from './cache'
import { fs } from './fs'
import { babelParseErrorToEsbuildError } from './utils'

const skipPaths = [/tailwind\.config\.(ts|js)?$/]

const replTransformCache = new Cache()
let exprKey = 0

export const JsEsbuildPlugin: esbuild.Plugin = {
  name: 'jsrepl-js',
  setup(build) {
    build.onStart(() => {
      exprKey = 0
    })

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
    const transformed = replTransform(contents, args.path)
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

function replTransform(code: string, filePath: string): string {
  const cached = replTransformCache.get(code, filePath)
  if (cached !== undefined) {
    return cached
  }

  const jsReplPreset = {
    plugins: [replPlugin],
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

function isNewlyCreatedPath(path: NodePath) {
  return !path.node.loc
}

function replPlugin({ types: t }: { types: typeof types }): PluginObj {
  const processedNodes = new WeakSet()

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

      // const z = foo()
      // const [ccc, a = '', { x: cc }, [xbx = 'a'], ...b] = await foo()
      // const x1 = 1, x2 = 2
      VariableDeclaration(path) {
        if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
          return
        }

        processedNodes.add(path.node)

        const declarations = path.get('declarations')
        const identifiers: types.Identifier[] = []

        declarations.forEach((declaration) => {
          const declarationId = declaration.get('id')
          if (t.isIdentifier(declarationId.node)) {
            identifiers.push(declarationId.node)
          } else {
            declarationId.traverse({
              AssignmentPattern(path) {
                path.skipKey('right')
              },
              ObjectProperty(path) {
                path.skipKey('key')
              },
              Identifier(path) {
                identifiers.push(path.node)
              },
            })
          }
        })

        if (identifiers.length === 0) {
          return
        }

        const callExpression = t.callExpression(t.identifier('__r'), [
          t.objectExpression([
            ...getCommonWrapperFields.call(this, {
              t,
              path,
              id: ++exprKey,
              kind: 'variable',
            }),
          ]),
          t.arrayExpression(
            identifiers.map((id) =>
              t.objectExpression([
                t.objectProperty(t.identifier('name'), t.stringLiteral(id.name)),
                t.objectProperty(t.identifier('value'), id),
              ])
            )
          ),
        ])

        path.insertAfter(t.expressionStatement(callExpression))
      },

      // foo()
      // await foo()
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
