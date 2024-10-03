import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

test('build index.html', async () => {
  const { error, output } = spawnSync('vite', ['build', '--mode', 'test'])
  if (error) {
    throw error
  }

  console.log(output.toString())

  const indexHtml = readFileSync('./dist/index.html', 'utf8')

  expect(indexHtml).toBe(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark">
    <title>JSRepl Preview</title>
    <script type="module" src="http://localhost:3000/e.js"></script>
  </head>
  <body></body>
</html>
`)
})
