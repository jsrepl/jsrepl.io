import { useContext } from 'react'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import {
  defaultDocsMdFileContent,
  defaultHtmlFileContent,
  defaultReadmeMdFileContent,
  defaultTailwindConfigTs,
} from '@/lib/repl-stored-state-library'
import { FileIcon } from '../file-icon'
import { FilesPanelContext } from './files-panel-context'

export function NewFileMenuItems({ dirPath }: { dirPath: string }) {
  const { createFile } = useContext(FilesPanelContext)!

  return (
    <>
      <DropdownMenuItem onClick={() => createFile(dirPath, '.ts')}>
        <FileIcon name=".ts" />
        TypeScript
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => createFile(dirPath, '.js')}>
        <FileIcon name=".js" />
        JavaScript
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => createFile(dirPath, '.tsx')}>
        <FileIcon name=".tsx" />
        TSX
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => createFile(dirPath, '.jsx')}>
        <FileIcon name=".jsx" />
        JSX
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => createFile(dirPath, '.css')}>
        <FileIcon name=".css" />
        CSS
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => createFile(dirPath, '.json')}>
        <FileIcon name=".json" />
        JSON
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => createFile(dirPath, '.md')}>
        <FileIcon name=".md" />
        Markdown
      </DropdownMenuItem>

      {dirPath === '' && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => createFile(dirPath, 'index.html', defaultHtmlFileContent, true)}
          >
            <FileIcon name="index.html" />
            index.html
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => createFile(dirPath, 'tailwind.config.ts', defaultTailwindConfigTs, true)}
          >
            <FileIcon name="tailwind.config.ts" />
            tailwind.config.ts
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => createFile(dirPath, 'README.md', defaultReadmeMdFileContent, true)}
          >
            <FileIcon name="README.md" />
            README.md
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => createFile(dirPath, 'DOCS.md', defaultDocsMdFileContent, true)}
          >
            <FileIcon name="DOCS.md" />
            DOCS.md
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => createFile(dirPath, '')}>
        <FileIcon name="" />
        Other
      </DropdownMenuItem>
    </>
  )
}
