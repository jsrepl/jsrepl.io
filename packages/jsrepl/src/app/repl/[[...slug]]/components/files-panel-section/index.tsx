import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import {
  PanelSection,
  PanelSectionContent,
  PanelSectionHeader,
  PanelSectionHeaderActions,
  PanelSectionTrigger,
} from '@/components/panel-section'
import { TreeDataItem, TreeView } from '@/components/ui/tree-view'
import { useReplInfo } from '@/hooks/useReplInfo'
import { useReplRewindMode } from '@/hooks/useReplRewindMode'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import * as ReplFS from '@/lib/repl-fs'
import ChangedMarker from './changed-marker'
import { CollapseFoldersHeaderAction } from './collapse-folders-header-action'
import { EditItem, EditingItem } from './edit-item'
import { NewFileHeaderAction } from './new-file-header-action'
import { NewFolderHeaderAction } from './new-folder-header-action'
import { FilesPanelProvider } from './provider'
import { findTreeDataItem, fsEntryToTreeDataItem, getAutoExpandedItemIds } from './utils'

export default function FilesPanelSection({ id: sectionId }: { id: string }) {
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
    <FilesPanelProvider
      isReadOnly={isReadOnly}
      treeViewRef={treeViewRef}
      setExpandedItemIds={setExpandedItemIds}
      setEditingItem={setEditingItem}
      setSelectedItemId={setSelectedItemId}
    >
      <PanelSection value={sectionId} className="group/files-panel">
        <PanelSectionHeader>
          <PanelSectionTrigger>Files</PanelSectionTrigger>
          <PanelSectionHeaderActions>
            <NewFileHeaderAction />
            <NewFolderHeaderAction />
            <CollapseFoldersHeaderAction />
          </PanelSectionHeaderActions>
        </PanelSectionHeader>

        <PanelSectionContent>
          <TreeView
            ref={treeViewRef}
            data={treeData}
            selectedItemId={selectedItemId}
            onSelectChange={onSelectChange}
            expandedItemIds={expandedItemIds}
            onExpandChange={onExpandChange}
            className="text-muted-foreground z-0 pb-6"
          />
        </PanelSectionContent>
      </PanelSection>
    </FilesPanelProvider>
  )
}
