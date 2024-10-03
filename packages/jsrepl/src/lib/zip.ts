// https://github.com/vuejs/repl/blob/2daac718a212e61d200cecdfc3623535bd0196a9/src/utils.ts
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'

export function utoa(data: string): string {
  const buffer = strToU8(data)
  const zipped = zlibSync(buffer, { level: 9 })
  const binary = strFromU8(zipped, true)
  return btoa(binary)
}

export function atou(base64: string): string {
  const binary = atob(base64)
  const buffer = strToU8(binary, true)
  const unzipped = unzlibSync(buffer)
  return strFromU8(unzipped)
}
