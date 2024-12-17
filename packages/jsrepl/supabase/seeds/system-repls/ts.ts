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
  id: SystemRepls.ts,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'TS Starter',
  description: 'Starter REPL: TS',
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
} satisfies ReplUpdatePayload
