import * as monaco from 'monaco-editor'
import type { ModelDef } from '~/types/repl.types'

export function createCodeEditorModel(
  modelDef: ModelDef
): InstanceType<typeof CodeEditorModel> | null {
  const monacoModel = monaco.editor.createModel(
    modelDef.content,
    getLanguage(modelDef),
    monaco.Uri.parse(modelDef.uri)
  )

  let model: InstanceType<typeof CodeEditorModel> | null

  if (monacoModel.uri.toString() === 'file:///tailwind.config.ts') {
    model = new TailwindConfigCodeEditorModel(monacoModel)
  } else if (monacoModel.getLanguageId() === 'typescript') {
    model = new TsxCodeEditorModel(monacoModel)
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
  const ext = model.uri.split('.').pop()
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
