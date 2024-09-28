// NOTE: Specifying the version after '@' is implicitly supported.
// For example, 'react@18.2.0' -> 'https://esm.sh/react@18.2.0'
export function getNpmPackageFromImportPath(importPath: string): string | null {
  if (importPath.startsWith('https://esm.sh/')) {
    importPath = importPath.slice('https://esm.sh/'.length)
  }

  if (
    importPath === '' ||
    importPath.startsWith('.') ||
    importPath.startsWith('/') ||
    importPath.startsWith('-') ||
    importPath.endsWith('.') ||
    importPath.endsWith('/') ||
    importPath.endsWith('-') ||
    importPath.trim() === ''
  ) {
    return null
  }

  return importPath
}
