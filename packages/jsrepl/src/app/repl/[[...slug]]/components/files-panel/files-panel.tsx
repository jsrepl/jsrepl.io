import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LucideCopyMinus, LucideFilePlus, LucideFolderPlus } from 'lucide-react'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TreeDataItem, TreeView } from '@/components/ui/tree-view'
import { useReplInfo } from '@/hooks/useReplInfo'
import { useReplRewindMode } from '@/hooks/useReplRewindMode'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import * as ReplFS from '@/lib/repl-fs'
import ChangedMarker from './changed-marker'
import { EditItem, EditingItem } from './edit-item'
import { FilesPanelContextType, FilesPanelProvider } from './files-panel-provider'
import { NewFileMenuItems } from './new-file-menu-items'
import { findTreeDataItem, fsEntryToTreeDataItem, getAutoExpandedItemIds } from './utils'

export default function FilesPanel() {
  const [replState, setReplState] = useReplStoredState()
  const [replInfo] = useReplInfo()
  const [rewindMode] = useReplRewindMode()
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string>(replState.activeModel)
  const treeDataRef = useRef<TreeDataItem[]>([])
  const treeViewRef = useRef<HTMLDivElement>(null)

  const isReadOnly = rewindMode.active

  const treeData: TreeDataItem[] = useMemo(() => {
    const [root] = fsEntryToTreeDataItem('/', replState.fs.root, replInfo)

    if (editingItem && !isReadOnly) {
      if (editingItem.isNew) {
        const itemName = editingItem.path.split('/').pop()!
        const parentDir = findTreeDataItem(editingItem.path.slice(0, -itemName.length - 1), root)
        if (parentDir && parentDir.children) {
          parentDir.children.unshift({
            id: '__new__',
            name: itemName,
            marker: ChangedMarker,
            customContent: <EditItem editingItem={editingItem} />,
            children: editingItem.kind === ReplFS.Kind.Directory ? [] : undefined,
          })
        }
      } else {
        const item = findTreeDataItem(editingItem.path, root)
        if (item) {
          delete item.title
          delete item.actions
          delete item.onClick
          item.customContent = <EditItem editingItem={editingItem} />
        }
      }
    }

    return root.children!
  }, [replState.fs, replInfo, editingItem, isReadOnly])

  useEffect(() => {
    treeDataRef.current = treeData
  }, [treeData])

  const [expandedItemIds, setExpandedItemIds] = useState<string[]>(
    getAutoExpandedItemIds(treeData, selectedItemId, true)
  )

  const onSelectChange = useCallback(
    (item: TreeDataItem | undefined) => {
      setSelectedItemId(item?.id ?? '')

      if (item && !item.children) {
        setReplState((state) => {
          const activeModel = item?.id ?? ''
          const openedModels =
            activeModel && !state.openedModels.includes(activeModel)
              ? [...state.openedModels, activeModel]
              : state.openedModels
          return { ...state, activeModel, openedModels }
        })

        requestAnimationFrame(() => {
          monaco.editor.getEditors()[0]?.focus()
        })
      }
    },
    [setReplState]
  )

  const onExpandChange = useCallback((item: TreeDataItem, expanded: boolean) => {
    setExpandedItemIds((ids) => {
      if (expanded) {
        return ids.includes(item.id) ? ids : [...ids, item.id]
      } else {
        return ids.filter((id) => id !== item.id)
      }
    })
  }, [])

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
    [setEditingItem, setExpandedItemIds]
  )

  const filesPanelContextValue: FilesPanelContextType = useMemo(
    () => ({
      treeViewRef,
      isReadOnly,
      setExpandedItemIds,
      setEditingItem,
      setSelectedItemId,
      createFile,
      createFolder,
      duplicateItem,
      deleteItem,
    }),
    [createFile, createFolder, deleteItem, duplicateItem, isReadOnly]
  )

  useEffect(() => {
    setSelectedItemId(replState.activeModel)

    const autoExpandedIds = getAutoExpandedItemIds(
      treeDataRef.current,
      replState.activeModel,
      false
    )
    setExpandedItemIds((ids) => {
      return [...new Set([...ids, ...autoExpandedIds])]
    })

    requestAnimationFrame(() => {
      const activeElement = treeViewRef.current?.querySelector('[data-active="true"]')
      activeElement?.scrollIntoView({ block: 'nearest' })
    })
  }, [replState.activeModel])

  return (
    <>
      <FilesPanelProvider value={filesPanelContextValue}>
        <ScrollArea className="group/files-panel flex-1 [&>[data-radix-scroll-area-viewport]]:scroll-pb-4 [&>[data-radix-scroll-area-viewport]]:scroll-pt-10">
          <div className="h-repl-header bg-secondary sticky top-0 z-[1] flex items-center gap-2 pl-4 pr-1 text-xs leading-6">
            <span className="text-muted-foreground flex-1 font-semibold">FILES</span>
            <div className="invisible flex group-focus-within/files-panel:visible group-hover/files-panel:visible has-[[aria-expanded=true]]/files-panel:visible">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground"
                        disabled={isReadOnly}
                      >
                        <LucideFilePlus size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>
                    New File…
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent
                  onCloseAutoFocus={(e) => {
                    const input = treeViewRef.current?.querySelector(
                      'input[data-editing]'
                    ) as HTMLInputElement | null
                    if (input) {
                      input.focus()
                      e.preventDefault()
                    }
                  }}
                >
                  <NewFileMenuItems dirPath="" />
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    disabled={isReadOnly}
                    onClick={() => createFolder('')}
                  >
                    <LucideFolderPlus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  New Folder…
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    onClick={() => {
                      setExpandedItemIds([])
                    }}
                  >
                    <LucideCopyMinus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  Collapse Folders
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <TreeView
            ref={treeViewRef}
            data={treeData}
            selectedItemId={selectedItemId}
            onSelectChange={onSelectChange}
            expandedItemIds={expandedItemIds}
            onExpandChange={onExpandChange}
            className="text-muted-foreground z-0 pb-6 pt-2"
          />
          <ScrollBar orientation="vertical" className="z-[2]" />
        </ScrollArea>
      </FilesPanelProvider>
    </>
  )
}
