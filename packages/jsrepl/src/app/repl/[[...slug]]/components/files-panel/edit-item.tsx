import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import * as ReplFS from '@/lib/repl-fs'
import { FileIcon } from '../file-icon'
import { useFilesPanel } from './useFilesPanel'

export type EditingItem = {
  path: string
  kind: ReplFS.Kind
  isNew: boolean
  newFileContent?: string
  editingType: 'name' | 'path'
}

export function EditItem({ editingItem }: { editingItem: EditingItem }) {
  const [replState, setReplState] = useReplStoredState()
  const { setEditingItem, setSelectedItemId } = useFilesPanel()

  const { path, kind, editingType } = editingItem
  const name = path.slice(path.lastIndexOf('/') + 1)
  const defaultValue = editingType === 'name' ? name : path

  const [inputValue, setInputValue] = useState(name)

  const newName: string = useMemo(() => {
    if (editingType === 'name') {
      return inputValue
    } else if (editingType === 'path') {
      return inputValue.slice(inputValue.lastIndexOf('/') + 1)
    } else {
      return ''
    }
  }, [inputValue, editingType])

  const onConfirm = useCallback(
    (value: string) => {
      if (value.endsWith('/')) {
        value = value.slice(0, -1)
      }

      if (!value.trim()) {
        setEditingItem(null)
        return
      }

      const fs = replState.fs

      const oldPath = editingItem.path
      const newPath = ReplFS.normalizePath(
        editingItem.editingType === 'name'
          ? oldPath.slice(0, oldPath.lastIndexOf('/') + 1) + value
          : value
      )

      if (!ReplFS.validatePath(newPath)) {
        toast.warning(`Invalid path "${newPath}".`)
        return
      }

      if (!editingItem.isNew && newPath === oldPath) {
        setEditingItem(null)
        return
      }

      if (ReplFS.exists(fs, newPath)) {
        toast.warning(`Path "${newPath}" already exists. Choose another name.`)
        return
      }

      if (editingItem.isNew) {
        setReplState((state) => {
          const fs = ReplFS.clone(state.fs)
          const isDir = editingItem.kind === ReplFS.Kind.Directory

          try {
            if (isDir) {
              ReplFS.mkdir(fs, newPath)
            } else {
              ReplFS.writeFile(fs, newPath, editingItem.newFileContent ?? '')
            }
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : `Failed to create path "${newPath}".`
            )
            return state
          }

          if (isDir) {
            setSelectedItemId(newPath)
          }

          return {
            ...state,
            fs,
            activeModel: isDir ? state.activeModel : newPath,
            openedModels:
              isDir || state.openedModels.includes(newPath)
                ? state.openedModels
                : [...state.openedModels, newPath],
          }
        })
      } else {
        setReplState((state) => {
          const fs = ReplFS.clone(state.fs)

          try {
            ReplFS.rename(fs, oldPath, newPath)
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : `Failed to rename path "${oldPath}".`
            )
            return state
          }

          // Handling renaming of activeModel itself or any of its parent directories.
          const activeModel = state.activeModel.startsWith(oldPath)
            ? newPath + state.activeModel.slice(oldPath.length)
            : state.activeModel

          // Handling renaming of some openedModels themselves or any of their parent directories.
          let openedModels = state.openedModels
          if (openedModels.some((m) => m.startsWith(oldPath))) {
            openedModels = openedModels.map((x) =>
              x.startsWith(oldPath) ? newPath + x.slice(oldPath.length) : x
            )
          }

          return { ...state, fs, activeModel, openedModels }
        })
      }

      setEditingItem(null)
    },
    [replState.fs, setReplState, setEditingItem, setSelectedItemId, editingItem]
  )

  return (
    <>
      <FileIcon
        name={newName}
        isFolder={kind === ReplFS.Kind.Directory}
        className="mr-2 h-4 w-4 shrink-0"
      />
      <input
        data-editing={path}
        defaultValue={defaultValue}
        placeholder={defaultValue}
        pattern={
          editingType === 'name' ? '^[a-zA-Z0-9_\\-.\\(\\) ]+$' : '^\\/[\\/a-zA-Z0-9_\\-.\\(\\) ]+$'
        }
        className="ring-border outline-primary invalid:outline-destructive invalid:ring-destructive -ml-1 mr-1 min-w-0 flex-grow px-1 text-sm outline-offset-2 ring-1 invalid:ring-2"
        onBlur={(event) => {
          const value = (event.target as HTMLInputElement).value
          onConfirm(value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            const value = (event.target as HTMLInputElement).value
            onConfirm(value)
          } else if (event.key === 'Escape') {
            setEditingItem(null)
          }
        }}
        onChange={(event) => setInputValue(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onFocus={(event) => {
          if (editingType === 'name') {
            const input = event.target as HTMLInputElement
            const value = input.value
            const extensionIndex = value.lastIndexOf('.')
            if (extensionIndex !== -1) {
              input.setSelectionRange(0, extensionIndex)
            } else {
              input.select()
            }
          }
        }}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
      />
    </>
  )
}
