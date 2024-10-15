import { useCallback, useContext, useMemo } from 'react'
import { TreeDataItem, TreeView } from '@/components/ui/tree-view'
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplStateContext } from '@/context/repl-state-context'
import * as ReplFS from '@/lib/repl-fs'
import { ReplInfo } from '@/types/repl.types'

export default function FilesPanel() {
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { replInfo } = useContext(ReplInfoContext)!

  const treeData: TreeDataItem[] = useMemo(() => {
    return fsToTreeViewData(replState.fs, replInfo)
  }, [replState.fs, replInfo])

  const onSelectChange = useCallback(
    (item: TreeDataItem | undefined) => {
      if (item?.children) {
        return
      }

      setReplState((state) => {
        const activeModel = item?.id ?? ''
        const openedModels =
          activeModel && !state.openedModels.includes(activeModel)
            ? [...state.openedModels, activeModel]
            : state.openedModels
        return { ...state, activeModel, openedModels }
      })
    },
    [setReplState]
  )

  return (
    <>
      <div className="h-repl-header flex items-center gap-2 pl-4 text-sm leading-6">
        <span className="text-muted-foreground font-semibold">Files</span>
      </div>
      <TreeView
        data={treeData}
        expandAll
        selectedItemId={replState.activeModel}
        onSelectChange={onSelectChange}
        className="text-muted-foreground z-0 ml-2 p-0"
      />
    </>
  )
}

function fsToTreeViewData(fs: ReplFS.FS, replInfo: ReplInfo | null): TreeDataItem[] {
  const data: TreeDataItem[] = []

  fs.walk('/', (path, entry, pipedData) => {
    if (entry === fs.root) {
      return data
    }

    const lastSlashIndex = path.lastIndexOf('/')
    const name = path.slice(lastSlashIndex + 1)

    const hasErrors = () =>
      replInfo?.errors.some((e) => e.location?.file && '/' + e.location.file === path)
    const hasWarnings = () =>
      replInfo?.warnings.some((e) => e.location?.file && '/' + e.location.file === path)

    const node: TreeDataItem = {
      id: path,
      name,
      textClassName: hasErrors() ? 'text-red-500' : hasWarnings() ? 'text-yellow-500' : undefined,
    }

    if (entry.kind === ReplFS.Kind.Directory) {
      node.children = []
    }

    const currentChildren = pipedData as TreeDataItem[]
    currentChildren.push(node)

    return node.children
  })

  return data
}
