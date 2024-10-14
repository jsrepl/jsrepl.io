import * as monaco from 'monaco-editor'
import * as ReplFS from '@/lib/repl-fs'
import { CodeEditorModel } from './code-editor-model'

export function createCodeEditorModel({
  path,
  file,
}: {
  path: string
  file: ReplFS.File
}): InstanceType<typeof CodeEditorModel> {
  const uri = monaco.Uri.parse('file://' + path)
  const monacoModel = monaco.editor.createModel(file.content, getLanguage(path), uri)
  const model = new CodeEditorModel(file, monacoModel)
  return model
}

function getLanguage(path: string): string {
  const ext = path.split('.').pop()
  if (!ext) {
    return 'plaintext'
  }

  const language = {
    tsx: 'typescript',
    ts: 'typescript',
    js: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
  }[ext]

  return language ?? 'plaintext'
}
