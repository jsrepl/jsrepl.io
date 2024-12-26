import type { NodePath, types } from '@babel/core'

// This is a workaround for skipping child nodes.
// `path.skip()` does not work for child paths that are created within a visitor.
// https://github.com/babel/babel/issues/11147
export function initSkip() {
  const skipped = new WeakSet()

  function skip(path: NodePath<types.Node> | NodePath<types.Node>[]): void
  function skip(node: types.Node | types.Node[]): void
  function skip(
    path: NodePath<types.Node> | NodePath<types.Node>[] | types.Node | types.Node[]
  ): void {
    if (Array.isArray(path)) {
      path.forEach(skip)
    } else {
      skipped.add(isPath(path) ? path.node : path)
    }
  }

  function shouldSkip(node: types.Node): boolean
  function shouldSkip(path: NodePath<types.Node>): boolean
  function shouldSkip(path: NodePath<types.Node> | types.Node): boolean {
    return skipped.has(isPath(path) ? path.node : path)
  }

  return { skip, shouldSkip }
}

function isPath(pathOrNode: NodePath<types.Node> | types.Node): pathOrNode is NodePath<types.Node> {
  return 'node' in pathOrNode
}
