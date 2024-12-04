import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.htmlCssJs,
  created_at: '2024-12-08T10:48:11.318Z',
  updated_at: '2024-12-08T10:48:11.318Z',
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
  openedModels: ['/index.js', '/index.html', '/index.css'],
  activeModel: '/index.js',
  showPreview: true,
} satisfies ReplStoredState
