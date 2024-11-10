import type { NodePath, PluginObj, PluginPass, types } from '@babel/core'
import { ReplPayload } from '@jsrepl/shared-types'
import { assert } from '@/lib/assert'

let nextId = -1

export function replPlugin({ types: t }: { types: typeof types }): PluginObj {
  const processedNodes = new WeakSet()

  function ForInOrOfStatement(
    this: PluginPass,
    path: NodePath<types.ForInStatement | types.ForOfStatement>
  ) {
    if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
      return
    }

    processedNodes.add(path.node)
    path.skipKey('left')

    const leftPath = path.get('left')
    if (t.isVariableDeclaration(leftPath.node) && t.isBlockStatement(path.node.body)) {
      const vars: {
        path: NodePath<types.Identifier | types.LVal>
        identifier: types.Identifier
      }[] = []

      const declarations = leftPath.get('declarations') as NodePath<types.VariableDeclarator>[]
      declarations.forEach((declaration) => {
        const declarationId = declaration.get('id')
        if (t.isIdentifier(declarationId.node)) {
          vars.push({ path: declarationId, identifier: declarationId.node })
        } else {
          declarationId.traverse({
            AssignmentPattern(path) {
              path.skipKey('right')
            },
            ObjectProperty(path) {
              path.skipKey('key')
            },
            Identifier(path) {
              vars.push({ path, identifier: path.node })
            },
          })
        }
      })

      const bodyPath = path.get('body') as NodePath<types.BlockStatement>

      for (const variable of vars.reverse()) {
        const callExpression = t.callExpression(t.identifier('__r'), [
          t.objectExpression([
            ...getCommonWrapperFields.call(this, {
              t,
              path: variable.path,
              kind: 'assignment',
            }),
            t.objectProperty(t.identifier('memberName'), t.stringLiteral(variable.identifier.name)),
          ]),
          variable.identifier,
        ])

        bodyPath.unshiftContainer('body', t.expressionStatement(callExpression))
      }
    }
  }

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
                    kind: ('console-' + callee.property.name) as ReplPayload['ctx']['kind'],
                  }),
                ]),
                ...path.node.arguments,
              ]),
            ])
          )
        }
      },

      ForStatement(path) {
        if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
          return
        }

        processedNodes.add(path.node)
        path.skipKey('init')
        path.skipKey('update')

        const updatePath = path.get('update')
        if (
          t.isUpdateExpression(updatePath.node) &&
          t.isIdentifier(updatePath.node.argument) &&
          t.isBlockStatement(path.node.body)
        ) {
          const vars: {
            path: NodePath<types.Identifier>
            identifier: types.Identifier
          }[] = [
            {
              path: updatePath.get('argument') as NodePath<types.Identifier>,
              identifier: updatePath.node.argument,
            },
          ]

          const bodyPath = path.get('body') as NodePath<types.BlockStatement>

          for (const variable of vars.reverse()) {
            const callExpression = t.callExpression(t.identifier('__r'), [
              t.objectExpression([
                ...getCommonWrapperFields.call(this, {
                  t,
                  path: variable.path,
                  kind: 'assignment',
                }),
                t.objectProperty(
                  t.identifier('memberName'),
                  t.stringLiteral(variable.identifier.name)
                ),
              ]),
              variable.identifier,
            ])

            bodyPath.unshiftContainer('body', t.expressionStatement(callExpression))
          }
        }
      },

      ForInStatement(path) {
        ForInOrOfStatement.call(this, path)
      },

      ForOfStatement(path) {
        ForInOrOfStatement.call(this, path)
      },

      // const z = foo()
      // const [ccc, a = '', { x: cc }, [xbx = 'a'], ...b] = await foo()
      // const x1 = 1, x2 = 2
      VariableDeclaration(path) {
        if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
          return
        }

        processedNodes.add(path.node)

        const vars: {
          path: NodePath<types.Identifier | types.LVal>
          identifier: types.Identifier
        }[] = []

        const declarations = path.get('declarations')
        declarations.forEach((declaration) => {
          const declarationId = declaration.get('id')
          if (t.isIdentifier(declarationId.node)) {
            vars.push({ path: declarationId, identifier: declarationId.node })
          } else {
            declarationId.traverse({
              AssignmentPattern(path) {
                path.skipKey('right')
              },
              ObjectProperty(path) {
                path.skipKey('key')
              },
              Identifier(path) {
                vars.push({ path, identifier: path.node })
              },
            })
          }
        })

        for (const variable of vars.reverse()) {
          const callExpression = t.callExpression(t.identifier('__r'), [
            t.objectExpression([
              ...getCommonWrapperFields.call(this, {
                t,
                path: variable.path,
                kind: 'variable',
              }),
              t.objectProperty(t.identifier('varName'), t.stringLiteral(variable.identifier.name)),
              t.objectProperty(t.identifier('varKind'), t.stringLiteral(path.node.kind)),
            ]),
            variable.identifier,
          ])

          path.insertAfter(t.expressionStatement(callExpression))
        }
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

        // ;[window.hhh] = foo();
        // ({ x: hhh } = foo({x: 1}));
        // window.hhh = foo();
        // let h; [h] = foo()
        if (t.isAssignmentExpression(path.node.expression)) {
          const members: {
            name: string
            path: NodePath
            node: types.Identifier | types.MemberExpression
          }[] = []

          const left = path.get('expression.left') as NodePath<types.Node>

          if (t.isIdentifier(left.node)) {
            // asd = bar()
            members.push({ name: left.node.name, path: left, node: left.node })
          } else if (t.isMemberExpression(left.node)) {
            // window.hhh = foo();
            members.push({ name: left.toString(), path: left, node: left.node })
          } else {
            // ;[window.hhh] = foo();
            // ({ x: hhh } = foo({x: 1}));
            left.traverse({
              AssignmentPattern(path) {
                path.skipKey('right')
              },
              ObjectProperty(path) {
                path.skipKey('key')
              },
              MemberExpression(path) {
                members.push({ name: path.toString(), path, node: path.node })
                path.skip()
              },
              Identifier(path) {
                members.push({ name: path.node.name, path, node: path.node })
              },
            })
          }

          for (const member of members.reverse()) {
            const callExpression = t.callExpression(t.identifier('__r'), [
              t.objectExpression([
                ...getCommonWrapperFields.call(this, {
                  t,
                  path: member.path,
                  kind: 'assignment',
                }),
                t.objectProperty(t.identifier('memberName'), t.stringLiteral(member.name)),
              ]),
              member.node,
            ])

            path.insertAfter(t.expressionStatement(callExpression))
          }

          return
        }

        const callExpression = t.callExpression(t.identifier('__r'), [
          t.objectExpression([
            ...getCommonWrapperFields.call(this, {
              t,
              path,
              kind: 'expression',
            }),
          ]),
          path.node.expression,
        ])

        path.replaceWith(t.expressionStatement(callExpression))
      },

      ReturnStatement(path) {
        if (isNewlyCreatedPath(path) || processedNodes.has(path.node)) {
          return
        }

        processedNodes.add(path.node)

        // Handle both empty and non-empty return statements
        const returnArgument = path.node.argument || t.identifier('undefined')
        const retVarIdentifier = path.scope.parent.generateUidIdentifier('ret')
        const retVarDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(retVarIdentifier, returnArgument),
        ])

        const callExpression = t.callExpression(t.identifier('__r'), [
          t.objectExpression([
            ...getCommonWrapperFields.call(this, {
              t,
              path: path,
              kind: 'return',
            }),
          ]),
          retVarIdentifier,
        ])

        // If the return statement is not in a block, wrap it in a block
        if (!path.parentPath.isBlockStatement()) {
          path.replaceWith(
            t.blockStatement([
              retVarDeclaration,
              t.expressionStatement(callExpression),
              t.returnStatement(retVarIdentifier),
            ])
          )
        } else {
          path.insertBefore(retVarDeclaration)
          path.insertBefore(t.expressionStatement(callExpression))
          path.get('argument').replaceWith(retVarIdentifier)
        }
      },
    },
  }
}

function getCommonWrapperFields(
  this: PluginPass,
  {
    t,
    path,
    kind,
  }: {
    t: typeof types
    path: NodePath
    kind: ReplPayload['ctx']['kind']
  }
) {
  const filePath = this.filename!
  assert(filePath != null, 'filePath must be defined')
  assert(filePath.startsWith('/'), 'filePath must start with /')

  nextId = (nextId + 1) % Number.MAX_SAFE_INTEGER

  return [
    t.objectProperty(t.identifier('id'), t.numericLiteral(nextId)),
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
        ? t.numericLiteral(path.node.loc.start.column + 1)
        : t.nullLiteral()
    ),
    t.objectProperty(
      t.identifier('colEnd'),
      path.node?.loc?.end?.column != null
        ? t.numericLiteral(path.node.loc.end.column + 1)
        : t.nullLiteral()
    ),
  ]
}

function isNewlyCreatedPath(path: NodePath) {
  return !path.node.loc
}
