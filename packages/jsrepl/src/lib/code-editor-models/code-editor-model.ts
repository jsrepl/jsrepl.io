import type * as Monaco from 'monaco-editor'

export abstract class CodeEditorModel {
  monacoModel: Monaco.editor.ITextModel
  #value: string | null = null

  constructor(model: Monaco.editor.ITextModel) {
    this.monacoModel = model

    this.monacoModel.onDidChangeContent(() => {
      this.invalidateCache()
    })
  }

  getValue(): string {
    return this.#value ?? (this.#value = this.monacoModel.getValue())
  }

  invalidateCache() {
    this.#value = null
  }
}
