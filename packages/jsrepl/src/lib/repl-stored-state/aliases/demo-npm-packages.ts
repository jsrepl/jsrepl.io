import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.demoNpmPackages,
  activeModel: '/index.ts',
  openedModels: ['/index.ts'],
  showPreview: false,
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            import { format } from 'date-fns';
            import confetti from 'canvas-confetti';

            const now = new Date();
            format(now, 'dd-MM-yyyy');

            confetti({
              particleCount: 400,
              origin: {
                y: 1
              }
            });
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
