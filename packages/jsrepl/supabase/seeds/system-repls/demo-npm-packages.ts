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
  id: SystemRepls.demoNpmPackages,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'Demo NPM Packages',
  description: 'Demo REPL showing how to use NPM packages',
  active_model: '/index.ts',
  opened_models: ['/index.ts'],
  show_preview: false,
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
} satisfies ReplUpdatePayload
