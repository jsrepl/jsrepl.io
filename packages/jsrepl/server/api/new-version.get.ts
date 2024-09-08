import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userVersion = query.a
  const clientAppVersion = query.b

  const releases = await serverQueryContent(event, 'releases')
    .only(['title', 'silent', 'date', 'wip'])
    .sort({ date: 1 })
    .where({ wip: { $ne: true } })
    .find()

  const userReleaseIndex = userVersion
    ? releases.findIndex((release) => release.title === userVersion)
    : -1

  const clientAppReleaseIndex = clientAppVersion
    ? releases.findIndex((release) => release.title === clientAppVersion)
    : -1

  const releasesBetweenAB = releases.slice(
    userReleaseIndex + 1,
    clientAppReleaseIndex === -1 ? undefined : clientAppReleaseIndex
  )

  const hasNotableChangesBetweenAB = releasesBetweenAB.some((release) => !release.silent)

  return { hnc: hasNotableChangesBetweenAB }
})
