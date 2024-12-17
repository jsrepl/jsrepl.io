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
  id: SystemRepls.demoLiveFeedback,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'Demo Live Feedback',
  description: 'Demo REPL showing the live feedback feature',
  active_model: '/index.ts',
  opened_models: ['/index.ts'],
  show_preview: false,
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
} satisfies ReplUpdatePayload
