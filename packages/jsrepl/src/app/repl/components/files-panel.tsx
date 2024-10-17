import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { LucideEllipsisVertical, LucideFolder, LucideFolderOpen } from 'lucide-react'
import * as monaco from 'monaco-editor'
import IconReadme from '~icons/mdi/book-open-variant-outline.jsx'
import IconCodeJson from '~icons/mdi/code-json.jsx'
import IconFile from '~icons/mdi/file-outline.jsx'
import IconLanguageCss from '~icons/mdi/language-css3.jsx'
import IconLanguageHtml from '~icons/mdi/language-html5.jsx'
import IconLanguageJavascript from '~icons/mdi/language-javascript.jsx'
import IconLanguageMarkdown from '~icons/mdi/language-markdown.jsx'
import IconLanguageTypescript from '~icons/mdi/language-typescript.jsx'
import IconReact from '~icons/mdi/react.jsx'
import IconTailwind from '~icons/mdi/tailwind.jsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TreeDataItem, TreeView } from '@/components/ui/tree-view'
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplStateContext } from '@/context/repl-state-context'
import { SetReplStoredState } from '@/hooks/useReplStoredState'
import * as ReplFS from '@/lib/repl-fs'
import { ReplInfo } from '@/types/repl.types'

type Renaming = {
  path: string
  isNew?: boolean
  onComplete?: (path: string) => void
  onCancel?: () => void
} | null

export const FilesPanelContext = createContext<{
  setExpandedItemIds: Dispatch<SetStateAction<string[]>>
} | null>(null)

export default function FilesPanel() {
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { replInfo } = useContext(ReplInfoContext)!
  const [renaming, setRenaming] = useState<Renaming>(null)
  const [selectedItemId, setSelectedItemId] = useState<string>(replState.activeModel)
  const treeDataRef = useRef<TreeDataItem[]>([])
  const treeViewRef = useRef<HTMLDivElement>(null)

  const treeData: TreeDataItem[] = useMemo(() => {
    const [root] = fsEntryToTreeDataItem('/', replState.fs.root, {
      // TODO: use ReplInfoContext
      replInfo,
      // TODO: use FilesPanelContext
      renaming,
      // TODO: use FilesPanelContext
      setRenaming,
      // TODO: use FilesPanelContext
      setReplState,
    })
    treeDataRef.current = root.children!
    return root.children!
  }, [replState.fs, replInfo, renaming, setReplState])

  const [expandedItemIds, setExpandedItemIds] = useState<string[]>(
    getAutoExpandedItemIds(treeData, selectedItemId, true)
  )

  const filesPanelContextValue = useMemo(() => ({ setExpandedItemIds }), [])

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
      <ScrollArea className="flex-1 [&>[data-radix-scroll-area-viewport]]:scroll-pb-4 [&>[data-radix-scroll-area-viewport]]:scroll-pt-10">
        <div className="h-repl-header bg-background sticky top-0 z-[1] flex items-center gap-2 pl-4 text-sm leading-6">
          <span className="text-muted-foreground font-semibold">Files</span>
        </div>
        <FilesPanelContext.Provider value={filesPanelContextValue}>
          <TreeView
            ref={treeViewRef}
            data={treeData}
            selectedItemId={selectedItemId}
            onSelectChange={onSelectChange}
            expandedItemIds={expandedItemIds}
            onExpandChange={onExpandChange}
            className="text-muted-foreground z-0 m-2 p-0 pb-6"
          />
        </FilesPanelContext.Provider>
        <ScrollBar orientation="vertical" className="z-[2]" />
      </ScrollArea>
    </>
  )
}

function getAutoExpandedItemIds(
  treeData: TreeDataItem[],
  selectedItemId: string,
  expandAll: boolean
) {
  if (!selectedItemId && !expandAll) {
    return [] as string[]
  }

  const ids: string[] = []

  function walkTreeItems(items: TreeDataItem[] | TreeDataItem, targetId: string | undefined) {
    if (items instanceof Array) {
      for (let i = 0; i < items.length; i++) {
        ids.push(items[i]!.id)
        if (walkTreeItems(items[i]!, targetId)) {
          return true
        }
        ids.pop()
      }
    } else if (items.id === targetId) {
      return true
    } else if (items.children) {
      return walkTreeItems(items.children, targetId)
    }

    return expandAll
  }

  walkTreeItems(treeData, selectedItemId)
  return ids
}

function fsEntryToTreeDataItem(
  path: string,
  entry: ReplFS.Entry,
  context: {
    replInfo: ReplInfo | null
    renaming: Renaming
    setRenaming: Dispatch<SetStateAction<Renaming>>
    setReplState: SetReplStoredState
  }
): [TreeDataItem, { hasErrors: boolean; hasWarnings: boolean }] {
  const lastSlashIndex = path.lastIndexOf('/')
  const name = path.slice(lastSlashIndex + 1)

  const hasErrors =
    context.replInfo?.errors.some((e) => e.location?.file && '/' + e.location.file === path) ??
    false
  const hasWarnings =
    context.replInfo?.warnings.some((e) => e.location?.file && '/' + e.location.file === path) ??
    false

  let childrenHaveErrors = false
  let childrenHaveWarnings = false

  let children: TreeDataItem[] | undefined
  if (entry.kind === ReplFS.Kind.Directory) {
    const parentPath = path === '/' ? '' : path
    children = Object.entries(entry.children)
      .map(([name, entry]) => {
        const [child, data] = fsEntryToTreeDataItem(parentPath + '/' + name, entry, context)
        childrenHaveErrors ||= data.hasErrors
        childrenHaveWarnings ||= data.hasWarnings
        return child
      })
      .sort(sortTreeDataItem)
  }

  const node: TreeDataItem = {
    id: path,
    name,
    title: path,
    textClassName:
      hasErrors || childrenHaveErrors
        ? 'text-red-500'
        : hasWarnings || childrenHaveWarnings
          ? 'text-yellow-500'
          : undefined,
    icon:
      entry.kind === ReplFS.Kind.Directory
        ? LucideFolder
        : ({ className }: { className?: string }) => getFileIcon(name, className),
    openIcon: entry.kind === ReplFS.Kind.Directory ? LucideFolderOpen : undefined,
    actions: <Actions path={path} entry={entry} context={context} />,
    customText:
      context.renaming?.path === path ? (
        <Rename name={name} path={path} context={context} />
      ) : undefined,
    children,
  }

  return [
    node,
    {
      hasErrors: hasErrors || childrenHaveErrors,
      hasWarnings: hasWarnings || childrenHaveWarnings,
    },
  ]
}

// Directories first, then files.
// Directories and files are sorted alphabetically.
function sortTreeDataItem(a: TreeDataItem, b: TreeDataItem) {
  const aIsDir = a.children !== undefined
  const bIsDir = b.children !== undefined

  if (aIsDir && !bIsDir) {
    return -1
  }

  if (!aIsDir && bIsDir) {
    return 1
  }

  return a.name.localeCompare(b.name)
}

function getFileIcon(filename: string, className?: string) {
  const ext = filename.split('.').pop()?.toLowerCase()

  switch (true) {
    case /tailwind\.config\.(ts|js)?$/i.test(filename):
      return <IconTailwind className={`${className} text-[#38BDF9]`} />

    case /readme\.md$/i.test(filename):
      return <IconReadme className={`${className} text-[#38BDF9]`} />
  }

  switch (ext) {
    case 'tsx':
    case 'jsx':
      return <IconReact className={`${className} text-[#0A7EA4]`} />
    case 'ts':
      return <IconLanguageTypescript className={`${className} text-[#3078C6]`} />
    case 'js':
      return <IconLanguageJavascript className={`${className} text-[#E8D44E]`} />
    case 'html':
      return <IconLanguageHtml className={`${className} text-[#DC4A25]`} />
    case 'css':
      return <IconLanguageCss className={`${className} text-[#3078C6]`} />
    case 'json':
      return <IconCodeJson className={`${className} text-[#CC8000]`} />
    case 'md':
      return <IconLanguageMarkdown className={`${className} text-[#3078C6]`} />
    default:
      return <IconFile className={className} />
  }
}

function Actions({
  path,
  entry,
  context,
}: {
  path: string
  entry: ReplFS.Entry
  context: {
    setRenaming: Dispatch<SetStateAction<Renaming>>
    setReplState: SetReplStoredState
  }
}) {
  const { setReplState, setRenaming } = context
  const { setExpandedItemIds } = useContext(FilesPanelContext)!

  const deleteItem = useCallback(
    (path: string) => {
      setReplState((state) => {
        const fs = new ReplFS.FS(state.fs.root)
        const ok = fs.removeEntry(path)
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
    },
    [setReplState]
  )

  const createFile = useCallback(() => {
    const dir = entry as ReplFS.Directory
    let newFileName = '__newfile'
    if (dir.children[newFileName]) {
      for (let i = 1; i < 9999; i++) {
        newFileName = `__newfile(${i})`
        if (!dir.children[newFileName]) {
          break
        }
      }
    }

    const newFilePath = path + '/' + newFileName
    setReplState((state) => {
      const fs = new ReplFS.FS(state.fs.root)
      fs.writeFile(newFilePath, '')
      return { ...state, fs }
    })

    setRenaming({
      path: newFilePath,
      isNew: true,
      onComplete: (path) => {
        setReplState((state) => ({
          ...state,
          activeModel: path,
          openedModels: state.openedModels.includes(path)
            ? state.openedModels
            : [...state.openedModels, path],
        }))
      },
      onCancel: () => {
        deleteItem(newFilePath)
      },
    })

    setExpandedItemIds((ids) => {
      return ids.includes(path) ? ids : [...ids, path]
    })
  }, [path, setReplState, setRenaming, entry, deleteItem, setExpandedItemIds])

  const createFolder = useCallback(() => {}, [path, setReplState])

  return (
    <div className="flex" onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            asChild
            variant="ghost"
            size="none"
            className="text-secondary-foreground/60 h-6 w-6 p-0.5 ring-inset"
          >
            <div
              tabIndex={0}
              role="button"
              className="focus-visible:ring-primary outline-none focus-visible:ring-2"
            >
              <LucideEllipsisVertical size={16} />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => {
            // TODO: filesPanel.querySelector
            const renameInput = document.querySelector(
              'input[data-rename]'
            ) as HTMLInputElement | null
            if (renameInput) {
              renameInput.focus()
              e.preventDefault()
            }
          }}
        >
          {entry.kind === ReplFS.Kind.Directory && (
            <>
              <DropdownMenuItem onClick={createFile}>New File…</DropdownMenuItem>
              <DropdownMenuItem onClick={createFolder}>New Folder…</DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setRenaming({ path })}>Rename…</DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteItem(path)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function Rename({
  name,
  path,
  context,
}: {
  name: string
  path: string
  context: {
    renaming: Renaming
    setRenaming: Dispatch<SetStateAction<Renaming>>
    setReplState: SetReplStoredState
  }
}) {
  const { renaming, setRenaming, setReplState } = context
  const isNew = renaming?.isNew ?? false

  const onConfirm = useCallback(
    (event: React.SyntheticEvent<HTMLInputElement>) => {
      const newName = (event.target as HTMLInputElement).value
      if (!newName) {
        setRenaming((renaming) => {
          renaming?.onCancel?.()
          return null
        })
        return
      }

      const newPath = renameItem(path, newName, name, setReplState)
      setRenaming((renaming) => {
        if (newPath) {
          renaming?.onComplete?.(newPath)
          return null
        }

        return renaming
      })
    },
    [name, path, setRenaming, setReplState]
  )

  const onCancel = useCallback(() => {
    setRenaming((renaming) => {
      renaming?.onCancel?.()
      return null
    })
  }, [setRenaming])

  return (
    <input
      data-rename={path}
      defaultValue={isNew ? '' : name}
      placeholder={isNew ? '' : name}
      pattern="^[\/a-zA-Z0-9_\-.\(\) ]+$"
      className="ring-border outline-primary invalid:outline-destructive invalid:ring-destructive -ml-1 min-w-0 flex-grow rounded-sm px-1 text-sm outline-offset-2 ring-1 invalid:ring-2"
      onBlur={(event) => {
        onConfirm(event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onConfirm(event)
        } else if (event.key === 'Escape') {
          onCancel()
        }
      }}
      onClick={(event) => event.stopPropagation()}
      onFocus={isNew ? (event) => event.target.select() : undefined}
      autoFocus
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck="false"
    />
  )
}

function renameItem(
  path: string,
  newName: string,
  oldName: string,
  setReplState: SetReplStoredState
): false | string {
  newName = newName.trim()

  if (!newName) {
    return false
  }

  // Validate newName for allowed file name characters, plus "/" which is handled below.
  if (!/^[/a-zA-Z0-9_\-.\(\)\ ]+$/.test(newName)) {
    return false
  }

  // "/" is allowed to provide a new full absolute path, in that case
  // newName must start with "/".
  if (newName.lastIndexOf('/') > 0 && !newName.startsWith('/')) {
    return false
  }

  if (newName === oldName) {
    return path
  }

  let newPath = newName.startsWith('/')
    ? newName
    : path.slice(0, path.lastIndexOf('/')) + '/' + newName

  setReplState((state) => {
    const fs = new ReplFS.FS(state.fs.root)
    newPath = fs.renameEntry(path, newPath)

    // Handling renaming of activeModel itself or any of its parent directories.
    const activeModel = state.activeModel.startsWith(path)
      ? newPath + state.activeModel.slice(path.length)
      : state.activeModel

    // Handling renaming of some openedModels themselves or any of their parent directories.
    let openedModels = state.openedModels
    if (openedModels.some((m) => m.startsWith(path))) {
      openedModels = openedModels.map((x) =>
        x.startsWith(path) ? newPath + x.slice(path.length) : x
      )
    }

    return { ...state, fs, activeModel, openedModels }
  })

  return newPath
}
