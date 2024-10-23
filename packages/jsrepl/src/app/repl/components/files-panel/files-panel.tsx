import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplStateContext } from '@/context/repl-state-context'
import * as ReplFS from '@/lib/repl-fs'
import { EditItem, EditingItem } from './edit-item'
import { FilesPanelContext, FilesPanelContextType } from './files-panel-context'
import { NewFileMenuItems } from './new-file-menu-items'
import { fsEntryToTreeDataItem, getAutoExpandedItemIds } from './utils'

export default function FilesPanel() {
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { replInfo } = useContext(ReplInfoContext)!
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string>(replState.activeModel)
  const treeDataRef = useRef<TreeDataItem[]>([])
  const treeViewRef = useRef<HTMLDivElement>(null)

  const treeData: TreeDataItem[] = useMemo(() => {
    const [root] = fsEntryToTreeDataItem('/', replState.fs.root, replInfo)

    if (editingItem) {
      const dirNames = editingItem.path.split('/').slice(1)
      const itemName = dirNames.pop()!
      const dir = dirNames.reduce<TreeDataItem | undefined>(
        (dir, itemName) => dir?.children?.find((i) => i.name === itemName),
        root
      )
      if (dir && dir.children) {
        if (editingItem.isNew) {
          dir.children.unshift({
            id: '__new__',
            name: itemName,
            customContent: <EditItem editingItem={editingItem} />,
            children: editingItem.kind === ReplFS.Kind.Directory ? [] : undefined,
          })
        } else {
          const item = dir.children.find((i) => i.name === itemName)
          if (item) {
            delete item.title
            delete item.actions
            delete item.onClick
            item.customContent = <EditItem editingItem={editingItem} />
          }
        }
      }
    }

    treeDataRef.current = root.children!
    return root.children!
  }, [replState.fs, replInfo, editingItem])

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

  const deleteItem = useCallback(
    (path: string) => {
      path = replState.fs.normalizePath(path)
      const entry = replState.fs.get(path)
      if (!entry) {
        return
      }

      setReplState((state) => {
        const fs = state.fs.clone()
        const ok = fs.remove(path)
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
                const fs = state.fs.clone()
                fs.mkdir(path)
                return { ...state, fs }
              })
            }
          : () => {
              setReplState((state) => {
                const fs = state.fs.clone()
                fs.writeFile(path, entry.content)
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
          const fs = state.fs.clone()
          const path = parentDirPath + '/' + name

          if (fs.exists(path)) {
            toast.warning(`File "${path}" already exists.`)
          } else {
            fs.writeFile(path, fileContent)
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
    },
    [setEditingItem, setExpandedItemIds]
  )

  const filesPanelContextValue: FilesPanelContextType = useMemo(
    () => ({
      treeViewRef,
      setExpandedItemIds,
      setEditingItem,
      setSelectedItemId,
      createFile,
      createFolder,
      deleteItem,
    }),
    [createFile, createFolder, deleteItem]
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
      <FilesPanelContext.Provider value={filesPanelContextValue}>
        <ScrollArea className="group/files-panel flex-1 [&>[data-radix-scroll-area-viewport]]:scroll-pb-4 [&>[data-radix-scroll-area-viewport]]:scroll-pt-10">
          <div className="h-repl-header bg-background sticky top-0 z-[1] flex items-center gap-2 pl-4 pr-1 text-sm leading-6">
            <span className="text-muted-foreground flex-1 font-semibold">Files</span>
            <div className="invisible flex group-focus-within/files-panel:visible group-hover/files-panel:visible has-[[aria-expanded=true]]/files-panel:visible">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-secondary-foreground/50"
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
                    className="text-secondary-foreground/50"
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
                    className="text-secondary-foreground/50"
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
            className="text-muted-foreground z-0 pb-6 pl-2 pr-0 pt-2"
          />
          <ScrollBar orientation="vertical" className="z-[2]" />
        </ScrollArea>
      </FilesPanelContext.Provider>
    </>
  )
}
