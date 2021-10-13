import "../components/sidebar.js"

import { connect, request, s, simpleStream } from "tiden"

export default function* sidebar(root) {
  const el = document.createElement(`x-sidebar`)
  root.appendChild(el)

  yield simpleStream(`search`, ``)
  yield simpleStream(`expanded`, [])
  yield simpleStream(`filters`, [
    {
      type: `component`,
      name: `Components`,
      isSelected: true,
    },
    {
      type: `stream`,
      name: `Streams`,
      isSelected: true,
    },
    {
      type: `nano`,
      name: `Nanos`,
      isSelected: true,
    },
    {
      type: `page`,
      name: `Pages`,
      isSelected: true,
    },
  ])

  yield connect(el, {
    items,
    filters,
    search,
  })
}

const search = s(`search`, (search) => {
  return {
    text: search,
    *callback(newSearch) {
      yield request(`set`, `search`, newSearch)
    },
  }
})

const filters = s(`filters`, (filters) => {
  return filters.map((filter) => {
    return {
      ...filter,
      *toggle() {
        yield request(
          `set`,
          `filters`,
          filters.map((it) =>
            it.type === filter.type ? { ...it, isSelected: !it.isSelected } : it
          )
        )
      },
    }
  })
})

const allItems = s(`parts`, `expanded`, (parts, expanded) => {
  const items = parts.map((part) => {
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
      type: part.type,
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

  return items
})

const items = s(allItems, `filters`, `search`, (items, filters, search) => {
  return items.filter(
    (item) =>
      !!filters.find(
        (filter) => filter.type === item.type && filter.isSelected
      ) &&
      (!search || fuzzy(item, search))
  )
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
      return `dust`
    case `stream`:
      return `water`
    case `page`:
      return `pig`
  }
}

function fuzzy(text, search) {
  return !search.split(` `).find((s) => !text.includes(s))
}
