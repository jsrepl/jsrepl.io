import { ReplAliases } from '.'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.tsEmpty,
  created_at: '2024-12-08T10:48:11.318Z',
  updated_at: '2024-12-08T10:48:11.318Z',
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: ``,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    },
  },
  openedModels: ['/index.ts'],
  activeModel: '/index.ts',
  showPreview: false,
} satisfies ReplStoredState
