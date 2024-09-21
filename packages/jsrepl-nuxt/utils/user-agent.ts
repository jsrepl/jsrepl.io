// https://github.com/omrilotan/isbot/blob/66cdef17771210f8b5c7c3a25a0994e84fbab8fc/src/index.ts#L31
export function isBot(userAgent: string): boolean {
  return /bot|crawl|http|lighthouse|scan|search|spider|Google-InspectionTool|Mediapartners-Google/i.test(
    userAgent
  )
}
