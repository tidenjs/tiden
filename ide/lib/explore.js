import getFilesReal from "./getFiles.js"

const matcher =
  /^(?<path>app(\/(?<namespace>.*))*\/(?<type>.*)s\/(?<name>.*))\/demo\.js$/

export default async function explore(getFiles = getFilesReal) {
  const files = await getFiles({ include: `**/demo.js` })

  return files
    .map((it) => it.match(matcher)?.groups)
    .filter((it) => it)
    .map((it) => mappers[it.type](it))
}

const mappers = {
  component: ({ namespace, type, name, path }) => ({
    id: `${namespace || ``}-${type}-${name}`,
    type: `component`,
    name,
    namespace: parseNamespace(namespace),
    path: `/project/${path}.js`,
    demoPath: `/project/${path}/demo.js`,
    cssPath: `/project/${path}/css.js`,
  }),
  nano: ({ namespace, type, name, path }) => ({
    id: `${namespace || ``}-${type}-${name}`,
    type: `nano`,
    name,
    namespace: parseNamespace(namespace),
    path: `/project/${path}.js`,
    demoPath: `/project/${path}/demo.js`,
  }),
  stream: ({ namespace, type, name, path }) => ({
    id: `${namespace || ``}-${type}-${name}`,
    type: `stream`,
    name,
    namespace: parseNamespace(namespace),
    path: `/project/${path}.js`,
  }),
  page: ({ namespace, type, name, path }) => ({
    id: `${namespace || ``}-${type}-${name}`,
    type: `page`,
    name,
    namespace: parseNamespace(namespace),
    path: `/project/${path}.js`,
    demoPath: `/project/${path}/demo.js`,
  }),
}

function parseNamespace(namespace = ``) {
  return namespace.split(`/`).filter((it) => !!it)
}
