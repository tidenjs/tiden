const semver =
  /^(((?<major>[0-9]+)\.(?<minor>[0-9]+)\.(?<patch>[0-9]+)(?:-(?<prerelease>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)$/

const regex = new RegExp(
  `https://cdn.jsdelivr.net/npm/tiden@(?<version>[^/]+)/`
)

export default function getOldVersion(index) {
  const match = index.match(regex)

  if (!match) {
    throw new Error(`Could not extract old version info`)
  }

  const result = match.groups.version.match(semver).groups

  return {
    all: match.groups.version,
    major: parseInt(result.major, 10),
    minor: parseInt(result.minor, 10),
    patch: parseInt(result.patch, 10),
    prerelease: result.prerelease,
    build: result.build,
  }
}
