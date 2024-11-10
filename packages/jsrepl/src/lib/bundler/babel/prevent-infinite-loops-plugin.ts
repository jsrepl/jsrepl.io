// Based on https://github.com/facebook/react/blob/ff595de29af107255fd957ca809d3074c16bcf12/scripts/babel/transform-prevent-infinite-loops.js

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * Copyright (c) 2017, Amjad Masad
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { NodePath, PluginObj, template as templateBuilder, types } from '@babel/core'

// Based on https://repl.it/site/blog/infinite-loops.

const MAX_ITERATIONS = 6000

export function preventInfiniteLoopsPlugin({
  types: t,
  template,
}: {
  types: typeof types
  template: typeof templateBuilder
}): PluginObj {
  const buildGuard = template.statement(`
    if (%%iterator%%++ > %%maxIterations%%) {
      throw new RangeError(
        'Potential infinite loop: exceeded ' + %%maxIterations%% + ' iterations.'
      );
    }
  `)

  return {
    visitor: {
      'WhileStatement|ForStatement|DoWhileStatement'(_path) {
        const path = _path as NodePath<
          types.WhileStatement | types.ForStatement | types.DoWhileStatement
        >

        // An iterator that is incremented with each iteration
        const iterator = path.scope.parent.generateUidIdentifier('loopIt')
        const iteratorInit = t.numericLiteral(0)
        path.scope.parent.push({
          id: iterator,
          init: iteratorInit,
        })
        // If statement and throw error if it matches our criteria
        const guard = buildGuard({
          iterator,
          maxIterations: t.numericLiteral(MAX_ITERATIONS),
        })
        const bodyPath = path.get('body')
        // No block statement e.g. `while (1) 1;`
        if (!bodyPath.isBlockStatement()) {
          const statement = bodyPath.node
          bodyPath.replaceWith(t.blockStatement([guard, statement]))
        } else {
          bodyPath.unshiftContainer('body', guard)
        }
      },
    },
  }
}
