export interface CssUnescapeOptions {
  slashZero?: boolean
}

// Taken from https://github.com/icebreaker-trash/CSS.unescape/blob/8e3c61c185c3f34db6ef881a82bc74d4efe939cf/src/index.ts
export const cssUnescape = (
  str: string,
  options: CssUnescapeOptions = {
    slashZero: true,
  }
) => {
  const string = options?.slashZero ? str.replaceAll('�', '\0') : str
  return string.replaceAll(/\\([\dA-Fa-f]{1,6}[\t\n\f\r ]?|[\S\s])/g, (match) => {
    return match.length > 2
      ? String.fromCodePoint(Number.parseInt(match.slice(1).trim(), 16))
      : match[1]
  })
}
