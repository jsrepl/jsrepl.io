import { createContext, useEffect, useMemo } from 'react'
import * as monaco from 'monaco-editor'
import { useReplRewindMode } from '@/hooks/useReplRewindMode'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { CodeEditorModel } from '@/lib/code-editor-model'
import { getFileExtension } from '@/lib/fs-utils'
import * as ReplFS from '@/lib/repl-fs'
import { foreverReadOnlyFiles } from '@/lib/repl-fs-meta'

export type ReplModelsContextType = {
  models: Map<string, CodeEditorModel>
  readOnlyModels: Map<string, { message: string }>
}

export const ReplModelsContext = createContext<ReplModelsContextType | null>(null)

const monacoModelRefs = new Set<monaco.editor.ITextModel>()

export default function ReplModelsProvider({ children }: { children: React.ReactNode }) {
  const [replState] = useReplStoredState()
  const [rewindMode] = useReplRewindMode()

  const models = useMemo(() => {
    const map = new Map<string, InstanceType<typeof CodeEditorModel>>()

    ReplFS.walk(replState.fs, '/', (path, entry) => {
      if (entry.kind === ReplFS.Kind.File) {
        const uri = monaco.Uri.parse('file://' + path)
        const model = new CodeEditorModel(uri, entry)

        const value = model.getValue()
        let monacoModel = monaco.editor.getModel(model.uri)
        if (!monacoModel) {
          monacoModel = monaco.editor.createModel(
            value,
            getMonacoLanguage(model.filePath),
            model.uri
          )
        } else if (value !== monacoModel.getValue()) {
          monacoModel.setValue(value)
        }

        model.monacoModel = monacoModel
        monacoModelRefs.add(monacoModel)

        map.set(uri.path, model)
      }
    })

    return map
  }, [replState.fs])

  const readOnlyModels = useMemo(() => {
    const map = new Map<string, { message: string }>()

    for (const filePath of foreverReadOnlyFiles) {
      map.set(filePath, { message: 'This file is read-only' })
    }

    if (rewindMode.active) {
      for (const model of models.values()) {
        map.set(model.filePath, { message: 'This file is read-only in Rewind mode' })
      }
    }

    return map
  }, [models, rewindMode.active])

  useEffect(() => {
    const actualMonacoModels = Array.from(models.values()).map((model) => model.monacoModel)
    const currentMonacoModels = Array.from(monacoModelRefs)

    for (const monacoModel of currentMonacoModels) {
      if (!actualMonacoModels.includes(monacoModel)) {
        monacoModel.dispose()
        monacoModelRefs.delete(monacoModel)
      }
    }
  }, [models])

  return (
    <ReplModelsContext.Provider value={{ models, readOnlyModels }}>
      {children}
    </ReplModelsContext.Provider>
  )
}

function getMonacoLanguage(path: string): string {
  const ext = getFileExtension(path)
  if (!ext) {
    return 'plaintext'
  }

  const language = {
    '.tsx': 'typescript',
    '.ts': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.json': 'json',
    '.html': 'html',
    '.css': 'css',
    '.md': 'markdown',
  }[ext]

  return language ?? 'plaintext'
}
