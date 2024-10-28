// Add missing `identify` method to the umami namespace,
// declared in "@types/umami".
declare namespace umami {
  interface umami {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    identify(data: { [key: string]: any }): void
  }
}
