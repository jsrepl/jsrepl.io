import dedent from 'string-dedent'

export const defaultTailwindConfigTs = dedent`
  import type { Config } from 'tailwindcss';

  export default {
    content: ['**/*'],
    corePlugins: {
      preflight: false,
    },
    darkMode: 'class',
  } satisfies Config;
`

export const defaultTailwindConfigJson = {
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
}

export const defaultHtmlFileContent = dedent`
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
    </head>
    <body></body>
  </html>
`

export const defaultReadmeMdFileContent = '# New REPL\n'

export const defaultDocsMdFileContent = 'virtual:///DOCS.md'

export const systemReplsUserId = 'e20c17d9-75e9-47c2-a525-9979c6ea56ec'

export const systemReplsCreatedAt = '2024-09-01T00:00:00.000Z'
