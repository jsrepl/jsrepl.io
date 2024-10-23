// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
// https://github.com/tc39/proposal-promise-with-resolvers
export function defer<T>(): PromiseWithResolvers<T> {
  const out = {} as PromiseWithResolvers<T>
  out.promise = new Promise((resolve, reject) => {
    out.resolve = resolve
    out.reject = reject
  })
  return out
}
