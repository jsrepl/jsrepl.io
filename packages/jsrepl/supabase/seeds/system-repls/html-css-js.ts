import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import {
  defaultDocsMdFileContent,
  systemReplsCreatedAt,
  systemReplsUserId,
} from '@/lib/repl-stored-state/defaults'
import { SystemRepls } from '@/lib/repl-stored-state/system-repls'
import { ReplUpdatePayload } from '@/types'

export default {
  id: SystemRepls.htmlCssJs,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'HTML/CSS/JS Starter',
  description: 'Starter REPL: HTML, CSS, and JS',
  active_model: '/index.js',
  opened_models: ['/index.js', '/index.html', '/index.css'],
  show_preview: true,
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.js': {
          content: dedent`
            import './index.css';

            console.log('Hello, world!');
          `,
          kind: ReplFS.Kind.File,
        },
        'index.html': {
          content: dedent`
            <!doctype html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <script type="module" src="/index.js"></script>
              </head>
              <body>
                <span class="text-4xl font-bold dark:text-stone-100">Hello, world!</span>
              </body>
            </html>
          `,
          kind: ReplFS.Kind.File,
        },
        'index.css': {
          content: dedent`
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
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
} satisfies ReplUpdatePayload
