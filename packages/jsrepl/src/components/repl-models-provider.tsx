import React, { useContext, useMemo } from 'react'
import * as monaco from 'monaco-editor'
import { ReplModelsContext, ReplModelsContextType } from '@/context/repl-models-context'
import { ReplRewindModeContext } from '@/context/repl-rewind-mode-context'
import { ReplStateContext } from '@/context/repl-state-context'
import { CodeEditorModel } from '@/lib/code-editor-model'
import * as ReplFS from '@/lib/repl-fs'
import { foreverReadOnlyFiles } from '@/lib/repl-fs-meta'

export default function ReplModelsProvider({ children }: { children: React.ReactNode }) {
  const { replState } = useContext(ReplStateContext)!
  const { rewindMode } = useContext(ReplRewindModeContext)!

  const models = useMemo(() => {
    const map = new Map<string, InstanceType<typeof CodeEditorModel>>()
    console.log('models')

    replState.fs.walk('/', (path, entry) => {
      if (entry.kind === ReplFS.Kind.File) {
        const uri = monaco.Uri.parse('file://' + path)
        const model = new CodeEditorModel(uri, entry)
        map.set(uri.path, model)
      }
    })

    for (const monacoModel of monaco.editor.getModels()) {
      if (!map.has(monacoModel.uri.path)) {
        console.log('monacoModel dispose in models', monacoModel.uri.path)
        monacoModel.dispose()
      }
    }

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

  const contextValue = useMemo<ReplModelsContextType>(
    () => ({ models, readOnlyModels }),
    [models, readOnlyModels]
  )

  return <ReplModelsContext.Provider value={contextValue}>{children}</ReplModelsContext.Provider>
}
