export default function addNamespace(command, namespace) {
  const [name, args] = command

  if (args === undefined) {
    return [name]
  }

  const out = { ...args }

  if (out.hasOwnProperty(`namespace`)) {
    out.namespace = concat(namespace, args.namespace)
  }
  return [name, out]
}

function concat(...nss) {
  return nss.filter((it) => !!it).join(`/`)
}
