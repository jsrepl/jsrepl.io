export function assert(condition: boolean, message: string) {
  if (process.env.NODE_ENV !== 'production') {
    if (!condition) {
      throw new Error(`[DEV ONLY] Assertion failed: ${message}`)
    }
  }
}
