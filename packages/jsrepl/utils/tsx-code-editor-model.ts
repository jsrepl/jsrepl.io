import type { BabelTransformResult, BabelTransformResultError } from '@/types/babel.types'
import { transformCode } from '@/utils/transform-code'
import type * as Babel from '@babel/standalone'

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
