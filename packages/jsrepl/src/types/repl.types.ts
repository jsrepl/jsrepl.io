import { CopilotModel, CopilotOptions, CopilotProvider } from '@nag5000/monacopilot'
import type * as esbuild from 'esbuild-wasm'
import type * as monaco from 'monaco-editor'
import type * as ReplFS from '@/lib/repl-fs'

export type ReplStoredState = {
  fs: ReplFS.FS
  /**
   * Array of absolute paths to the opened models. Paths start with '/'.
   */
  openedModels: string[]
  /**
   * Absolute path to the active model, starting with '/'.
   * In case of no active model use '' (empty string).
   */
  activeModel: string
  showPreview: boolean
}

export type UserStoredState = {
  /**
   * Last used App version. It is used to show New Version toast.
   */
  version: string | undefined
  previewPos: PreviewPosition
  /**
   * [width, height]
   */
  previewSize: [number, number]
  showLeftSidebar: boolean
  leftSidebarWidth: number
  autostartOnCodeChange: boolean
  editor: {
    fontSize: number
    renderLineHighlight: RenderLineHighlight
    lineNumbers: LineNumbers
  }
  copilot: {
    apiKey: string
    provider: CopilotProvider
    model: CopilotModel
    maxContextLines: number
    useRelatedFiles: boolean
    enableCaching: boolean
  }
}

export type RenderLineHighlight = Exclude<
  monaco.editor.IStandaloneEditorConstructionOptions['renderLineHighlight'],
  undefined
>
export type LineNumbers = Exclude<monaco.editor.LineNumbersType, (lineNumber: number) => string>

export enum PreviewPosition {
  FloatBottomRight = 'float-bottom-right',
  FloatTopRight = 'float-top-right',
  AsideRight = 'aside-right',
}

export type ImportMap = {
  imports: Record<string, string>
}

export type ReplInfo = {
  ok: boolean
  errors: esbuild.Message[]
  warnings: esbuild.Message[]
}
