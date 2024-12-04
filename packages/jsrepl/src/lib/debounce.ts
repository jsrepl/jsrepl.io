// Taken from https://github.com/sindresorhus/debounce with the following changes:
// - With `immediate: true` func is invoked immediately AND on the trailing edge of the timeout (1).
// - TypeScript types fixes.

type AnyFunction = (...arguments_: readonly unknown[]) => unknown

export type DebouncedFunction<F extends AnyFunction> = {
  (...arguments_: Parameters<F>): ReturnType<F> | undefined
  readonly isPending: boolean
  clear(): void
  flush(): void
  trigger(): void
}

/**
Creates a debounced function that delays execution until `wait` milliseconds have passed since its last invocation.

Set the `immediate` option to `true` to execute the function immediately at the start of the `wait` interval, preventing issues such as double-clicks on a button.

The returned function has the following methods:

- `.isPending` indicates whether the debounce delay is currently active.
- `.clear()` cancels any scheduled executions.
- `.flush()` if an execution is scheduled then it will be immediately executed and the timer will be cleared.
- `.trigger()` executes the function immediately and clears the timer if it was previously set.
*/
export function debounce<F extends AnyFunction>(
  function_: F,
  wait = 100,
  options: { immediate?: boolean } = {}
): DebouncedFunction<F> {
  if (typeof function_ !== 'function') {
    throw new TypeError(
      `Expected the first parameter to be a function, got \`${typeof function_}\`.`
    )
  }

  if (wait < 0) {
    throw new RangeError('`wait` must not be negative.')
  }

  // TODO: Deprecate the boolean parameter at some point.
  const { immediate } = typeof options === 'boolean' ? { immediate: options } : options

  let storedContext: unknown
  let storedArguments: unknown[]
  let timeoutId: NodeJS.Timeout | undefined
  let timestamp: number
  let result: unknown

  function run() {
    const callContext = storedContext
    const callArguments = storedArguments
    storedContext = undefined
    storedArguments = []
    result = function_.apply(callContext, callArguments)
    return result
  }

  function later() {
    const last = Date.now() - timestamp

    if (last < wait && last >= 0) {
      timeoutId = setTimeout(later, wait - last)
    } else {
      timeoutId = undefined

      // (1) - with `immediate: true` func is invoked immediately AND on the trailing edge of the timeout.
      //if (!immediate) {
      result = run()
      //}
    }
  }

  const debounced = function (this: unknown, ...arguments_: unknown[]) {
    if (
      storedContext &&
      this !== storedContext &&
      Object.getPrototypeOf(this) === Object.getPrototypeOf(storedContext)
    ) {
      throw new Error('Debounced method called with different contexts of the same prototype.')
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    storedContext = this
    storedArguments = arguments_
    timestamp = Date.now()

    const callNow = immediate && !timeoutId

    if (!timeoutId) {
      timeoutId = setTimeout(later, wait)
    }

    if (callNow) {
      result = run()
    }

    return result
  }

  Object.defineProperty(debounced, 'isPending', {
    get() {
      return timeoutId !== undefined
    },
  })

  debounced.clear = () => {
    if (!timeoutId) {
      return
    }

    clearTimeout(timeoutId)
    timeoutId = undefined
  }

  debounced.flush = () => {
    if (!timeoutId) {
      return
    }

    debounced.trigger()
  }

  debounced.trigger = () => {
    result = run()

    debounced.clear()
  }

  return debounced as unknown as DebouncedFunction<F>
}
