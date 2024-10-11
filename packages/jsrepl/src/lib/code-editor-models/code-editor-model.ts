import type * as Monaco from 'monaco-editor'

export abstract class CodeEditorModel {
  monacoModel: Monaco.editor.ITextModel
  #value: string | null = null

  constructor(model: Monaco.editor.ITextModel) {
    this.monacoModel = model

    this.monacoModel.onDidChangeContent(() => {
      this.#invalidateCache()
    })
  }

  getValue(): string {
    return this.#value ?? (this.#value = this.monacoModel.getValue())
  }

  /**
   * File path relative to the root of the project, starting with `/`.
   */
  get filePath(): string {
    return this.monacoModel.uri.path
  }

  /**
   * File extension including the dot, e.g. `.ts`.
   * If there is no extension, returns an empty string.
   */
  get fileExtension(): string {
    const ext = this.filePath.split('.').pop()
    return ext ? '.' + ext : ''
  }

  get kind() {
    if (/tailwind\.config\.(js|ts)$/.test(this.filePath)) {
      return 'tailwind-config'
    }

    if (this.filePath === '/index.html') {
      return 'index-html'
    }

    switch (this.fileExtension) {
      case '.ts':
      case '.js':
      case '.tsx':
      case '.jsx':
        return 'client-script'
      case '.css':
        return 'stylesheet'
    }

    return 'other'
  }

  #invalidateCache() {
    this.#value = null
  }
}
