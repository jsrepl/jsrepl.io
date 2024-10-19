import { LucideFolder } from 'lucide-react'
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
    return <LucideFolder className={`${className}`} />
  }

  const ext = name.split('.').pop()?.toLowerCase()

  switch (true) {
    case /tailwind\.config\.(ts|js)?$/i.test(name):
      return <IconTailwind className={`${className} text-[#38BDF9]`} />

    case /readme\.md$/i.test(name):
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
      return <IconFile className={`${className} text-muted-foreground`} />
  }
}
