import { test } from '@playwright/test'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { toQueryParams } from '@/lib/repl-stored-state/adapter-url'
import { ReplStoredState } from '@/types'
import { assertMonacoContentsWithDecors } from './utils'

test('load repl from serialized state in url', async ({ page }) => {
  const state: ReplStoredState = {
    id: '',
    created_at: '',
    updated_at: '',
    user_id: '',
    user: null,
    title: 'Untitled REPL',
    description: '',
    openedModels: ['/test.ts'],
    activeModel: '/test.ts',
    showPreview: false,
    fs: {
      root: {
        kind: ReplFS.Kind.Directory,
        children: {
          'test.ts': {
            kind: ReplFS.Kind.File,
            content: dedent`
              console.log(1, 2, 3);
            `,
          },
        },
      },
    },
  }

  const queryParams = toQueryParams(state)
  await page.goto('/repl?' + new URLSearchParams(queryParams))

  await assertMonacoContentsWithDecors(
    page,
    dedent`
      console.log(1, 2, 3); // → 1 2 3
    `
  )
})
