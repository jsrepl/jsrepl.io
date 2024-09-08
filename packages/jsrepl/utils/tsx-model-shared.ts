import type { BabelTransformResult, BabelTransformResultError } from '@/types/babel.types'
import { transformCode } from '@/utils/transform-code'
import type * as Babel from '@babel/standalone'
import type * as Monaco from 'monaco-editor'

export class TsxModelShared {
  model: Monaco.editor.ITextModel
  #value: string | null = null
  #babelTransformResult: BabelTransformResult | BabelTransformResultError | null = null

  constructor(model: Monaco.editor.ITextModel) {
    this.model = model
  }

  getValue(): string {
    return this.#value ?? (this.#value = this.model.getValue())
  }

  getBabelTransformResult(babel: typeof Babel): BabelTransformResult | BabelTransformResultError {
    return (
      this.#babelTransformResult ??
      (this.#babelTransformResult = transformCode(babel, this.getValue()))
    )
  }

  invalidateCache() {
    this.#value = null
    this.#babelTransformResult = null
  }
}
