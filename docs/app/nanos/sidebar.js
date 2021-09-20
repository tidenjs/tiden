import "../components/sidebar.js"

import { connect, html, render, request, s } from "tiden"

export default function* sidebar(root) {
  render(html` <x-sidebar></x-sidebar> `, root)

  yield connect(root.children[0], {
    methods,
  })
}

const methods = s(`methodId`, `methods`, (methodId, methods) => {
  return methods.map((m) => {
    return {
      name: m.name,
      isSelected: m.name === methodId,
      link: {
        *onClick() {
          yield request(`set`, `methodId`, m.name)
        },
      },
    }
  })
})
