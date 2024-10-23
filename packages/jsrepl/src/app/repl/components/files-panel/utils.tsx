import { LucideFolderOpen } from 'lucide-react'
import { TreeDataItem } from '@/components/ui/tree-view'
import * as ReplFS from '@/lib/repl-fs'
import { ReplInfo } from '@/types/repl.types'
import { FileIcon } from '../file-icon'
import { Actions } from './actions'

export function getAutoExpandedItemIds(
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

export function fsEntryToTreeDataItem(
  path: string,
  entry: ReplFS.Entry,
  replInfo: ReplInfo | null
): [TreeDataItem, { hasErrors: boolean; hasWarnings: boolean }] {
  const lastSlashIndex = path.lastIndexOf('/')
  const name = path.slice(lastSlashIndex + 1)

  const hasErrors =
    replInfo?.errors.some((e) => e.location?.file && '/' + e.location.file === path) ?? false
  const hasWarnings =
    replInfo?.warnings.some((e) => e.location?.file && '/' + e.location.file === path) ?? false

  let childrenHaveErrors = false
  let childrenHaveWarnings = false

  let children: TreeDataItem[] | undefined
  if (entry.kind === ReplFS.Kind.Directory) {
    const parentPath = path === '/' ? '' : path
    children = Object.entries(entry.children)
      .map(([name, entry]) => {
        const [child, data] = fsEntryToTreeDataItem(parentPath + '/' + name, entry, replInfo)
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
    icon: ({ className }: { className?: string }) => (
      <FileIcon name={name} isFolder={entry.kind === ReplFS.Kind.Directory} className={className} />
    ),
    openIcon: entry.kind === ReplFS.Kind.Directory ? LucideFolderOpen : undefined,
    actions: <Actions path={path} entry={entry} />,
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
