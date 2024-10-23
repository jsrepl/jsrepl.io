import { useContext } from 'react'
import { LucideEllipsisVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import * as ReplFS from '@/lib/repl-fs'
import { FilesPanelContext } from './files-panel-context'
import { NewFileMenuItems } from './new-file-menu-items'

export function Actions({ path, entry }: { path: string; entry: ReplFS.Entry }) {
  const { treeViewRef, createFolder, deleteItem, setEditingItem, duplicateItem } =
    useContext(FilesPanelContext)!

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
            const input = treeViewRef.current?.querySelector(
              'input[data-editing]'
            ) as HTMLInputElement | null
            if (input) {
              input.focus()
              e.preventDefault()
            }
          }}
        >
          {entry.kind === ReplFS.Kind.Directory && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>New File…</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <NewFileMenuItems dirPath={path} />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => createFolder(path, '')}>
                New Folder…
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() =>
              setEditingItem({ path, kind: entry.kind, isNew: false, editingType: 'name' })
            }
          >
            Rename…
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setEditingItem({ path, kind: entry.kind, isNew: false, editingType: 'path' })
            }}
          >
            Move…
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateItem(path)}>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => deleteItem(path)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
