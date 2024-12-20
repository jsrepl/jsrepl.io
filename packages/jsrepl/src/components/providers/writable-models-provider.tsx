import { createContext, useCallback, useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { useReplModels } from '@/hooks/useReplModels'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { DebouncedFunction, debounce } from '@/lib/debounce'
import { Deferred, deferred } from '@/lib/deferred'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'

export type WritableModelsContextType = {
  flushPendingChanges: () => Promise<ReplStoredState>
}

export const WritableModelsContext = createContext<WritableModelsContextType | null>(null)

export default function WritableModelsProvider({ children }: { children: React.ReactNode }) {
  const [replState, setReplState] = useReplStoredState()
  const replStateRef = useRef(replState)
  const { models } = useReplModels()

  const changedModelsRef = useRef(new Set<monaco.editor.ITextModel>())
  const applyChangesDebouncedRef = useRef<DebouncedFunction<typeof applyChanges>>(undefined)
  const replStateRenderedDeferRef = useRef<Deferred<void> | null>(null)

  useEffect(() => {
    replStateRenderedDeferRef.current?.resolve()
    replStateRef.current = replState
  }, [replState])

  const applyChanges = useCallback(() => {
    setReplState((prev) => {
      if (changedModelsRef.current.size === 0) {
        return prev
      }

      replStateRenderedDeferRef.current = deferred()

      const fs = ReplFS.clone(prev.fs)
      for (const model of changedModelsRef.current) {
        ReplFS.writeFile(fs, model.uri.path, model.getValue())
        changedModelsRef.current.delete(model)
      }
      return {
        ...prev,
        fs,
      }
    })
  }, [setReplState])

  useEffect(() => {
    const debounced = debounce(applyChanges, 300, {
      // 1. Display dirty state immediately. After immediate execution, the debounced function will be called on the trailing edge of the timeout.
      // 2. In formatAndSave action (Cmd+S) saveReplState will get the latest actual state after formatting.
      immediate: true,
    })

    // It is expected that the debounced fn should be a stable reference and
    // survive re-renders after the fn is called and ReplFS is updated.
    applyChangesDebouncedRef.current = debounced

    return () => {
      debounced.clear()
    }
  }, [applyChanges])

  useEffect(() => {
    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        changedModelsRef.current.add(model.monacoModel)
        applyChangesDebouncedRef.current!()
      })
    })

    return () => {
      applyChangesDebouncedRef.current?.clear()
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [models])

  const flushPendingChanges = useCallback(async () => {
    applyChangesDebouncedRef.current?.flush()
    await replStateRenderedDeferRef.current?.promise
    return replStateRef.current
  }, [])

  return (
    <WritableModelsContext.Provider value={{ flushPendingChanges }}>
      {children}
    </WritableModelsContext.Provider>
  )
}
