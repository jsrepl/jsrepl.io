import type * as Monaco from 'monaco-editor'
import * as ReplFS from '@/lib/repl-fs'
import { readOnlyFiles } from '@/lib/repl-fs-meta'
import { virtualFilesStorage } from '@/lib/virtual-files-storage'
import { getFileExtension } from './fs-utils'

export class CodeEditorModel {
  #uri: Monaco.Uri
  #file: ReplFS.File
  #monacoModel: Monaco.editor.ITextModel | null = null

  constructor(uri: Monaco.Uri, file: ReplFS.File) {
    this.#uri = uri
    this.#file = file
  }

  getValue(): string {
    const file = this.#file
    const content = this.isVirtualFile
      ? virtualFilesStorage.get(this.virtualFilePath!) ?? file.content
      : file.content
    return content
  }

  setValue(value: string) {
    if (this.isReadOnly) {
      return
    }

    const file = this.#file
    if (this.isVirtualFile) {
      virtualFilesStorage.set(this.virtualFilePath!, value)
    } else {
      file.content = value
    }
  }

  get file() {
    return this.#file
  }

  get isVirtualFile() {
    return this.#file.content.startsWith('virtual://')
  }

  get virtualFilePath() {
    return this.isVirtualFile ? this.#file.content : null
  }

  get isReadOnly() {
    return readOnlyFiles.has(this.filePath)
  }

  get uri() {
    return this.#uri
  }

  /**
   * File path relative to the root of the project, starting with `/`.
   */
  get filePath(): string {
    return this.#uri.path
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

  get monacoModel(): Monaco.editor.ITextModel {
    if (!this.#monacoModel) {
      throw new Error('monacoModel is not set')
    }

    return this.#monacoModel
  }

  set monacoModel(model: Monaco.editor.ITextModel) {
    this.#monacoModel = model
  }
}
