import fastDeepEqual from 'fast-deep-equal'

export function shallowEqual(a: unknown, b: unknown) {
  if (a === b) {
    return true
  }

  if (!(a instanceof Object) || !(b instanceof Object)) {
    return false
  }

  const aKeys = Object.keys(a)
  const aKeysLength = aKeys.length

  for (let i = 0; i < aKeysLength; i++) {
    const key = aKeys[i]!
    if (!(key in b)) {
      return false
    }
  }

  for (let i = 0; i < aKeysLength; i++) {
    const key = aKeys[i]!
    const aValue = (a as Record<string, unknown>)[key]
    const bValue = (b as Record<string, unknown>)[key]
    if (aValue !== bValue) {
      return false
    }
  }

  return aKeysLength === Object.keys(b).length
}

export function deepEqual(a: unknown, b: unknown) {
  return fastDeepEqual(a, b)
}
