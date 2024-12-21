import { Dispatch, SetStateAction, useCallback } from 'react'
import { createContext } from 'react'
import { toast } from 'sonner'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import * as ReplFS from '@/lib/repl-fs'
import { EditingItem } from './edit-item'

export type FilesPanelContextType = {
  treeViewRef: React.RefObject<HTMLDivElement | null>
  isReadOnly: boolean
  setExpandedItemIds: Dispatch<SetStateAction<string[]>>
  setEditingItem: Dispatch<SetStateAction<EditingItem | null>>
  setSelectedItemId: Dispatch<SetStateAction<string>>
  createFile: (parentDirPath: string, name?: string, fileContent?: string, noEdit?: boolean) => void
  createFolder: (parentDirPath: string, name?: string) => void
  duplicateItem: (path: string) => void
  deleteItem: (path: string) => void
}

export const FilesPanelContext = createContext<FilesPanelContextType | null>(null)

export function FilesPanelProvider({
  isReadOnly,
  treeViewRef,
  setExpandedItemIds,
  setEditingItem,
  setSelectedItemId,
  children,
}: {
  isReadOnly: boolean
  treeViewRef: React.RefObject<HTMLDivElement | null>
  setExpandedItemIds: Dispatch<SetStateAction<string[]>>
  setEditingItem: Dispatch<SetStateAction<EditingItem | null>>
  setSelectedItemId: Dispatch<SetStateAction<string>>
  children: React.ReactNode
}) {
  const [replState, setReplState] = useReplStoredState()

  const duplicateItem = useCallback(
    (path: string) => {
      path = ReplFS.normalizePath(path)

      const slashLastIndex = path.lastIndexOf('/')
      const dirPath = path.slice(0, slashLastIndex)
      const fileName = path.slice(slashLastIndex + 1)
      const dotLastIndex = fileName.lastIndexOf('.')
      const fileNameWithoutExt = dotLastIndex === -1 ? fileName : fileName.slice(0, dotLastIndex)
      const extWithDot = dotLastIndex === -1 ? '' : fileName.slice(dotLastIndex)

      let suffix = ''
      let newPath = ''
      do {
        suffix += ' (copy)'
        newPath = dirPath + '/' + fileNameWithoutExt + suffix + extWithDot
      } while (ReplFS.exists(replState.fs, newPath))

      setReplState((state) => {
        const fs = ReplFS.clone(state.fs)
        ReplFS.copy(fs, path, newPath)
        return { ...state, fs }
      })
    },
    [replState.fs, setReplState]
  )

  const deleteItem = useCallback(
    (path: string) => {
      path = ReplFS.normalizePath(path)
      const entry = ReplFS.get(replState.fs, path)
      if (!entry) {
        return
      }

      setReplState((state) => {
        const fs = ReplFS.clone(state.fs)
        const ok = ReplFS.remove(fs, path)
        if (!ok) {
          return state
        }

        const activeModelIndex = state.openedModels.indexOf(state.activeModel)

        // Handling removing of some openedModels themselves or any of their parent directories.
        let openedModels = state.openedModels
        if (openedModels.some((m) => m.startsWith(path))) {
          openedModels = openedModels.filter((m) => !m.startsWith(path))
        }

        // Handling removing of activeModel itself or any of its parent directories.
        const activeModel = state.activeModel.startsWith(path)
          ? openedModels[activeModelIndex] ?? openedModels[openedModels.length - 1] ?? ''
          : state.activeModel

        return { ...state, fs, activeModel, openedModels }
      })

      const restoreEntry =
        entry.kind === ReplFS.Kind.Directory
          ? () => {
              setReplState((state) => {
                const fs = ReplFS.clone(state.fs)
                ReplFS.mkdir(fs, path)
                return { ...state, fs }
              })
            }
          : () => {
              setReplState((state) => {
                const fs = ReplFS.clone(state.fs)
                ReplFS.writeFile(fs, path, entry.content)
                return {
                  ...state,
                  fs,
                  activeModel: path,
                  openedModels: state.openedModels.includes(path)
                    ? state.openedModels
                    : [...state.openedModels, path],
                }
              })
            }

      toast(`Deleted ${entry.kind === ReplFS.Kind.Directory ? 'folder' : 'file'} "${path}"`, {
        action: {
          label: 'Restore',
          onClick: restoreEntry,
        },
        duration: 5000,
      })
    },
    [replState.fs, setReplState]
  )

  const createFile = useCallback(
    (
      parentDirPath: string,
      name: string = '',
      fileContent: string = '',
      noEdit: boolean = false
    ) => {
      if (noEdit) {
        setReplState((state) => {
          const fs = ReplFS.clone(state.fs)
          const path = parentDirPath + '/' + name

          if (ReplFS.exists(fs, path)) {
            toast.warning(`File "${path}" already exists.`)
          } else {
            ReplFS.writeFile(fs, path, fileContent)
          }

          return {
            ...state,
            fs,
            activeModel: path,
            openedModels: state.openedModels.includes(path)
              ? state.openedModels
              : [...state.openedModels, path],
          }
        })
      } else {
        setEditingItem({
          path: parentDirPath + '/' + name,
          kind: ReplFS.Kind.File,
          isNew: true,
          newFileContent: fileContent,
          editingType: 'name',
        })
      }

      setExpandedItemIds((ids) => {
        return ids.includes(parentDirPath) ? ids : [...ids, parentDirPath]
      })
    },
    [setEditingItem, setExpandedItemIds, setReplState]
  )

  const createFolder = useCallback(
    (parentDirPath: string, name: string = '') => {
      setEditingItem({
        path: parentDirPath + '/' + name,
        kind: ReplFS.Kind.Directory,
        isNew: true,
        editingType: 'name',
      })

      setExpandedItemIds((ids) => {
        return ids.includes(parentDirPath) ? ids : [...ids, parentDirPath]
      })

      requestAnimationFrame(() => {
        const input = treeViewRef.current?.querySelector(
          'input[data-editing]'
        ) as HTMLInputElement | null
        if (input) {
          input.focus()
        }
      })
    },
    [treeViewRef, setEditingItem, setExpandedItemIds]
  )

  const value: FilesPanelContextType = {
    treeViewRef,
    isReadOnly,
    setExpandedItemIds,
    setEditingItem,
    setSelectedItemId,
    createFile,
    createFolder,
    duplicateItem,
    deleteItem,
  }

  return <FilesPanelContext.Provider value={value}>{children}</FilesPanelContext.Provider>
}
