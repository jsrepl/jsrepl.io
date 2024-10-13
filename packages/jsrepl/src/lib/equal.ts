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
    if (!(aKeys[i] in b)) {
      return false
    }
  }

  for (let i = 0; i < aKeysLength; i++) {
    if ((a as Record<string, unknown>)[aKeys[i]] !== (b as Record<string, unknown>)[aKeys[i]]) {
      return false
    }
  }

  return aKeysLength === Object.keys(b).length
}

export function deepEqual(a: unknown, b: unknown) {
  return fastDeepEqual(a, b)
}
