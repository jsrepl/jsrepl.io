import * as monaco from 'monaco-editor'
import type { ModelDef } from '@/types'
import { CodeEditorModel } from './code-editor-model'
import { CssCodeEditorModel } from './css-code-editor-model'
import { HtmlCodeEditorModel } from './html-code-editor-model'
import { JsCodeEditorModel } from './js-code-editor-model'

export function createCodeEditorModel(
  modelDef: ModelDef
): InstanceType<typeof CodeEditorModel> | null {
  const monacoModel = monaco.editor.createModel(
    modelDef.content,
    getLanguage(modelDef),
    monaco.Uri.parse('file://' + modelDef.path)
  )

  let model: InstanceType<typeof CodeEditorModel> | null

  if (monacoModel.getLanguageId() === 'typescript') {
    model = new JsCodeEditorModel(monacoModel)
  } else if (monacoModel.getLanguageId() === 'html') {
    model = new HtmlCodeEditorModel(monacoModel)
  } else if (monacoModel.getLanguageId() === 'css') {
    model = new CssCodeEditorModel(monacoModel)
  } else {
    console.error('Unsupported model', modelDef)
    model = null
  }

  return model
}

function getLanguage(model: ModelDef): string {
  const ext = model.path.split('.').pop()
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
