import { createContext, useDeferredValue, useMemo } from 'react'
import { useReplSave } from '@/hooks/useReplSave'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import * as ReplFS from '@/lib/repl-fs'

export type ReplFSChangesContextType = {
  changes: Map<string, { type: 'created' | 'updated' }>
}

export const ReplFSChangesContext = createContext<ReplFSChangesContextType | null>(null)

export function ReplFSChangesProvider({ children }: { children: React.ReactNode }) {
  const [replState] = useReplStoredState()
  const [savedReplState] = useReplSave()

  const changesDeps = useMemo(() => {
    return { fs: replState.fs, savedFs: savedReplState.fs }
  }, [replState.fs, savedReplState.fs])

  const deferredChangesDeps = useDeferredValue(changesDeps)

  const changes = useMemo(() => {
    const { fs, savedFs } = deferredChangesDeps
    const flatSavedFs = flattenFS(savedFs)
    const map = new Map<string, { type: 'created' | 'updated' }>()

    ReplFS.walk(fs, '/', (path, entry, parents) => {
      const savedEntry = flatSavedFs.get(path)
      if (!savedEntry) {
        map.set(path, { type: 'created' })
      } else if (
        entry.kind !== savedEntry.kind ||
        (entry.kind === ReplFS.Kind.File &&
          savedEntry.kind === ReplFS.Kind.File &&
          entry.content !== savedEntry.content) ||
        (entry.kind === ReplFS.Kind.Directory &&
          savedEntry.kind === ReplFS.Kind.Directory &&
          Object.keys(entry.children).length !== Object.keys(savedEntry.children).length)
      ) {
        map.set(path, { type: 'updated' })
      } else {
        return
      }

      parents.forEach(({ path }) => {
        if (!map.has(path)) {
          map.set(path, { type: 'updated' })
        }
      })
    })

    return map
  }, [deferredChangesDeps])

  return (
    <ReplFSChangesContext.Provider value={{ changes }}>{children}</ReplFSChangesContext.Provider>
  )
}

function flattenFS(fs: ReplFS.FS) {
  const map = new Map<string, ReplFS.Entry>()

  ReplFS.walk(fs, '/', (path, entry) => {
    map.set(path, entry)
  })

  return map
}
