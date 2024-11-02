import { describe, expect, it } from 'vitest'
import { FS, Kind } from '@/lib/repl-fs'

describe('FS', () => {
  it('should create a new file system', () => {
    const fs = new FS()
    expect(fs.root.kind).toBe(Kind.Directory)
    expect(Object.keys(fs.root.children).length).toBe(0)
  })

  it('should add and retrieve a file', () => {
    const fs = new FS()
    const filePath = '/test.txt'
    const content = 'Hello, world!'
    fs.writeFile(filePath, content)

    const file = fs.getFile(filePath)
    expect(file).not.toBeNull()
    expect(file?.kind).toBe(Kind.File)
    expect(file?.content).toBe(content)
  })

  it('should add and retrieve a directory', () => {
    const fs = new FS()
    const dirPath = '/testDir'
    fs.mkdir(dirPath)

    const dir = fs.getDirectory(dirPath)
    expect(dir).not.toBeNull()
    expect(dir?.kind).toBe(Kind.Directory)
  })

  it('should remove a file', () => {
    const fs = new FS()
    const filePath = '/test.txt'
    fs.writeFile(filePath, 'Hello, world!')
    const removed = fs.remove(filePath)

    expect(removed).toBe(true)
    expect(fs.getFile(filePath)).toBeNull()
  })

  it('should not remove a non-existent file', () => {
    const fs = new FS()
    const filePath = '/nonexistent.txt'
    const removed = fs.remove(filePath)

    expect(removed).toBe(false)
  })

  it('should handle nested directories', () => {
    const fs = new FS()
    const nestedDirPath = '/a/b/c'
    fs.mkdir(nestedDirPath)

    const dir = fs.getDirectory(nestedDirPath)
    expect(dir).not.toBeNull()
    expect(dir?.kind).toBe(Kind.Directory)
  })

  it('mkdirRecursive "" should return root directory', () => {
    const fs = new FS()
    const dir = fs.mkdir('')
    expect(dir).toBe(fs.root)
  })

  it('mkdirRecursive "/" should return root directory', () => {
    const fs = new FS()
    const dir = fs.mkdir('/')
    expect(dir).toBe(fs.root)
  })

  it('should throw error when writing a file to a directory path', () => {
    const fs = new FS()
    const dirPath = '/testDir'
    fs.mkdir(dirPath)

    expect(() => fs.writeFile(dirPath, 'content')).toThrowError(`Path "${dirPath}" is a directory.`)
  })
})
