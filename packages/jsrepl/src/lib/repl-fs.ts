export class FS {
  root: Directory

  constructor(root: Directory = { kind: Kind.Directory, children: {} }) {
    this.root = root
  }

  /**
   * Get entry by path.
   * @param path - Absolute path to the entry.
   */
  getEntry(path: string): Entry | null {
    path = this.#normalizePath(path)
    const parts = path.slice(1).split('/')
    if (parts.length === 1 && parts[0] === '') {
      return this.root
    }

    let entry: Entry | undefined = this.root
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
   * Remove file or directory by path.
   * @param path - Absolute path to the entry.
   * @returns `true` if the entry was removed, `false` if it didn't exist.
   */
  removeEntry(path: string): boolean {
    path = this.#normalizePath(path)

    const lastSlashIndex = path.lastIndexOf('/')
    const dirPath = lastSlashIndex === -1 ? '' : path.slice(0, lastSlashIndex)
    const entryName = path.slice(lastSlashIndex + 1)

    const dir = this.getDirectory(dirPath)
    if (!dir) {
      return false
    }

    const result = delete dir.children[entryName]
    return result
  }

  /**
   * Get file by path.
   * @param path - Absolute path to the file.
   */
  getFile(path: string): File | null {
    const entry = this.getEntry(path)
    return entry?.kind === Kind.File ? entry : null
  }

  /**
   * Get directory by path.
   * @param path - Absolute path to the directory.
   */
  getDirectory(path: string): Directory | null {
    const entry = this.getEntry(path)
    return entry?.kind === Kind.Directory ? entry : null
  }

  mkdirRecursive(path: string): Directory {
    path = this.#normalizePath(path)
    const parts = path.slice(1).split('/')
    if (parts.length === 1 && parts[0] === '') {
      return this.root
    }

    let dir: Directory = this.root
    while (parts.length > 0) {
      const part = parts.shift()!
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
  writeFile(path: string, content: string): File {
    path = this.#normalizePath(path)

    const lastSlashIndex = path.lastIndexOf('/')
    const dirPath = lastSlashIndex === -1 ? '' : path.slice(0, lastSlashIndex)
    const fileName = path.slice(lastSlashIndex + 1)
    if (!fileName.trim()) {
      throw new Error(`Invalid file name "${fileName}".`)
    }

    const dir = this.mkdirRecursive(dirPath)

    const existingEntry = dir.children[fileName]
    if (existingEntry?.kind === Kind.Directory) {
      throw new Error(`Path "${path}" is a directory.`)
    }

    const file: File = {
      kind: Kind.File,
      content,
    }

    dir.children[fileName] = file

    return file
  }

  renameEntry(path: string, newPath: string): string {
    const entry = this.getEntry(path)
    if (!entry) {
      throw new Error(`Path "${path}" does not exist.`)
    }

    if (!this.removeEntry(path)) {
      throw new Error(`Failed to remove "${path}".`)
    }

    newPath = this.#normalizePath(newPath)
    const lastSlashIndex = newPath.lastIndexOf('/')
    const newName = newPath.slice(lastSlashIndex + 1)
    const newParentDirPath = newPath.slice(0, lastSlashIndex)
    const newParentDir = this.mkdirRecursive(newParentDirPath)
    newParentDir.children[newName] = entry

    return newPath
  }

  /**
   * Walk through the file system.
   * @param path - Absolute path to the directory.
   * @param callback - Callback function that is called for each entry. Return `false` to stop the walk.
   *                   Return arbitrary data to pass it to the next callback down the tree.
   */
  walk(path: string, callback: (path: string, entry: Entry) => void | false) {
    path = this.#normalizePath(path)
    const entry = this.getEntry(path)
    if (!entry) {
      throw new Error(`Path "${path}" does not exist.`)
    }

    this.#walk(path, entry, callback)
  }

  #walk(path: string, entry: Entry, callback: (path: string, entry: Entry) => void | false) {
    const callbackResult = callback(path, entry)
    if (callbackResult === false) {
      return
    }

    if (entry.kind === Kind.Directory) {
      const parentPath = path === '/' ? '' : path
      for (const [name, child] of Object.entries(entry.children)) {
        this.#walk(parentPath + '/' + name, child, callback)
      }
    }
  }

  #normalizePath(path: string) {
    if (path.endsWith('/')) {
      path = path.slice(0, -1)
    }

    if (!path.startsWith('/')) {
      path = `/${path}`
    }

    return path
  }
}

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
