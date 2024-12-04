type FilePath = string
type FileContent = string

export class FileCache<T> {
  #cache = new Map<FilePath, Map<FileContent, T>>()
  #maxSizePerFile: number
  #maxSizePerContent: number

  constructor(maxSizePerFile: number = 5, maxSizePerContent: number = 5) {
    this.#maxSizePerFile = maxSizePerFile
    this.#maxSizePerContent = maxSizePerContent
  }

  get(filePath: string, content: string) {
    return this.#cache.get(filePath)?.get(content)
  }

  set(filePath: string, content: string, value: T) {
    let contentCache = this.#cache.get(filePath)
    if (!contentCache) {
      contentCache = new Map<FileContent, T>()
      this.#cache.set(filePath, contentCache)
      this.#enforceMaxSize(this.#cache, this.#maxSizePerFile)
    }

    contentCache.set(content, value)
    this.#enforceMaxSize(contentCache, this.#maxSizePerContent)
  }

  delete(filePath: string, content?: string) {
    if (content === undefined) {
      this.#cache.delete(filePath)
    } else {
      this.#cache.get(filePath)?.delete(content)
    }
  }

  #enforceMaxSize(map: Map<unknown, unknown>, maxSize: number) {
    while (map.size > maxSize) {
      map.delete(map.keys().next().value as string)
    }
  }
}
