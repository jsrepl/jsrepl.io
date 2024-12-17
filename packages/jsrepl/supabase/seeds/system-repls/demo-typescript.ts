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
  id: SystemRepls.demoTypescript,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'Demo Typescript',
  description: 'Demo REPL with Typescript',
  active_model: '/index.ts',
  opened_models: ['/index.ts'],
  show_preview: false,
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
} satisfies ReplUpdatePayload
