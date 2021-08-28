export default function url(strings, ...args) {
  strings = [...strings]
  if (
    (args.length === 0 || !args[0].startsWith(`http`)) &&
    (strings.length === 0 || !strings[0].startsWith(`http`))
  ) {
    strings.unshift(document.location.origin)
    args.unshift(``)
  }

  return (query = {}) => {
    const urlStr =
      args.map((arg, i) => `${strings[i]}${encodeURIComponent(arg)}`).join(``) +
      strings[strings.length - 1]

    const u = new URL(urlStr)

    for (const k in query) {
      let values = query[k]
      if (!Array.isArray(values)) {
        u.searchParams.append(k, values)
      } else {
        for (const v of values) {
          u.searchParams.append(k, v)
        }
      }
    }

    return u
  }
}
