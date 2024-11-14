export class Cache<T> {
  #cache = new Map<string, T>()
  #maxSize = 5

  #getKey(code: string, filePath: string) {
    return `${code}:${filePath}`
  }

  get(code: string, filePath: string) {
    return this.#cache.get(this.#getKey(code, filePath))
  }

  set(code: string, filePath: string, value: T) {
    this.#cache.set(this.#getKey(code, filePath), value)
    while (this.#cache.size > this.#maxSize) {
      this.#cache.delete(this.#cache.keys().next().value as string)
    }
  }
}
