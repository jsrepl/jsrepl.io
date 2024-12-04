import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.demoTailwindcss,
  activeModel: '/index.html',
  openedModels: ['/index.html', '/index.css', '/tailwind.config.ts'],
  showPreview: true,
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.html': {
          content: dedent`
            <link rel="stylesheet" href="/index.css" />

            <div class="p-4 prose dark:prose-invert">
              <h1 class="text-4xl italic">Hello, world!</h1>
            </div>
          `,
          kind: ReplFS.Kind.File,
        },
        'index.css': {
          content: dedent`
            @tailwind base;
            @tailwind components;
            @tailwind utilities;

            body {
              @apply text-stone-800 dark:text-stone-100;
            }
          `,
          kind: ReplFS.Kind.File,
        },
        'tailwind.config.ts': {
          content: dedent`
            import type { Config } from 'tailwindcss';
            import typography from '@tailwindcss/typography';

            export default {
              content: ['**/*'],
              corePlugins: {
                preflight: true,
              },
              plugins: [typography],
              darkMode: 'class',
            } satisfies Config;
          `,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    },
  },
} satisfies ReplStoredState
