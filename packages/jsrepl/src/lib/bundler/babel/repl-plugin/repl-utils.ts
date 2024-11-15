import type { NodePath, PluginPass, types } from '@babel/core'
import { ReplPayload, ReplPayloadContext, identifierNameRepl } from '@jsrepl/shared-types'
import { assert } from '@/lib/assert'

let nextId = -1

export function getNextId() {
  nextId = (nextId + 1) % Number.MAX_SAFE_INTEGER
  return nextId
}

export function getBaseCtx(
  this: PluginPass,
  {
    path,
    id = getNextId(),
    source = path.getSource(),
    loc = getLocation(path),
  }: {
    path: NodePath
    id?: number
    source?: string
    loc?: Omit<types.SourceLocation, 'identifierName' | 'filename'> | null
  }
): Omit<ReplPayloadContext, 'kind'> {
  const filePath = this.filename!
  assert(filePath != null, 'filePath must be defined')
  assert(filePath.startsWith('/'), 'filePath must start with /')
  assert(loc != null, 'loc must be defined: ' + path.toString())

  return {
    id,
    source,
    filePath,
    lineStart: loc!.start.line,
    lineEnd: loc!.end.line,
    colStart: loc!.start.column + 1,
    colEnd: loc!.end.column + 1,
  }
}

export function initReplCallExpression({ types: t }: { types: typeof types }) {
  const ctxList: ReplPayload['ctx'][] = []

  function r(
    ctx: ReplPayload['ctx'],
    value: types.Expression | types.SpreadElement | types.ArgumentPlaceholder
  ) {
    ctxList.push(ctx)

    const callExpression = t.callExpression(t.identifier(identifierNameRepl), [
      typeof ctx.id === 'number' ? t.numericLiteral(ctx.id) : t.stringLiteral(ctx.id),
      value,
    ])

    return callExpression
  }

  return { r, ctxList }
}

function getLocation(path: NodePath): types.SourceLocation | null {
  if (isNewlyCreatedPath(path)) {
    return path.parentPath !== null ? getLocation(path.parentPath) : null
  }

  return path.node.loc ?? null
}

export function isNewlyCreatedPath(path: NodePath) {
  return !('loc' in path.node)
}
