import { type Locator, type Page, expect } from '@playwright/test'
import regexpEscape from 'regexp.escape'
import { toQueryParams } from '@/lib/repl-stored-state'
import type { ReplStoredState } from '@/types'

type MonacoLocator = Locator
type MonacoLineLocator = Locator
type ReplDecorLocator = Locator

export function monacoLocator(page: Page): MonacoLocator {
  return page.locator('.monaco-editor')
}

/**
 * Locate monaco editor line by line number or line text
 * @param line 1-based line number or line text (exact match)
 */
export function monacoLineLocator(
  monacoLocator: MonacoLocator,
  line: number | string
): MonacoLineLocator {
  if (typeof line === 'string') {
    return monacoLocator.locator('.view-line', {
      hasText: new RegExp('^' + regexpEscape(line) + '$'),
    })
  } else if (typeof line === 'number') {
    return monacoLocator.locator('.view-line').nth(line - 1)
  } else {
    throw new Error('invalid line argument')
  }
}

export function replDecorLocator(locator: MonacoLocator | MonacoLineLocator): ReplDecorLocator {
  return locator.locator('[class*="jsrepl-decor"]')
}

export function getReplDecors(replDecorLocator: ReplDecorLocator): Promise<string[]> {
  return replDecorLocator.evaluateAll((nodes) => {
    return nodes.map((node) => {
      const content = getComputedStyle(node, ':after').getPropertyValue('content')
      // Remove double quotation marks around the edges (always present in string `content`)
      // and replace inner escaped double quotation marks with regular double quotation marks.
      return content.slice(1, -1).replace(/\\"/g, '"')
    })
  })
}

export async function assertReplLines(
  monacoLocator: MonacoLocator,
  lines: {
    line: number
    content: string
    decors: string[]
  }[]
) {
  await expect(monacoLocator).toHaveCount(1)

  const promises = lines.map(async ({ line, content: expectedContent, decors: expectedDecors }) => {
    const monacoLine = monacoLineLocator(monacoLocator, line)
    await expect(monacoLine).toHaveCount(1)
    await expect(monacoLine).toHaveText(expectedContent)

    const replDecorLoc = replDecorLocator(monacoLine)
    await expect(replDecorLoc).toHaveCount(expectedDecors.length)

    const replDecors = await getReplDecors(replDecorLoc)
    expect(replDecors).toEqual(expectedDecors)
  })

  await Promise.all(promises)
}

export async function visitPlayground(
  page: Page,
  state: Partial<ReplStoredState>,
  options: { stateSchemaVersion?: string } = {}
) {
  const defaultState: ReplStoredState = {
    models: new Map(),
    activeModel: '',
    showPreview: false,
  }

  const qp = toQueryParams({ ...defaultState, ...state })

  if (options.stateSchemaVersion !== undefined) {
    if (options.stateSchemaVersion !== '') {
      qp.v = options.stateSchemaVersion
    } else {
      delete qp.v
    }
  }

  await page.goto('/repl?' + new URLSearchParams(qp))
}
