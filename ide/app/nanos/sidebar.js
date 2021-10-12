import "../components/sidebar.js"

import { connect, request, s, simpleStream } from "tiden"

import typeToIcon from "../typeToIcon.js"

export default function* sidebar(root) {
  const el = document.createElement(`x-sidebar`)
  root.appendChild(el)

  yield simpleStream(`expanded`, [])

  yield connect(el, {
    items,
  })
}

const items = s(`parts`, `expanded`, (parts, expanded) => {
  const data = {
    children: [],
  }

  data.children = parts.map((part) => {
    const isExpanded = expanded.includes(part.id)

    let children

    if (part.type === `component`) {
      children = Object.keys(part.examples).map((example) => {
        return {
          title: example,
          isExpanded: false,
        }
      })
    }

    return {
      title: part.name,
      theme: typeToTheme(part.type),
      isExpanded,
      children,
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

function typeToTheme(type) {
  switch (type) {
    case `component`:
      return `earth`
    case `nano`:
      return `gray`
    case `stream`:
      return `blue`
    case `page`:
      return `white`
  }
}
