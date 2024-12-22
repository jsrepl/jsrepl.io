import type { NodePath, PluginObj, PluginPass, types } from '@babel/core'
import {
  ReplPayload,
  ReplPayloadConsoleLog,
  ReplPayloadContextKind,
  identifierNameFunctionMeta,
} from '@jsrepl/shared-types'
import { getBaseCtx, getNextId, initReplCallExpression } from './repl-utils'
import { initSkip } from './skip-utils'

export type ReplPluginMetadata = {
  replPlugin: {
    ctxList: ReplPayload['ctx'][]
  }
}

export function replPlugin({ types: t }: { types: typeof types }): PluginObj {
  const { skip, shouldSkip } = initSkip()
  const { r, ctxList } = initReplCallExpression({ types: t })

  function ForInOrOfStatement(
    this: PluginPass,
    path: NodePath<types.ForInStatement | types.ForOfStatement>
  ) {
    if (shouldSkip(path)) {
      return
    }

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
        const replCallExpression = r(
          {
            ...getBaseCtx.call(this, {
              path: variable.path,
            }),
            kind: ReplPayloadContextKind.Assignment,
            memberName: variable.identifier.name,
          },
          variable.identifier
        )

        const replExprStatement = t.expressionStatement(replCallExpression)
        bodyPath.unshiftContainer('body', replExprStatement)
        skip([replExprStatement, replCallExpression])
      }
    }
  }

  return {
    post(file) {
      const metadata = file.metadata as ReplPluginMetadata
      metadata.replPlugin = { ctxList }
    },

    visitor: {
      CallExpression(path) {
        if (shouldSkip(path)) {
          return
        }

        const callee = path.node.callee

        // console.xxx(...) -> console.xxx.apply(console, [identifierNameRepl](...))
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object) &&
          callee.object.name === 'console' &&
          t.isIdentifier(callee.property) &&
          ['log', 'debug', 'info', 'warn', 'error'].includes(callee.property.name)
        ) {
          const replCallExpression = r(
            {
              ...getBaseCtx.call(this, {
                path,
              }),
              kind: ('console-' + callee.property.name) as ReplPayloadConsoleLog['ctx']['kind'],
            },
            t.arrayExpression(
              path.node.arguments.filter((arg) => t.isExpression(arg) || t.isSpreadElement(arg))
            )
          )

          const newExpr = t.callExpression(t.memberExpression(callee, t.identifier('apply')), [
            callee.object,
            replCallExpression,
          ])

          path.replaceWith(newExpr)
          skip([newExpr, replCallExpression])
        }
      },

      ForStatement(path) {
        if (shouldSkip(path)) {
          return
        }

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
            const replCallExpression = r(
              {
                ...getBaseCtx.call(this, {
                  path: variable.path,
                }),
                kind: ReplPayloadContextKind.Assignment,
                memberName: variable.identifier.name,
              },
              variable.identifier
            )

            const replExprStatement = t.expressionStatement(replCallExpression)
            bodyPath.unshiftContainer('body', replExprStatement)
            skip([replExprStatement, replCallExpression])
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
        if (shouldSkip(path)) {
          return
        }

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
          const replCallExpression = r(
            {
              ...getBaseCtx.call(this, {
                path: variable.path,
              }),
              kind: ReplPayloadContextKind.Variable,
              varName: variable.identifier.name,
              varKind: path.node.kind,
            },
            variable.identifier
          )

          const replExprStatement = t.expressionStatement(replCallExpression)
          path.insertAfter(replExprStatement)
          skip([replExprStatement, replCallExpression])
        }
      },

      // foo()
      // await foo()
      ExpressionStatement(path) {
        if (shouldSkip(path)) {
          return
        }

        // skip console.xxx(...) - handled in CallExpression
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
            const replCallExpression = r(
              {
                ...getBaseCtx.call(this, {
                  path: member.path,
                }),
                kind: ReplPayloadContextKind.Assignment,
                memberName: member.name,
              },
              member.node
            )

            const replExprStatement = t.expressionStatement(replCallExpression)
            path.insertAfter(replExprStatement)
            skip([replExprStatement, replCallExpression])
          }

          return
        }

        const replCallExpression = r(
          {
            ...getBaseCtx.call(this, {
              path,
            }),
            kind: ReplPayloadContextKind.Expression,
          },
          path.node.expression
        )

        const replExprStatement = t.expressionStatement(replCallExpression)
        path.replaceWith(replExprStatement)
        skip([replExprStatement, replCallExpression])
      },

      // const foo = function() {} -> FunctionExpression
      // function foo() {} -> FunctionDeclaration
      // () => {} -> ArrowFunctionExpression
      Function(path) {
        if (shouldSkip(path)) {
          return
        }

        const fnMetaStatement = t.expressionStatement(
          t.callExpression(t.identifier(identifierNameFunctionMeta), [
            t.stringLiteral(path.getSource()),
          ])
        )
        skip([fnMetaStatement, fnMetaStatement.expression])

        let fnId =
          t.isFunctionDeclaration(path.node) || t.isFunctionExpression(path.node)
            ? path.node.id
            : t.isObjectMethod(path.node) && !path.node.computed && t.isIdentifier(path.node.key)
              ? path.node.key
              : null

        // Infer function id from variable id
        if (
          !fnId &&
          path.parentPath.isVariableDeclarator() &&
          t.isIdentifier(path.parentPath.node.id)
        ) {
          fnId = path.parentPath.node.id
        }

        const params: {
          name: string
          path: NodePath
          node: types.Identifier
        }[] = []

        const paramsPath = path.get('params')
        paramsPath.forEach((paramPath) => {
          const param = paramPath.node
          if (t.isIdentifier(param)) {
            params.push({ name: param.name, path: paramPath, node: param })
          } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
            params.push({ name: param.left.name, path: paramPath, node: param.left })
          } else if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
            params.push({ name: param.argument.name, path: paramPath, node: param.argument })
          } else {
            paramPath.traverse({
              AssignmentPattern(path) {
                path.skipKey('right')
              },
              ObjectProperty(path) {
                path.skipKey('key')
              },
              Identifier(path) {
                params.push({ name: path.node.name, path, node: path.node })
              },
            })
          }
        })

        let arrowFnArgsIdentifier: types.Identifier | null = null
        let arrowFnArgsDeclaration: types.VariableDeclaration | null = null
        if (t.isArrowFunctionExpression(path.node)) {
          arrowFnArgsIdentifier = path.scope.generateUidIdentifier('args')
          arrowFnArgsDeclaration =
            path.node.params.length > 0
              ? t.variableDeclaration('let', [
                  t.variableDeclarator(t.arrayPattern(path.node.params), arrowFnArgsIdentifier),
                ])
              : null

          path.node.params = [t.restElement(arrowFnArgsIdentifier)]
          skip([arrowFnArgsDeclaration, arrowFnArgsIdentifier].filter((x) => x !== null))
        }

        const replCallExpression = r(
          {
            ...getBaseCtx.call(this, {
              path: path,
              // Stick to fn name location
              loc:
                fnId != null
                  ? fnId.loc!
                  : ({
                      start: path.node.loc!.start,
                      // Not a typo, use start location in case fnId is not defined
                      end: path.node.loc!.start,
                    } as Omit<types.SourceLocation, 'identifierName' | 'filename'>),
              source: `${fnId?.name ?? 'anonymous'}(${paramsPath.map((p) => p.getSource()).join(', ')})`,
            }),
            kind: ReplPayloadContextKind.FunctionCall,
            name: fnId?.name ?? null,
            isAsync: path.node.async ?? false,
            isGenerator: path.node.generator ?? false,
            isArrow: path.isArrowFunctionExpression(),
          },
          path.isArrowFunctionExpression()
            ? arrowFnArgsIdentifier!
            : t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('from')), [
                t.identifier('arguments'),
              ])
        )

        const replExprStatement = t.expressionStatement(replCallExpression)
        skip([replExprStatement, replCallExpression])

        const newBodyNodes = [fnMetaStatement, arrowFnArgsDeclaration, replExprStatement].filter(
          (x) => x !== null
        )

        for (const param of params) {
          const replCallExpression = r(
            {
              ...getBaseCtx.call(this, {
                path: param.path,
              }),
              kind: ReplPayloadContextKind.Assignment,
              memberName: param.name,
            },
            param.node
          )

          const replExprStatement = t.expressionStatement(replCallExpression)
          newBodyNodes.push(replExprStatement)
          skip([replExprStatement, replCallExpression])
        }

        const bodyPath = path.get('body')
        if (bodyPath.isBlockStatement()) {
          bodyPath.unshiftContainer('body', newBodyNodes)
        } else if (bodyPath.isExpression()) {
          // Handle arrow functions with expression bodies
          const returnArgument = bodyPath.node
          bodyPath.replaceWith(
            t.blockStatement([...newBodyNodes, t.returnStatement(returnArgument)])
          )
        }
      },

      ReturnStatement(path) {
        if (shouldSkip(path)) {
          return
        }

        const parentFunctionPath = path.findParent((p) =>
          p.isFunction()
        ) as NodePath<types.Function> | null
        if (!parentFunctionPath) {
          return
        }

        let returnCtxDisplayId = parentFunctionPath.getData('return-ctx-id') as number | null
        if (!returnCtxDisplayId) {
          returnCtxDisplayId = getNextId()
          parentFunctionPath.setData('return-ctx-id', returnCtxDisplayId)
        }

        // Handle both empty and non-empty return statements
        const returnArgument = path.node.argument || t.identifier('undefined')
        const retVarIdentifier = path.scope.parent.generateUidIdentifier('ret')
        const retVarDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(retVarIdentifier, returnArgument),
        ])

        const replCallExpression = r(
          {
            ...getBaseCtx.call(this, {
              path: path,
              displayId: returnCtxDisplayId,
            }),
            kind: ReplPayloadContextKind.Return,
          },
          retVarIdentifier
        )

        const replExprStatement = t.expressionStatement(replCallExpression)

        // If the return statement is not in a block, wrap it in a block
        if (!path.parentPath.isBlockStatement()) {
          const returnStatement = t.returnStatement(retVarIdentifier)
          path.replaceWith(
            t.blockStatement([retVarDeclaration, replExprStatement, returnStatement])
          )

          skip([
            retVarDeclaration,
            replExprStatement,
            replExprStatement.expression,
            returnStatement,
          ])
        } else {
          path.insertBefore(retVarDeclaration)
          path.insertBefore(replExprStatement)
          path.get('argument').replaceWith(retVarIdentifier)

          skip([retVarDeclaration, replExprStatement, replExprStatement.expression])
        }
      },
    },
  }
}
