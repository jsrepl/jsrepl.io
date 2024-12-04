import { describe, expect, it } from 'vitest'
import * as ReplFS from '@/lib/repl-fs'

describe('FS', () => {
  it('new file system', () => {
    const fs = ReplFS.emptyFS
    expect(fs.root.kind).toBe(ReplFS.Kind.Directory)
    expect(Object.keys(fs.root.children).length).toBe(0)
  })

  it('should add and retrieve a file', () => {
    const fs = ReplFS.emptyFS
    const filePath = '/test.txt'
    const content = 'Hello, world!'
    ReplFS.writeFile(fs, filePath, content)

    const file = ReplFS.getFile(fs, filePath)
    expect(file).not.toBeNull()
    expect(file?.kind).toBe(ReplFS.Kind.File)
    expect(file?.content).toBe(content)
  })

  it('should add and retrieve a directory', () => {
    const fs = ReplFS.emptyFS
    const dirPath = '/testDir'
    ReplFS.mkdir(fs, dirPath)

    const dir = ReplFS.getDirectory(fs, dirPath)
    expect(dir).not.toBeNull()
    expect(dir?.kind).toBe(ReplFS.Kind.Directory)
  })

  it('should remove a file', () => {
    const fs = ReplFS.emptyFS
    const filePath = '/test.txt'
    ReplFS.writeFile(fs, filePath, 'Hello, world!')
    const removed = ReplFS.remove(fs, filePath)

    expect(removed).toBe(true)
    expect(ReplFS.getFile(fs, filePath)).toBeNull()
  })

  it('should not remove a non-existent file', () => {
    const fs = ReplFS.emptyFS
    const filePath = '/nonexistent.txt'
    const removed = ReplFS.remove(fs, filePath)

    expect(removed).toBe(false)
  })

  it('should handle nested directories', () => {
    const fs = ReplFS.emptyFS
    const nestedDirPath = '/a/b/c'
    ReplFS.mkdir(fs, nestedDirPath)

    const dir = ReplFS.getDirectory(fs, nestedDirPath)
    expect(dir).not.toBeNull()
    expect(dir?.kind).toBe(ReplFS.Kind.Directory)
  })

  it('mkdirRecursive "" should return root directory', () => {
    const fs = ReplFS.emptyFS
    const dir = ReplFS.mkdir(fs, '')
    expect(dir).toBe(fs.root)
  })

  it('mkdirRecursive "/" should return root directory', () => {
    const fs = ReplFS.emptyFS
    const dir = ReplFS.mkdir(fs, '/')
    expect(dir).toBe(fs.root)
  })

  it('should throw error when writing a file to a directory path', () => {
    const fs = ReplFS.emptyFS
    const dirPath = '/testDir'
    ReplFS.mkdir(fs, dirPath)

    expect(() => ReplFS.writeFile(fs, dirPath, 'content')).toThrowError(
      `Path "${dirPath}" is a directory.`
    )
  })
})
