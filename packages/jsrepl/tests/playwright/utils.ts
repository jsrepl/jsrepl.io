import { type Locator, type Page, expect } from '@playwright/test'
import { toQueryParams } from '@/lib/repl-stored-state/adapter-url'
import type { ReplStoredState } from '@/types'

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
      await editor.getAction('jsrepl.copyContentsWithDecors')!.run()
    } finally {
      navigator.clipboard.writeText = writeTextOrig
    }

    return value
  })
}

export async function visitPlayground(page: Page, state: ReplStoredState) {
  const qp = toQueryParams(state)
  await page.goto('/repl?' + new URLSearchParams(qp))
}

function monacoLocator(page: Page): Locator {
  return page.locator('.monaco-editor')
}
