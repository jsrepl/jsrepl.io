export const enum Kind {
  File,
  Directory,
}

export type Entry = File | Directory

export interface File {
  kind: Kind.File
  content: string
}

export interface Directory {
  kind: Kind.Directory

  /**
   * Key is an entry name (not a path) w/o leading and trailing slashes.
   */
  children: Record<string, Entry>
}

export type FS = {
  root: Directory
}

export const emptyFS: FS = {
  root: { kind: Kind.Directory, children: {} },
}

export function clone(fs: FS): FS {
  return structuredClone(fs)
}

/**
 * Get entry by path.
 * @param path - Absolute path to the entry.
 */
export function get(fs: FS, path: string): Entry | null {
  path = normalizePath(path)
  const parts = path.slice(1).split('/')
  if (parts.length === 1 && parts[0] === '') {
    return fs.root
  }

  let entry: Entry | undefined = fs.root
  while (parts.length > 0) {
    const part = parts.shift()!
    entry = entry.kind === Kind.Directory ? entry.children[part] : undefined
    if (!entry) {
      return null
    }
  }

  return entry
}

/**
 * Get file by path.
 * @param path - Absolute path to the file.
 */
export function getFile(fs: FS, path: string): File | null {
  const entry = get(fs, path)
  return entry?.kind === Kind.File ? entry : null
}

/**
 * Get directory by path.
 * @param path - Absolute path to the directory.
 */
export function getDirectory(fs: FS, path: string): Directory | null {
  const entry = get(fs, path)
  return entry?.kind === Kind.Directory ? entry : null
}

export function exists(fs: FS, path: string): boolean {
  return get(fs, path) !== null
}

/**
 * Remove file or directory by path.
 * @param path - Absolute path to the entry.
 * @returns `true` if the entry was removed, `false` if it didn't exist.
 */
export function remove(fs: FS, path: string): boolean {
  path = normalizePath(path)

  const lastSlashIndex = path.lastIndexOf('/')
  const dirPath = lastSlashIndex === -1 ? '' : path.slice(0, lastSlashIndex)
  const entryName = path.slice(lastSlashIndex + 1)

  const dir = getDirectory(fs, dirPath)
  if (!dir) {
    return false
  }

  const result = entryName in dir.children
  delete dir.children[entryName]
  return result
}

/**
 * Create directory recursively.
 * @param path - Absolute path to the directory.
 */
export function mkdir(fs: FS, path: string): Directory {
  path = normalizePath(path)
  const parts = path.slice(1).split('/')
  if (parts.length === 1 && parts[0] === '') {
    return fs.root
  }

  let dir: Directory = fs.root
  while (parts.length > 0) {
    const part = parts.shift()!
    if (!validateName(part)) {
      throw new Error(`Invalid directory path "${path}".`)
    }

    let child = dir.children[part]
    if (!child) {
      const newDir: Directory = {
        kind: Kind.Directory,
        children: {},
      }
      dir.children[part] = newDir
      child = newDir
    }

    if (child.kind === Kind.Directory) {
      dir = child
    } else {
      throw new Error(`Path "${path}" is not a directory.`)
    }
  }

  return dir
}

/**
 * Create file by path.
 * @param path - Absolute path to the file, including the file name.
 * @param content - File content.
 */
export function writeFile(fs: FS, path: string, content: string): File {
  path = normalizePath(path)

  const lastSlashIndex = path.lastIndexOf('/')
  const dirPath = lastSlashIndex === -1 ? '' : path.slice(0, lastSlashIndex)
  const fileName = path.slice(lastSlashIndex + 1)
  if (!validateName(fileName)) {
    throw new Error(`Invalid file path "${path}".`)
  }

  const parentDir = mkdir(fs, dirPath)

  const existingEntry = parentDir.children[fileName]
  if (existingEntry?.kind === Kind.Directory) {
    throw new Error(`Path "${path}" is a directory.`)
  }

  const file: File = {
    kind: Kind.File,
    content,
  }

  parentDir.children[fileName] = file

  return file
}

export function writeDirectory(fs: FS, path: string, children: Record<string, Entry>): Directory {
  path = normalizePath(path)

  const lastSlashIndex = path.lastIndexOf('/')
  const dirPath = lastSlashIndex === -1 ? '' : path.slice(0, lastSlashIndex)
  const dirName = path.slice(lastSlashIndex + 1)
  if (!validateName(dirName)) {
    throw new Error(`Invalid directory path "${path}".`)
  }

  const parentDir = mkdir(fs, dirPath)

  const existingEntry = parentDir.children[dirName]
  if (existingEntry?.kind === Kind.File) {
    throw new Error(`Path "${path}" is a file.`)
  }

  const dir: Directory = {
    kind: Kind.Directory,
    children: structuredClone(children),
  }

  parentDir.children[dirName] = dir

  return dir
}

export function rename(fs: FS, path: string, newPath: string): Entry {
  const entry = get(fs, path)
  if (!entry) {
    throw new Error(`Path "${path}" does not exist.`)
  }

  newPath = normalizePath(newPath)
  const lastSlashIndex = newPath.lastIndexOf('/')
  const newName = newPath.slice(lastSlashIndex + 1)
  if (!validateName(newName)) {
    throw new Error(`Invalid file path "${newPath}".`)
  }

  const newParentDirPath = newPath.slice(0, lastSlashIndex)
  const newParentDir = mkdir(fs, newParentDirPath)

  if (!remove(fs, path)) {
    throw new Error(`Failed to remove "${path}".`)
  }

  newParentDir.children[newName] = entry

  return entry
}

export function copy(fs: FS, path: string, newPath: string): Entry {
  const entry = get(fs, path)
  if (!entry) {
    throw new Error(`Path "${path}" does not exist.`)
  }

  if (entry.kind === Kind.File) {
    return writeFile(fs, newPath, entry.content)
  } else if (entry.kind === Kind.Directory) {
    return writeDirectory(fs, newPath, entry.children)
  }

  throw new Error(`Path "${path}" is not a file or directory.`)
}

export function validateName(name: string): boolean {
  return !!name.trim() && /^[a-zA-Z0-9_\-.\(\)\ ]+$/.test(name)
}

export function validatePath(path: string): boolean {
  return (
    path.startsWith('/') &&
    path
      .split('/')
      .slice(1)
      .every((name) => validateName(name))
  )
}

/**
 * Walk through the file system.
 * @param path - Absolute path to the directory.
 * @param callback - Callback function that is called for each entry. Return `false` to stop the walk.
 *                   Return arbitrary data to pass it to the next callback down the tree.
 */
export function walk(
  fs: FS,
  path: string,
  callback: (
    path: string,
    entry: Entry,
    parents: { path: string; dir: Directory }[]
  ) => void | false
) {
  path = normalizePath(path)
  const entry = get(fs, path)
  if (!entry) {
    throw new Error(`Path "${path}" does not exist.`)
  }

  _walk(fs, path, entry, [], callback)
}

function _walk(
  fs: FS,
  path: string,
  entry: Entry,
  parents: { path: string; dir: Directory }[],
  callback: (
    path: string,
    entry: Entry,
    parents: { path: string; dir: Directory }[]
  ) => void | false
): void | false {
  const callbackResult = callback(path, entry, parents)
  if (callbackResult === false) {
    return false
  }

  if (entry.kind === Kind.Directory) {
    const pathPrefix = path === '/' ? '' : path
    for (const [name, child] of Object.entries(entry.children)) {
      const result = _walk(
        fs,
        pathPrefix + '/' + name,
        child,
        [...parents, { path, dir: entry }],
        callback
      )
      if (result === false) {
        return false
      }
    }
  }
}

export function normalizePath(path: string) {
  if (path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  return path
}
