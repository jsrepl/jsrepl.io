import { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react'
import { EditingItem } from './edit-item'

export type FilesPanelContextType = {
  treeViewRef: React.RefObject<HTMLDivElement>
  setExpandedItemIds: Dispatch<SetStateAction<string[]>>
  setEditingItem: Dispatch<SetStateAction<EditingItem | null>>
  setSelectedItemId: Dispatch<SetStateAction<string>>
  createFile: (parentDirPath: string, name?: string, fileContent?: string, noEdit?: boolean) => void
  createFolder: (parentDirPath: string, name?: string) => void
  duplicateItem: (path: string) => void
  deleteItem: (path: string) => void
}

export const FilesPanelContext = createContext<FilesPanelContextType | null>(null)
