import { useCallback, useRef } from 'react'
import { useEffect } from 'react'
import * as monaco from 'monaco-editor'
import { useReplSave } from '../useReplSave'

export function useMonacoSaveCommand() {
  const [, saveReplState] = useReplSave()

  const save = useCallback(async () => {
    await saveReplState()
  }, [saveReplState])

  const saveRef = useRef(save)

  useEffect(() => {
    saveRef.current = save
  }, [save])

  useEffect(() => {
    const disposable = monaco.editor.registerCommand('jsrepl.save', () => saveRef.current())

    return () => {
      disposable.dispose()
    }
  }, [])

  useEffect(() => {
    const disposable = monaco.editor.addKeybindingRules([
      {
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        command: 'jsrepl.save',
      },
    ])

    return () => {
      disposable.dispose()
    }
  }, [])
}
