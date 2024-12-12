import { toast } from 'sonner'
import type * as TS from 'typescript'
import { getPackageUrl, getProviderUrl, resolvePackageProvider } from './package-provider'

const indexDtsUrlCache = new Map<string, string | null>()
const dtsSourceCache = new Map<string, string>()

// TODO: place it in webworker?
export async function getDtsMap(
  packageName: string,
  packageDtsProvider: 'auto' | 'esm.sh' | 'esm.sh-proxy',
  ts: typeof import('typescript'),
  { signal }: { signal: AbortSignal }
) {
  const dtsMap = new Map<string, string>()
  const resolvedProvider = resolvePackageProvider(packageDtsProvider)
  const providerUrl = getProviderUrl(packageDtsProvider)

  let indexDtsUrl: string | null
  if (indexDtsUrlCache.has(packageName)) {
    indexDtsUrl = indexDtsUrlCache.get(packageName)!
  } else {
    try {
      const packageUrl = getPackageUrl(packageDtsProvider, packageName)
      const packageResponse = await fetch(packageUrl, {
        signal: anySignal([signal, AbortSignal.timeout(10000)]),
      })
      indexDtsUrl = packageResponse.ok ? packageResponse.headers.get('x-typescript-types') : null
      indexDtsUrlCache.set(packageName, indexDtsUrl)
    } catch (e) {
      const isAbortedError = e instanceof Error && e.name === 'AbortError'
      if (!isAbortedError) {
        console.error(e)

        const msg = `Unable to fetch package "${packageName}" from ${providerUrl}. Probably you have network issues or ${providerUrl} is not available.`
        const description = `The following features might be affected: imports from external packages; TypeScript Intellisense for external packages;`

        console.error(`${msg}\n${description}`)
        toast.error(msg, {
          description,
          duration: Infinity,
        })
      }

      return dtsMap
    }
  }

  if (!indexDtsUrl) {
    return dtsMap
  }

  const indexDtsLocalUri = `file:///node_modules/${packageName}/package.json`
  dtsMap.set(
    indexDtsLocalUri,
    `{ "name": "${packageName}", "types": "${toLocalDtsUri(indexDtsUrl)}" }`
  )

  await processDtsUrl(indexDtsUrl)
  return dtsMap

  async function processDtsUrl(url: string) {
    const localUri = toLocalDtsUri(url)
    if (dtsMap.has(localUri)) {
      return
    }

    let source: string
    if (dtsSourceCache.has(url)) {
      source = dtsSourceCache.get(url)!
    } else {
      try {
        const urlToFetch =
          resolvedProvider === 'esm.sh'
            ? url
            : url.replace(/^https:\/\/esm.sh\//, providerUrl + '/')
        const response = await fetch(urlToFetch, { signal })
        if (!response.ok) {
          return
        }

        source = await response.text()
        dtsSourceCache.set(url, source)
      } catch {
        return
      }
    }

    const { source: transformedSource, imports } = transformImports(source, localUri, url)

    dtsMap.set(localUri, transformedSource)

    await Promise.all(Array.from(imports).map((importUrl) => processDtsUrl(importUrl)))
  }

  function toLocalDtsUri(dtsUrl: string) {
    return dtsUrl.replace(/^https:\/\/esm.sh\//, `file:///node_modules/${packageName}/`)
  }

  function transformImports(
    source: string,
    sourceLocalUri: string,
    url: string
  ): { source: string; imports: Set<string> } {
    const imports = new Set<string>()

    const test = (moduleSpecifier: string): boolean => moduleSpecifier.startsWith('https://esm.sh/')

    const update = (moduleSpecifier: string): string => {
      const absLocalUri = moduleSpecifier.replace(
        /^https:\/\/esm.sh\//,
        `file:///node_modules/${packageName}/`
      )

      let relativeLocalUri = pathRelative(pathDirname(sourceLocalUri), absLocalUri)
      if (!relativeLocalUri.startsWith('.')) {
        relativeLocalUri = './' + relativeLocalUri
      }

      return relativeLocalUri
    }

    const add = (moduleSpecifier: string): void => {
      let importUrl = moduleSpecifier.startsWith('https://')
        ? moduleSpecifier
        : new URL(moduleSpecifier, url).href // relative path -> absolute url

      // https://esm.sh/v135/tailwindcss@3.4.10/types/config.d -> .../config.d.ts
      if (importUrl.endsWith('.d')) {
        importUrl += '.ts'
      }

      imports.add(importUrl)
    }

    // TODO: `declare module 'https://esm.sh/v135/source-map-js@1.2.0/source-map.d.ts'` in "file:///node_modules/tailwindcss/v135/source-map-js@1.2.0/source-map.d.ts"
    const transformer: TS.TransformerFactory<TS.SourceFile> = (context) => {
      const { factory } = context
      return (sourceFile: TS.SourceFile) => {
        const visitor = (node: TS.Node): TS.VisitResult<TS.Node> => {
          if (
            ts.isImportDeclaration(node) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          ) {
            add(node.moduleSpecifier.text)
            if (test(node.moduleSpecifier.text)) {
              return factory.updateImportDeclaration(
                node,
                node.modifiers,
                node.importClause,
                factory.createStringLiteral(update(node.moduleSpecifier.text)),
                node.attributes
              )
            }
          }

          if (
            ts.isExportDeclaration(node) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)
          ) {
            add(node.moduleSpecifier.text)
            if (test(node.moduleSpecifier.text)) {
              return factory.updateExportDeclaration(
                node,
                node.modifiers,
                node.isTypeOnly,
                node.exportClause,
                factory.createStringLiteral(update(node.moduleSpecifier.text)),
                node.attributes
              )
            }
          }

          return ts.visitEachChild(node, visitor, context)
        }

        return ts.visitNode(sourceFile, visitor) as TS.SourceFile
      }
    }

    try {
      const sourceFile = ts.createSourceFile(
        'index.d.ts',
        source,
        ts.ScriptTarget.ESNext,
        true,
        ts.ScriptKind.TS
      )

      const result = ts.transform(sourceFile, [transformer])
      try {
        const transformedSourceFile = result.transformed[0]!

        const printer = ts.createPrinter()
        const resultSource = printer.printFile(transformedSourceFile)
        return { source: resultSource, imports }
      } finally {
        result.dispose()
      }
    } catch (e) {
      console.error('transformImports error', e)
      return { source, imports }
    }
  }
}

function pathRelative(from: string, to: string) {
  const fromParts = from.split('/')
  const toParts = to.split('/')

  // Remove the leading empty strings if paths start with '/'
  if (fromParts[0] === '') fromParts.shift()
  if (toParts[0] === '') toParts.shift()

  // Find the common base part
  while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
    fromParts.shift()
    toParts.shift()
  }

  // Go up the directory tree to the common base
  const upCount = fromParts.length
  const relativePath = new Array(upCount).fill('..').concat(toParts).join('/')

  return relativePath || ''
}

function pathDirname(path: string) {
  if (path.length === 0) {
    return '.'
  }

  const hasRoot = path[0] === '/'
  let end = -1
  let matchedSlash = true

  for (let i = path.length - 1; i >= 1; --i) {
    if (path[i] === '/') {
      if (!matchedSlash) {
        end = i
        break
      }
    } else {
      matchedSlash = false
    }
  }

  if (end === -1) {
    return hasRoot ? '/' : '.'
  }

  if (hasRoot && end === 1) {
    return '//'
  }

  return path.slice(0, end)
}

// Alternative to AbortSignal.any() until it's widely supported.
// Taken from https://github.com/whatwg/fetch/issues/905.
function anySignal(signals: Iterable<AbortSignal>): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      break
    }

    signal.addEventListener('abort', () => controller.abort(signal.reason), {
      signal: controller.signal,
    })
  }

  return controller.signal
}
