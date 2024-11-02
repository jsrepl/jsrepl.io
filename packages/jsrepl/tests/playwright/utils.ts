import { type Locator, type Page, expect } from '@playwright/test'
import regexpEscape from 'regexp.escape'
import { OldReplStoredStateV0, toQueryParams, toQueryParamsV0 } from '@/lib/repl-stored-state'
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

export async function assertMonacoContentsWithDecors(page: Page, expectedContents: string) {
  await expect(monacoLocator(page)).toHaveCount(1)

  await expect
    .poll(() => getMonacoContentsWithDecors(page), {
      message: 'monaco contents with decors eventually match with expectedContents',
      timeout: 5000,
    })
    .toBe(expectedContents)
}

async function getMonacoContentsWithDecors(page: Page): Promise<string> {
  return await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = (window as any).__monaco as typeof import('monaco-editor')
    if (!monaco) {
      throw new Error('test monaco ref not found')
    }

    const editor = monaco.editor.getEditors()[0]
    if (!editor) {
      throw new Error('editor instance not found')
    }

    const contents = editor.getValue()
    const lines = contents.split('\n')
    const linesWithDecors: string[] = lines.map((line, lineIndex) => {
      const decors = editor.getLineDecorations(lineIndex + 1)
      if (!decors || decors.length === 0) {
        return line
      }

      const decorValues: string[] = decors
        .map((decor) => {
          const uniqClassName =
            decor.options.afterContentClassName?.match(/jsrepl-decor-[0-9]+/)?.[0]
          if (!uniqClassName) {
            return null
          }

          const el = document.querySelector('.' + uniqClassName)
          if (!el) {
            return null
          }

          const content = getComputedStyle(el, ':after').getPropertyValue('content')

          // Remove double quotation marks around the edges (always present in string `content`)
          // and replace inner escaped double quotation marks with regular double quotation marks.
          const value = content.slice(1, -1).replace(/\\"/g, '"')
          return value
        })
        .filter((x) => x !== null)

      return line + decorValues.map((decorValue) => ` // → ${decorValue}`).join('')
    })

    const contentsWithDecors: string = linesWithDecors.join('\n')
    return contentsWithDecors
  })
}

export async function visitPlayground(page: Page, state: ReplStoredState) {
  const qp = toQueryParams(state)
  await page.goto('/repl?' + new URLSearchParams(qp))
}

export async function visitPlaygroundV0(page: Page, state: OldReplStoredStateV0) {
  const qp = toQueryParamsV0(state)
  await page.goto('/repl?' + new URLSearchParams(qp))
}
