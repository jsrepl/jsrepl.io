import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.ts,
  created_at: '2024-12-08T10:48:11.318Z',
  updated_at: '2024-12-08T10:48:11.318Z',
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            import { format } from 'date-fns';

            const now = new Date();
            const formatted = formatTime(now);

            function formatTime(date: Date) {
              return format(date, 'HH:mm:ss');
            }
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
  openedModels: ['/index.ts'],
  activeModel: '/index.ts',
  showPreview: false,
} satisfies ReplStoredState
