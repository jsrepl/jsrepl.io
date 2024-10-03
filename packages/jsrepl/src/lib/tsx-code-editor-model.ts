import type * as Babel from '@babel/standalone'
import type { BabelTransformResult, BabelTransformResultError } from '@/types'
import { CodeEditorModel } from './code-editor-model'
import { transformCode } from './transform-code'

export class TsxCodeEditorModel extends CodeEditorModel {
  #babelTransformResult: BabelTransformResult | BabelTransformResultError | null = null

  getBabelTransformResult(babel: typeof Babel): BabelTransformResult | BabelTransformResultError {
    return (
      this.#babelTransformResult ??
      (this.#babelTransformResult = transformCode(babel, this.getValue()))
    )
  }

  override invalidateCache() {
    super.invalidateCache()
    this.#babelTransformResult = null
  }
}
