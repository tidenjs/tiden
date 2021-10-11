import "../components/sidebar.js"

import { connect, request, s, simpleStream } from "tiden"

export default function* sidebar(root) {
  const el = document.createElement(`x-sidebar`)
  root.appendChild(el)

  yield simpleStream(`expanded`, [])

  yield connect(el, {
    data,
  })
}

const data = s(`parts`, `expanded`, (parts, expanded) => {
  const data = {
    parts: [],
    namespaces: {},
  }

  parts = parts.map((part) => {
    const isExpanded = expanded.includes(part.id)

    return {
      ...part,
      isExpanded,
      *toggle() {
        if (!isExpanded) {
          yield request(`set`, `expanded`, [...expanded, part.id])
        } else {
          yield request(
            `set`,
            `expanded`,
            expanded.filter((it) => it !== part.id)
          )
        }
      },
    }
  })

  for (const part of parts) {
    addPartToNamespace(part, data, part.namespace)
  }

  return data
})

function addPartToNamespace(part, obj, namespace) {
  if (namespace.length === 0) {
    obj.parts.push(part)
  } else {
    if (!obj.namespaces[namespace[0]]) {
      obj.namespaces[namespace[0]] = {
        parts: [],
        namespaces: {},
      }
    }
    addPartToNamespace(part, obj.namespaces[namespace[0]], namespace.slice(1))
  }
}
