// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
// [, major, minor, patch, prerelease, buildmetadata]
const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

export function parseVersion(version: string): {
  major: number
  minor: number
  patch: number
  prerelease: string | undefined
  buildmetadata: string | undefined
} | null {
  const match = version.match(semverRegex)
  if (!match) {
    return null
  }

  const [, major, minor, patch, prerelease, buildmetadata] = match
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease,
    buildmetadata,
  }
}
