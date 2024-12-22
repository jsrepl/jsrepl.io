import type Parser from '@babel/parser'
import type {
  ArrowFunctionExpression,
  FunctionExpression,
  ObjectExpression,
  ObjectMethod,
} from '@babel/types'
import { identifierNameFunctionMeta } from '@jsrepl/shared-types'
import { getBabel } from '../get-babel'

// Let babel to parse this madness.
// - function (arg1, arg2) {}
// - async function (arg1, arg2) {}
// - function name(arg1, arg2) {}
// - async function name(arg1, arg2) {}
// - function name(arg1, arg2 = 123, ...args) {}
// - () => {}
// - async () => {}
// - args1 => {}
// - async args1 => {}
// - (args1, args2) => {}
// - async (args1, args2) => {}
// - function ({ jhkhj, asdad = 123 } = {}) {}
// - () => 7
// - function (asd = adsasd({})) { ... }
// - get() { return 123 } // method, obj property
// - set(value) { this.value = value } // method, obj property
// - foo(value) {} // method, obj property
// - async foo(value) {} // async method, obj property
// - var obj = { foo: async function bar () {} } // async method, obj property, but defined with function keyword and name
export function parseFunction(
  str: string,
  _isOriginalSource = false
): {
  name: string
  args: string
  isAsync: boolean
  isArrow: boolean
  isMethod: boolean
  origSource: string | null
} | null {
  const babel = getBabel()[0].value!

  // @ts-expect-error Babel standalone: https://babeljs.io/docs/babel-standalone#internal-packages
  const { parser } = babel.packages as { parser: typeof Parser }

  let ast: ArrowFunctionExpression | FunctionExpression | ObjectMethod

  try {
    // ArrowFunctionExpression | FunctionExpression
    ast = parser.parseExpression(str) as ArrowFunctionExpression | FunctionExpression
  } catch {
    try {
      // ObjectMethod?
      str = `{${str}}`
      const objExpr = parser.parseExpression(str) as ObjectExpression
      if (
        objExpr.type === 'ObjectExpression' &&
        objExpr.properties.length === 1 &&
        objExpr.properties[0]!.type === 'ObjectMethod'
      ) {
        ast = objExpr.properties[0]! as ObjectMethod
      } else {
        return null
      }
    } catch {
      return null
    }
  }

  let origSource: string | null = null

  if (!_isOriginalSource) {
    origSource = getFunctionOriginalSource(ast)
    if (origSource) {
      return parseFunction(origSource, true)
    }
  } else {
    origSource = str
  }

  if (ast.type === 'ArrowFunctionExpression') {
    return {
      name: '',
      args: ast.params.map((param) => str.slice(param.start!, param.end!)).join(', '),
      isAsync: ast.async,
      isArrow: true,
      isMethod: false,
      origSource,
    }
  }

  if (ast.type === 'FunctionExpression') {
    return {
      name: ast.id?.name ?? '',
      args: ast.params.map((param) => str.slice(param.start!, param.end!)).join(', '),
      isAsync: ast.async,
      isArrow: false,
      isMethod: false,
      origSource,
    }
  }

  if (ast.type === 'ObjectMethod') {
    return {
      name: ast.computed ? '' : ast.key.type === 'Identifier' ? ast.key.name : '',
      args: ast.params.map((param) => str.slice(param.start!, param.end!)).join(', '),
      isAsync: ast.async,
      isArrow: false,
      isMethod: true,
      origSource,
    }
  }

  return null
}

function getFunctionOriginalSource(
  ast: ArrowFunctionExpression | FunctionExpression | ObjectMethod
): string | null {
  if (
    (ast.type === 'ArrowFunctionExpression' ||
      ast.type === 'FunctionExpression' ||
      ast.type === 'ObjectMethod') &&
    ast.body.type === 'BlockStatement'
  ) {
    const node = ast.body.body[0]
    if (
      node?.type === 'ExpressionStatement' &&
      node.expression.type === 'CallExpression' &&
      node.expression.callee.type === 'Identifier' &&
      node.expression.callee.name === identifierNameFunctionMeta &&
      node.expression.arguments[0]?.type === 'StringLiteral'
    ) {
      return node.expression.arguments[0].value
    }
  }

  return null
}
