import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.demoTypescript,
  activeModel: '/index.ts',
  openedModels: ['/index.ts'],
  showPreview: false,
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
          let date = new Date();
          date = 0;

          enum Color {
            Red = 'red',
            Yellow = 'yellow',
            Blue = 'blue',
            Green = 'green',
          }

          const color: Color = Color.Green;
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
