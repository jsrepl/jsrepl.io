import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.demoLiveFeedback,
  activeModel: '/index.ts',
  openedModels: ['/index.ts'],
  showPreview: false,
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            const now = new Date();
            now.toTimeString();

            setTimeout(() => {
              console.log('a');
            }, 0);

            Promise.resolve().then(() => {
              console.log('b');
            });

            function foo(a: number) {
              try {
                return a;
              } finally {
                return a * 2;
              }
            }

            foo(1);
            foo(2);
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
