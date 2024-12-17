import * as ReplFS from '@/lib/repl-fs'
import {
  defaultDocsMdFileContent,
  systemReplsCreatedAt,
  systemReplsUserId,
} from '@/lib/repl-stored-state/defaults'
import { SystemRepls } from '@/lib/repl-stored-state/system-repls'
import { ReplUpdatePayload } from '@/types'

export default {
  id: SystemRepls.jsEmpty,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'JS Empty Starter',
  description: 'Starter REPL: JS Empty',
  active_model: '/index.js',
  opened_models: ['/index.js'],
  show_preview: false,
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.js': {
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
} satisfies ReplUpdatePayload
