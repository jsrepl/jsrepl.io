import { BeardedIconsCss } from '@/components/icons/bearded-icons/css'
import { BeardedIconsFile } from '@/components/icons/bearded-icons/file'
import { BeardedIconsFolder } from '@/components/icons/bearded-icons/folder'
import { BeardedIconsHtml } from '@/components/icons/bearded-icons/html'
import { BeardedIconsJavascript } from '@/components/icons/bearded-icons/javascript'
import { BeardedIconsJson } from '@/components/icons/bearded-icons/json'
import { BeardedIconsMarkdown } from '@/components/icons/bearded-icons/markdown'
import { BeardedIconsReactjs } from '@/components/icons/bearded-icons/reactjs'
import { BeardedIconsReactts } from '@/components/icons/bearded-icons/reactts'
import { BeardedIconsReadme } from '@/components/icons/bearded-icons/readme'
import { BeardedIconsTailwind } from '@/components/icons/bearded-icons/tailwind'
import { BeardedIconsTypescript } from '@/components/icons/bearded-icons/typescript'
import { getFileExtension } from '@/lib/fs-utils'

export function FileIcon({
  name,
  isFolder,
  className,
}: {
  name: string
  isFolder?: boolean
  className?: string
}) {
  if (isFolder) {
    return <BeardedIconsFolder className={className} />
  }

  switch (true) {
    case /tailwind\.config\.(ts|js)?$/i.test(name):
      return <BeardedIconsTailwind className={className} />

    case /readme\.md$/i.test(name):
      return <BeardedIconsReadme className={className} />
  }

  const ext = getFileExtension(name)
  switch (ext) {
    case '.tsx':
      return <BeardedIconsReactts className={className} />
    case '.jsx':
      return <BeardedIconsReactjs className={className} />
    case '.ts':
      return <BeardedIconsTypescript className={className} />
    case '.js':
      return <BeardedIconsJavascript className={className} />
    case '.html':
      return <BeardedIconsHtml className={className} />
    case '.css':
      return <BeardedIconsCss className={className} />
    case '.json':
      return <BeardedIconsJson className={className} />
    case '.md':
      return <BeardedIconsMarkdown className={className} />
    default:
      return <BeardedIconsFile className={className} />
  }
}
