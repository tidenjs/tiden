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

const filteredIds = s(
  `parts`,
  `filters`,
  `search`,
  (parts, filters, search) => {
    const ids = new Set()

    for (const part of parts) {
      if (matchFilter(part) && matchSearch(part)) {
        ids.add(part.id)
        if (part.parentId) {
          // also add any ancestor of matched part
          let parent = parts.find((it) => it.id === part.parentId)
          while (parent) {
            ids.add(parent.id)
            parent = parts.find((it) => it.id === parent.parentId)
          }
        }
      }

      function matchFilter(part) {
        return !!filters.find(
          (filter) =>
            filter.isSelected &&
            (filter.type === part.type ||
              (part.parentId &&
                parts.find((it) => it.id === part.parentId).type ===
                  filter.type))
        )
      }
      function matchSearch(part) {
        return !search || fuzzy(`${part.type} ${buildSearch(part)}`, search)
      }
    }

    return [...ids]

    function buildSearch(part) {
      return `${
        part.parentId
          ? buildSearch(parts.find((it) => it.id === part.parentId))
          : ``
      } ${part.name}`
    }
  }
)

const items = s(
  `parts`,
  filteredIds,
  `expanded`,
  `search`,
  (allParts, ids, expanded, search) => {
    // its all a flat list at this point, so we need to build a hierarchy,
    // and re-include parents that were previously filtered

    const parts = ids.map((id) => ({ ...allParts.find((it) => it.id === id) }))
    parts.forEach(connectChildren)

    const roots = parts.filter((it) => !it.parentId).map(partToItem)

    return roots

    function connectChildren(part) {
      part.children = parts.filter((it) => it.parentId === part.id)
      part.children.forEach((child) => (child.parent = part))
    }

    function partToItem(part) {
      const isExpanded = !!search || expanded.includes(part.id)

      return {
        text: emph(part.name),
        type: part.type,
        isExpanded,
        children: part.children.map(partToItem),
        hasChildren: part.children.length > 0,
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
    }

    function emph(text) {
      if (!search) {
        return text
      }

      let out = text
      for (const s of search.split(` `)) {
        if (!s) {
          continue
        }
        const i = out.indexOf(s)
        if (i !== -1) {
          out =
            out.slice(0, i) +
            `*` +
            out.slice(i, i + s.length) +
            `*` +
            out.slice(i + s.length)
        }
      }

      return out
    }
  }
)

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

function fuzzy(str, terms) {
  let index = 0

  for (const s of terms.split(` `)) {
    index = str.indexOf(s, index)

    if (index === -1) {
      return false
    }
  }

  return true
}
