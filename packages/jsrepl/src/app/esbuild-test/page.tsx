'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import * as Comlink from 'comlink'
import type { Expose } from '@/lib/bundler/bundler-worker'
import { getBundler } from '@/lib/bundler/get-bundler'

let bundler: Comlink.Remote<Expose> | null = null

if (typeof window !== 'undefined') {
  bundler = getBundler()
}

async function foo(setResult: (result: string) => void) {
  const setupResult = await bundler!.setup()
  console.log(setupResult)

  const result = await bundler!.build({
    input: {
      'foo.ts': 'export const foo = "foo"',
      'index.tsx': 'import { foo } from "./foo"; console.log(foo)',
      'bar.ts': 'console.log("bar")',
    },
    options: {
      bundle: true,
      external: ['date-fns'],
      platform: 'neutral',
      outdir: 'out',
      entryPoints: ['index.tsx', 'bar.ts'],
      sourcemap: 'both',
      metafile: true,
    },
  })

  console.log(result)
  setResult(JSON.stringify(result, null, 2))
}

export default function EsbuildTestPage() {
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    foo(setResult)
  }, [])

  return (
    <>
      <div>Esbuild Test</div>
      <div>{result}</div>
    </>
  )
}
