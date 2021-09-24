const regex = new RegExp(
  `(?<start>https://cdn.jsdelivr.net/npm/tiden@)(?<version>[^/]+)(?<end>/)`,
  `g`
)

export default function replaceAllTidenUrls(index, { version }) {
  index = index.replace(regex, `$1${version}$3`)

  return index
}
