import getFiles from "./getFiles.js"

const matcher =
  /^(?<path>app(\/(?<namespace>.*))*\/(?<type>.*)s\/(?<id>.*))\/demo\.js$/

export default async function explore(getFiles = getFiles) {
  const files = await getFiles({ include: `**/demo.js` })

  return files
    .map((it) => it.match(matcher)?.groups)
    .filter((it) => it)
    .map((it) => mappers[it.type](it))
    .reduce(organizer, {})
}

const mappers = {
  component: ({ namespace, type, id, path }) => ({
    type: `component`,
    id,
    namespace: namespace || ``,
    path: `${path}.js`,
    demoPath: `${path}/demo.js`,
    cssPath: `${path}/css.js`,
  }),
  nano: ({ namespace, type, id, path }) => ({
    type: `nano`,
    id,
    namespace: namespace || ``,
    path: `${path}.js`,
    demoPath: `${path}/demo.js`,
  }),
  stream: ({ namespace, type, id, path }) => ({
    type: `stream`,
    id,
    namespace: namespace || ``,
    path: `${path}.js`,
  }),
  page: ({ namespace, type, id, path }) => ({
    type: `page`,
    id,
    namespace: namespace || ``,
    path: `${path}.js`,
    demoPath: `${path}/demo.js`,
  }),
}

function organizer(obj, entry) {
  const plural = `${entry.type}s`
  obj[plural] ||= []
  obj[plural].push(entry)
  return obj
}
