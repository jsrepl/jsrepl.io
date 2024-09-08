import type * as Monaco from 'monaco-editor'

export class InfoModelShared {
  model: Monaco.editor.ITextModel
  #value: string | null = null

  constructor(model: Monaco.editor.ITextModel) {
    this.model = model
  }

  getValue(): string {
    return this.#value ?? (this.#value = this.model.getValue())
  }

  invalidateCache() {
    this.#value = null
  }
}
