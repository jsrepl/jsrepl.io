import type * as Monaco from 'monaco-editor'
import * as ReplFS from '@/lib/repl-fs'
import { getFileExtension } from './fs-utils'

export class CodeEditorModel {
  file: ReplFS.File
  monacoModel: Monaco.editor.ITextModel
  #value: string | null = null
  #disposables: Array<() => void> = []

  constructor(file: ReplFS.File, model: Monaco.editor.ITextModel) {
    this.file = file
    this.monacoModel = model

    const disposable = this.monacoModel.onDidChangeContent(() => {
      this.#invalidateCache()
    })
    this.#disposables.push(() => disposable.dispose())
  }

  /**
   * Disposes event listeners, attached to the monaco model.
   * NOTE: it does not dispose the monaco model itself.
   */
  dispose() {
    this.#disposables.forEach((disposable) => disposable())
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
    return getFileExtension(this.filePath)
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
