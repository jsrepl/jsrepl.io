import Link from 'next/link'
import { DialogProps } from '@radix-ui/react-dialog'
import IconLanguageHtml from '~icons/mdi/language-html5.jsx'
import IconLanguageJavascript from '~icons/mdi/language-javascript.jsx'
import IconLanguageTypescript from '~icons/mdi/language-typescript.jsx'
import IconReact from '~icons/mdi/react.jsx'
import IconTailwind from '~icons/mdi/tailwind.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SystemRepls } from '@/lib/repl-stored-state/system-repls'
import Logo from './logo'
import { Button } from './ui/button'

export default function ReplStarterDialog(props?: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground/80">Start a new REPL</DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          <StarterButton
            logo={<Logo width="28" height="28" />}
            title="Demo starter"
            description="TypeScript, HTML & Tailwind CSS"
            replId={SystemRepls.demo}
          />
          <StarterButton
            logo={<IconReact width="32" height="32" color="#3096FF" />}
            title="React"
            description="TSX, HTML & Tailwind CSS"
            replId={SystemRepls.react}
          />
          <StarterButton
            logo={<IconTailwind width="32" height="32" color="#38BDF9" />}
            title="Tailwind CSS playground"
            description="HTML, Tailwind CSS & Tailwind config"
            replId={SystemRepls.tailwindcss}
          />
          <StarterButton
            logo={<IconLanguageTypescript width="32" height="32" color="#3078C6" />}
            title="TypeScript"
            description="TypeScript"
            replId={SystemRepls.ts}
          />
          <StarterButton
            logo={<IconLanguageTypescript width="32" height="32" color="#3078C6" />}
            title="Empty TypeScript"
            description="TypeScript"
            replId={SystemRepls.tsEmpty}
          />
          <StarterButton
            logo={<IconLanguageJavascript width="32" height="32" color="#E8D44E" />}
            title="JavaScript"
            description="JavaScript"
            replId={SystemRepls.js}
          />
          <StarterButton
            logo={<IconLanguageJavascript width="32" height="32" color="#E8D44E" />}
            title="Empty JavaScript"
            description="JavaScript"
            replId={SystemRepls.jsEmpty}
          />
          <StarterButton
            logo={<IconLanguageHtml width="32" height="32" color="#DC4A25" />}
            title="HTML, CSS & TypeScript"
            description="HTML, CSS & TypeScript"
            replId={SystemRepls.htmlCssTs}
          />
          <StarterButton
            logo={<IconLanguageHtml width="32" height="32" color="#DC4A25" />}
            title="HTML, CSS & JavaScript"
            description="HTML, CSS & JavaScript"
            replId={SystemRepls.htmlCssJs}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StarterButton({
  logo,
  title,
  description,
  replId,
}: {
  logo: React.ReactNode
  title: string
  description: string
  replId: string
}) {
  return (
    <Button
      variant="ghost"
      size="none"
      className="text-foreground/85 justify-start gap-4 p-2 text-start"
      asChild
    >
      <Link href={`/repl/${replId}`}>
        {logo}
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <div className="text-base font-medium">{title}</div>
          <div className="text-muted-foreground text-xs">{description}</div>
        </div>
      </Link>
    </Button>
  )
}
