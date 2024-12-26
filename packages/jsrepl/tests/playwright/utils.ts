import { type Locator, type Page, expect } from '@playwright/test'
import * as ReplFS from '@/lib/repl-fs'
import type { ReplRecordPayloadWithUser } from '@/types'

export async function assertMonacoContentsWithDecors(page: Page, expectedContents: string) {
  await expect(monacoLocator(page)).toHaveCount(1)

  await expect
    .poll(() => getMonacoContentsWithDecors(page), {
      message: 'monaco contents with decors eventually match with expectedContents',
      timeout: 20000,
    })
    .toBe(expectedContents)
}

async function getMonacoContentsWithDecors(page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = (window as any).__monaco as typeof import('monaco-editor')
    if (!monaco) {
      throw new Error('test monaco ref not found')
    }

    const editor = monaco.editor.getEditors()[0]
    if (!editor) {
      throw new Error('editor instance not found')
    }

    let value: string | null = null

    const writeTextOrig = navigator.clipboard.writeText
    navigator.clipboard.writeText = async (data: string) => {
      value = data
    }

    try {
      await editor.getAction('jsrepl.copyContentsWithDecors')?.run()
    } finally {
      navigator.clipboard.writeText = writeTextOrig
    }

    return value
  })
}

export const dummyRepl: ReplRecordPayloadWithUser = {
  id: 'test_repl_id',
  title: 'test title',
  description: 'test description',
  user_id: 'test_user_id',
  user: {
    id: 'test_user_id',
    avatar_url: null,
    user_name: 'user_name',
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  fs: ReplFS.emptyFS,
  active_model: '',
  opened_models: [],
  show_preview: false,
}

export async function visitPlayground(page: Page, repl: Partial<ReplRecordPayloadWithUser>) {
  const replPayload = { ...dummyRepl, ...repl }

  await page.route(
    (url) =>
      url.pathname.includes('/rest/v1/repls') &&
      url.searchParams.get('id') === `eq.${replPayload.id}`,
    async (route) => {
      await route.fulfill({
        json: [replPayload],
      })
    }
  )

  await page.route('**/rest/v1/views', async (route) => {
    await route.fulfill({ status: 201 })
  })

  await page.goto(`/repl/${replPayload.id}`)
}

function monacoLocator(page: Page): Locator {
  return page.locator('.monaco-editor')
}
